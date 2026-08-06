/*
# Complete Donation Workflow: Distribution, Admin Verification, Per-Donation Certificates

## Purpose
Adds the missing steps of the end-to-end donation workflow:
  Step 6 — Food Distribution (photo + people served + location + notes)
  Step 7 — Admin Verification (approve / reject with reason)
  Step 8 — Per-Donation Certificate Generation (gated, one per donation)
  Step 9 — Volunteer Rewards (+20 points, +1 delivery, badge update)

## Changes

### 1. donation_handovers — new columns
- distribution_photo_url (text) — uploaded distribution photo
- distribution_people_served (integer) — number of people served
- distribution_location (text) — distribution location text
- distribution_notes (text) — optional notes
- distribution_at (timestamptz) — when distribution was recorded
- admin_verification_status (text, default 'pending') — 'pending' | 'approved' | 'rejected'
- admin_verified_at (timestamptz) — when admin approved/rejected
- admin_verified_by (uuid, FK profiles) — which admin
- admin_rejection_reason (text) — reason if rejected
- certificate_generated (boolean, default false) — whether per-donation cert was generated
- certificate_id (uuid, FK certificates) — the per-donation certificate

### 2. food_donations — new columns
- distribution_photo_url (text)
- distribution_people_served (integer)
- distribution_location (text)
- distribution_notes (text)
- admin_verification_status (text, default 'pending')
- admin_rejection_reason (text)
- certificate_generated (boolean, default false)

### 3. Handover status enum expansion
The handover_status text column now also supports:
  'distributed'            — Step 6 complete, waiting for admin
  'admin_approved'          — Step 7 approved
  'admin_rejected'          — Step 7 rejected
  'certificate_generated'   — Step 8 complete

### 4. RLS
All new columns inherit existing policies on their parent tables.
No new tables needed — we reuse donation_handovers and certificates.

## Security
- No data-destructive operations; all statements are idempotent.
- RLS already enabled on donation_handovers and food_donations.
*/

-- ── donation_handovers: add distribution + admin verification + certificate columns ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='donation_handovers' AND column_name='distribution_photo_url') THEN
    ALTER TABLE donation_handovers ADD COLUMN distribution_photo_url text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='donation_handovers' AND column_name='distribution_people_served') THEN
    ALTER TABLE donation_handovers ADD COLUMN distribution_people_served integer;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='donation_handovers' AND column_name='distribution_location') THEN
    ALTER TABLE donation_handovers ADD COLUMN distribution_location text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='donation_handovers' AND column_name='distribution_notes') THEN
    ALTER TABLE donation_handovers ADD COLUMN distribution_notes text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='donation_handovers' AND column_name='distribution_at') THEN
    ALTER TABLE donation_handovers ADD COLUMN distribution_at timestamptz;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='donation_handovers' AND column_name='admin_verification_status') THEN
    ALTER TABLE donation_handovers ADD COLUMN admin_verification_status text NOT NULL DEFAULT 'pending';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='donation_handovers' AND column_name='admin_verified_at') THEN
    ALTER TABLE donation_handovers ADD COLUMN admin_verified_at timestamptz;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='donation_handovers' AND column_name='admin_verified_by') THEN
    ALTER TABLE donation_handovers ADD COLUMN admin_verified_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='donation_handovers' AND column_name='admin_rejection_reason') THEN
    ALTER TABLE donation_handovers ADD COLUMN admin_rejection_reason text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='donation_handovers' AND column_name='certificate_generated') THEN
    ALTER TABLE donation_handovers ADD COLUMN certificate_generated boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='donation_handovers' AND column_name='certificate_id') THEN
    ALTER TABLE donation_handovers ADD COLUMN certificate_id uuid REFERENCES certificates(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ── food_donations: mirror columns for quick filtering ──────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_donations' AND column_name='distribution_photo_url') THEN
    ALTER TABLE food_donations ADD COLUMN distribution_photo_url text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_donations' AND column_name='distribution_people_served') THEN
    ALTER TABLE food_donations ADD COLUMN distribution_people_served integer;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_donations' AND column_name='distribution_location') THEN
    ALTER TABLE food_donations ADD COLUMN distribution_location text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_donations' AND column_name='distribution_notes') THEN
    ALTER TABLE food_donations ADD COLUMN distribution_notes text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_donations' AND column_name='admin_verification_status') THEN
    ALTER TABLE food_donations ADD COLUMN admin_verification_status text NOT NULL DEFAULT 'pending';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_donations' AND column_name='admin_rejection_reason') THEN
    ALTER TABLE food_donations ADD COLUMN admin_rejection_reason text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='food_donations' AND column_name='certificate_generated') THEN
    ALTER TABLE food_donations ADD COLUMN certificate_generated boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- ── Indexes for the new workflow columns ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_donation_handovers_admin_status ON donation_handovers(admin_verification_status);
CREATE INDEX IF NOT EXISTS idx_food_donations_admin_status ON food_donations(admin_verification_status);
CREATE INDEX IF NOT EXISTS idx_food_donations_cert_generated ON food_donations(certificate_generated);

-- ── certificates: add per-donation link column ──────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='donation_id') THEN
    ALTER TABLE certificates ADD COLUMN donation_id uuid REFERENCES food_donations(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='donor_name') THEN
    ALTER TABLE certificates ADD COLUMN donor_name text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='donation_code') THEN
    ALTER TABLE certificates ADD COLUMN donation_code text;
  END IF;
END $$;

-- Unique constraint: one certificate per donation
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='certificates_donation_id_unique') THEN
    ALTER TABLE certificates ADD CONSTRAINT certificates_donation_id_unique UNIQUE (donation_id);
  END IF;
END $$;
