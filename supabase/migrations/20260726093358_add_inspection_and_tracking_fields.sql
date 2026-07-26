-- Food Quality Inspection & Volunteer Tracking upgrade
-- Adds: photo upload, star rating, rejection reason, checklist, volunteer location tracking,
-- and links inspections to the specific pickup. Non-destructive (ADD COLUMN only).

-- ── food_quality_inspections: new inspection fields ───────────────────────
ALTER TABLE food_quality_inspections
  ADD COLUMN IF NOT EXISTS pickup_id uuid REFERENCES pickups(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rating smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS photo_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS rejection_reason text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS checklist jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS inspector_lat double precision,
  ADD COLUMN IF NOT EXISTS inspector_lng double precision;

ALTER TABLE food_quality_inspections
  DROP CONSTRAINT IF EXISTS rating_range;
ALTER TABLE food_quality_inspections
  ADD CONSTRAINT rating_range CHECK (rating >= 0 AND rating <= 5);

CREATE INDEX IF NOT EXISTS idx_inspections_pickup ON food_quality_inspections(pickup_id);
CREATE INDEX IF NOT EXISTS idx_inspections_donation ON food_quality_inspections(donation_id);

-- ── pickups: live tracking + granular status timestamps ──────────────────
ALTER TABLE pickups
  ADD COLUMN IF NOT EXISTS current_lat double precision,
  ADD COLUMN IF NOT EXISTS current_lng double precision,
  ADD COLUMN IF NOT EXISTS tracking_status text NOT NULL DEFAULT 'accepted',
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS on_the_way_at timestamptz;

ALTER TABLE pickups
  DROP CONSTRAINT IF EXISTS tracking_status_values;
ALTER TABLE pickups
  ADD CONSTRAINT tracking_status_values
  CHECK (tracking_status IN ('accepted','pickup_started','picked_up','on_the_way','delivered','cancelled'));

CREATE INDEX IF NOT EXISTS idx_pickups_tracking_status ON pickups(tracking_status);
CREATE INDEX IF NOT EXISTS idx_pickups_volunteer_status ON pickups(volunteer_id, status);

-- ── Storage bucket for inspection photos (public read, auth write) ────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-photos', 'food-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "food_photos_read" ON storage.objects;
CREATE POLICY "food_photos_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'food-photos');

DROP POLICY IF EXISTS "food_photos_insert" ON storage.objects;
CREATE POLICY "food_photos_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'food-photos');

DROP POLICY IF EXISTS "food_photos_update" ON storage.objects;
CREATE POLICY "food_photos_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'food-photos') WITH CHECK (bucket_id = 'food-photos');
