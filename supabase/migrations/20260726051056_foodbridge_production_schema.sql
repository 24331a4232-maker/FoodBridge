/*
# FoodBridge Production Schema — Database-Driven Platform

## Summary
This migration upgrades the FoodBridge schema to support a fully database-driven
NGO platform with no hardcoded data. It adds tracking columns, volunteer metadata,
food quality inspections, QR verification records, and analytics infrastructure.

## Changes

### 1. profiles — new columns
- `last_login` (timestamptz, nullable) — updated on each successful sign-in
- `availability` (text, default 'offline') — volunteer availability: 'available' | 'on_delivery' | 'offline'
- `current_location_lat` (numeric, nullable) — volunteer's last known latitude
- `current_location_lng` (numeric, nullable) — volunteer's last known longitude
- `rating` (numeric, default 0) — volunteer average rating (0-5)
- `assigned_deliveries` (integer, default 0) — count of currently assigned deliveries
- `completed_deliveries_count` (integer, default 0) — redundant with total_deliveries for clarity but kept for the volunteer-specific view

### 2. food_donations — new columns
- `assigned_volunteer_id` (uuid, nullable, FK to profiles) — the volunteer assigned to this donation
- `delivery_time` (timestamptz, nullable) — when the delivery was completed
- `quality_result` (text, nullable) — 'approved' | 'rejected' | 'pending'
- `certificate_id` (uuid, nullable, FK to certificates) — certificate generated for this donation
- `qr_verified` (boolean, default false) — whether the QR code has been verified

### 3. food_quality_inspections — NEW TABLE
Stores inspection results for each donation.
- `id` (uuid PK)
- `donation_id` (uuid FK to food_donations, NOT NULL)
- `inspector_id` (uuid FK to profiles, nullable) — the volunteer/admin who inspected
- `inspector_name` (text) — denormalized inspector name
- `freshness` (text) — 'fresh' | 'good' | 'average' | 'stale'
- `packaging` (text) — 'excellent' | 'good' | 'fair' | 'poor'
- `temperature` (text) — e.g. "4°C"
- `expiry_check` (text) — 'pass' | 'fail'
- `approval_status` (text, default 'pending') — 'approved' | 'pending' | 'rejected'
- `notes` (text, default '')
- `created_at` (timestamptz, default now()) — inspection time

### 4. qr_verifications — NEW TABLE
Stores QR code records, one per certificate, prevents duplicates.
- `id` (uuid PK)
- `certificate_id` (uuid FK to certificates, NOT NULL, UNIQUE) — one QR per certificate
- `qr_code` (text, UNIQUE, NOT NULL) — the unique QR code string (certificate number or unique ID)
- `verify_url` (text) — the verification URL embedded in the QR
- `is_verified` (boolean, default false) — whether someone has scanned/verified it
- `verified_at` (timestamptz, nullable) — when it was verified
- `verified_by` (uuid, nullable, FK to profiles) — who verified it
- `created_at` (timestamptz, default now())

### 5. RLS Policies
- food_quality_inspections: authenticated users can read all, insert own, update own
- qr_verifications: authenticated users can read all, insert, update (for verification)

### 6. Indexes
- food_donations(assigned_volunteer_id)
- food_donations(status)
- food_donations(donor_id)
- food_quality_inspections(donation_id)
- qr_verifications(certificate_id)
- qr_verifications(qr_code)
- profiles(role)
- donation_events(created_at DESC)
- donation_events(donation_id)

## Security
- RLS enabled on all new tables
- Ownership-scoped policies where appropriate
- No data-destructive operations
*/

-- ── profiles: add volunteer + login tracking columns ──────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='last_login') THEN
    ALTER TABLE profiles ADD COLUMN last_login timestamptz;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='availability') THEN
    ALTER TABLE profiles ADD COLUMN availability text NOT NULL DEFAULT 'offline';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='current_location_lat') THEN
    ALTER TABLE profiles ADD COLUMN current_location_lat numeric;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='current_location_lng') THEN
    ALTER TABLE profiles ADD COLUMN current_location_lng numeric;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='rating') THEN
    ALTER TABLE profiles ADD COLUMN rating numeric NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='assigned_deliveries') THEN
    ALTER TABLE profiles ADD COLUMN assigned_deliveries integer NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='completed_deliveries_count') THEN
    ALTER TABLE profiles ADD COLUMN completed_deliveries_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ── food_donations: add tracking columns ────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_donations' AND column_name='assigned_volunteer_id') THEN
    ALTER TABLE food_donations ADD COLUMN assigned_volunteer_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_donations' AND column_name='delivery_time') THEN
    ALTER TABLE food_donations ADD COLUMN delivery_time timestamptz;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_donations' AND column_name='quality_result') THEN
    ALTER TABLE food_donations ADD COLUMN quality_result text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_donations' AND column_name='certificate_id') THEN
    ALTER TABLE food_donations ADD COLUMN certificate_id uuid REFERENCES certificates(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_donations' AND column_name='qr_verified') THEN
    ALTER TABLE food_donations ADD COLUMN qr_verified boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- ── food_quality_inspections table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS food_quality_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid NOT NULL REFERENCES food_donations(id) ON DELETE CASCADE,
  inspector_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  inspector_name text NOT NULL DEFAULT '',
  freshness text NOT NULL DEFAULT 'good',
  packaging text NOT NULL DEFAULT 'good',
  temperature text NOT NULL DEFAULT '',
  expiry_check text NOT NULL DEFAULT 'pass',
  approval_status text NOT NULL DEFAULT 'pending',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE food_quality_inspections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_inspections" ON food_quality_inspections;
CREATE POLICY "select_inspections"
  ON food_quality_inspections FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_inspections" ON food_quality_inspections;
CREATE POLICY "insert_inspections"
  ON food_quality_inspections FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = inspector_id);

DROP POLICY IF EXISTS "update_inspections" ON food_quality_inspections;
CREATE POLICY "update_inspections"
  ON food_quality_inspections FOR UPDATE
  TO authenticated USING (auth.uid() = inspector_id) WITH CHECK (auth.uid() = inspector_id);

-- ── qr_verifications table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qr_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id uuid NOT NULL UNIQUE REFERENCES certificates(id) ON DELETE CASCADE,
  qr_code text NOT NULL UNIQUE,
  verify_url text NOT NULL DEFAULT '',
  is_verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  verified_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE qr_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_qr" ON qr_verifications;
CREATE POLICY "select_qr"
  ON qr_verifications FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_qr" ON qr_verifications;
CREATE POLICY "insert_qr"
  ON qr_verifications FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_qr" ON qr_verifications;
CREATE POLICY "update_qr"
  ON qr_verifications FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_food_donations_volunteer ON food_donations(assigned_volunteer_id);
CREATE INDEX IF NOT EXISTS idx_food_donations_status ON food_donations(status);
CREATE INDEX IF NOT EXISTS idx_food_donations_donor ON food_donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_food_donations_created ON food_donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_quality_inspections_donation ON food_quality_inspections(donation_id);
CREATE INDEX IF NOT EXISTS idx_qr_verifications_cert ON qr_verifications(certificate_id);
CREATE INDEX IF NOT EXISTS idx_qr_verifications_code ON qr_verifications(qr_code);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_donation_events_created ON donation_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donation_events_donation ON donation_events(donation_id);
CREATE INDEX IF NOT EXISTS idx_certificates_volunteer ON certificates(volunteer_id);
