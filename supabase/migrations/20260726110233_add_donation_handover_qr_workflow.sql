/*
# Donation Handover QR Workflow

## Purpose
Adds a secure, per-donation QR-based handover workflow so a volunteer can
scan a donor's QR code at pickup, verify the donation, complete a food
quality inspection, and confirm pickup. The QR becomes invalid after
pickup to prevent reuse.

## 1. New Table: donation_handovers
Stores the handover record for each donation — one row per donation.
- `id` (uuid PK)
- `donation_id` (uuid, FK to food_donations, UNIQUE NOT NULL) — one handover per donation
- `qr_code` (text, UNIQUE NOT NULL) — the unique QR payload string
- `qr_code_url` (text) — data-URL of the rendered QR image (optional convenience)
- `donor_id` (uuid, FK to profiles) — snapshot of donor
- `volunteer_id` (uuid, FK to profiles, nullable) — assigned volunteer
- `qr_verified` (boolean, default false) — whether the QR has been scanned/verified
- `qr_verified_at` (timestamptz, nullable) — verification timestamp
- `pickup_confirmed` (boolean, default false) — whether pickup was confirmed
- `pickup_confirmed_at` (timestamptz, nullable) — pickup confirmation timestamp
- `quality_report` (jsonb, nullable) — full food quality inspection report
- `inspection_rating` (integer, nullable) — 1-5 star rating
- `pickup_photo_url` (text, nullable) — uploaded pickup photo
- `handover_status` (text, NOT NULL DEFAULT 'waiting_volunteer') — workflow status:
    waiting_volunteer | volunteer_assigned | qr_verified | quality_approved |
    quality_rejected | picked_up | delivered | cancelled
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

## 2. food_donations: add handover columns
- `handover_status` (text, nullable) — mirrors donation_handovers.handover_status for quick filtering
- `pickup_confirmed_at` (timestamptz, nullable) — when pickup was confirmed

## 3. Security (RLS)
- donation_handovers: authenticated users can read all (donor, volunteer, admin
  all need visibility). Inserts allowed for the donor (creating their handover) or
  for any authenticated user (volunteer updating assignment/verification). Updates
  allowed for authenticated users (volunteer/admin updating the workflow).
- food_donations new columns inherit existing policies.

## 4. Indexes
- donation_handovers(donation_id)
- donation_handovers(qr_code)
- donation_handovers(volunteer_id)
- donation_handovers(handover_status)

## 5. Notes
- The QR payload encodes donation id, donor id, donor name, food name, category,
  quantity, pickup address, created datetime, and status. The frontend renders this
  payload into a QR image and stores the payload string in `qr_code`.
- After `pickup_confirmed` becomes true, the frontend treats the QR as invalid.
- No data-destructive operations; all statements are idempotent.
*/

-- ── donation_handovers table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donation_handovers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid NOT NULL UNIQUE REFERENCES food_donations(id) ON DELETE CASCADE,
  qr_code text NOT NULL UNIQUE,
  qr_code_url text,
  donor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  volunteer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  qr_verified boolean NOT NULL DEFAULT false,
  qr_verified_at timestamptz,
  pickup_confirmed boolean NOT NULL DEFAULT false,
  pickup_confirmed_at timestamptz,
  quality_report jsonb,
  inspection_rating integer,
  pickup_photo_url text,
  handover_status text NOT NULL DEFAULT 'waiting_volunteer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE donation_handovers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_handovers" ON donation_handovers;
CREATE POLICY "select_handovers"
  ON donation_handovers FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_handovers" ON donation_handovers;
CREATE POLICY "insert_handovers"
  ON donation_handovers FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_handovers" ON donation_handovers;
CREATE POLICY "update_handovers"
  ON donation_handovers FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_handovers" ON donation_handovers;
CREATE POLICY "delete_handovers"
  ON donation_handovers FOR DELETE
  TO authenticated USING (true);

-- ── food_donations: handover columns ───────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_donations' AND column_name='handover_status') THEN
    ALTER TABLE food_donations ADD COLUMN handover_status text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_donations' AND column_name='pickup_confirmed_at') THEN
    ALTER TABLE food_donations ADD COLUMN pickup_confirmed_at timestamptz;
  END IF;
END $$;

-- ── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_donation_handovers_donation ON donation_handovers(donation_id);
CREATE INDEX IF NOT EXISTS idx_donation_handovers_qr_code ON donation_handovers(qr_code);
CREATE INDEX IF NOT EXISTS idx_donation_handovers_volunteer ON donation_handovers(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_donation_handovers_status ON donation_handovers(handover_status);

-- ── updated_at trigger ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_donation_handovers_updated ON donation_handovers;
CREATE TRIGGER trg_donation_handovers_updated
  BEFORE UPDATE ON donation_handovers
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
