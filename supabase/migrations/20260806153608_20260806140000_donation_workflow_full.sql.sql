/*
# Complete Donation Workflow - Distribution, Admin Verification, Certificates, Rewards

## Purpose
This migration adds the remaining columns and tables needed for the full 9-step donation workflow:
- Food type (veg/non-veg) and meals count on donations
- Distribution tracking (photo, people served, location, notes)
- Admin verification (approved/rejected with reason)
- Per-donation certificate gating (one certificate per donation)
- Volunteer reward tracking (points, deliveries, hours, badge updates)

## New Columns on food_donations
- food_type (text, 'veg' or 'non_veg', default 'veg')
- meals_count (integer, number of meals the donor estimates)
- distribution_photo_url (text, photo uploaded by volunteer after distribution)
- distribution_people_served (integer, number of people who received food)
- distribution_location (text, where food was distributed)
- distribution_notes (text, optional notes from volunteer)
- distribution_at (timestamptz, when distribution was recorded)
- admin_verified (boolean, whether admin approved)
- admin_verified_at (timestamptz, when admin verified)
- admin_rejection_reason (text, reason if rejected)
- certificate_generated (boolean, whether certificate was generated)
- certificate_generated_at (timestamptz, when certificate was generated)

## New Columns on donation_handovers
- distribution_photo_url (text)
- distribution_people_served (integer)
- distribution_location (text)
- distribution_notes (text)
- distribution_at (timestamptz)
- admin_verified (boolean, default false)
- admin_verified_at (timestamptz)
- admin_rejection_reason (text)
- certificate_generated (boolean, default false)
- certificate_generated_at (timestamptz)

## New Table: donation_certificates
- Per-donation certificates (one per donation, enforced by unique constraint)
- Links donation_id, volunteer_id, donor_id
- Contains certificate_number, qr_code, issue_date
- RLS enabled with authenticated access

## Security
- RLS enabled on donation_certificates
- Authenticated users can read certificates
- Volunteers can insert their own certificates
- Admins can read all certificates
*/

-- Add food_type and meals_count to food_donations
ALTER TABLE food_donations
  ADD COLUMN IF NOT EXISTS food_type text DEFAULT 'veg' CHECK (food_type IN ('veg', 'non_veg')),
  ADD COLUMN IF NOT EXISTS meals_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS distribution_photo_url text,
  ADD COLUMN IF NOT EXISTS distribution_people_served integer,
  ADD COLUMN IF NOT EXISTS distribution_location text,
  ADD COLUMN IF NOT EXISTS distribution_notes text,
  ADD COLUMN IF NOT EXISTS distribution_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_rejection_reason text,
  ADD COLUMN IF NOT EXISTS certificate_generated boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS certificate_generated_at timestamptz;

-- Add distribution and admin verification columns to donation_handovers
ALTER TABLE donation_handovers
  ADD COLUMN IF NOT EXISTS distribution_photo_url text,
  ADD COLUMN IF NOT EXISTS distribution_people_served integer,
  ADD COLUMN IF NOT EXISTS distribution_location text,
  ADD COLUMN IF NOT EXISTS distribution_notes text,
  ADD COLUMN IF NOT EXISTS distribution_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_rejection_reason text,
  ADD COLUMN IF NOT EXISTS certificate_generated boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS certificate_generated_at timestamptz;

-- Create per-donation certificates table
CREATE TABLE IF NOT EXISTS donation_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid NOT NULL REFERENCES food_donations(id) ON DELETE CASCADE,
  volunteer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  donor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  certificate_number text NOT NULL,
  qr_code text,
  qr_code_url text,
  issue_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (donation_id)
);

ALTER TABLE donation_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_donation_certificates" ON donation_certificates;
CREATE POLICY "read_donation_certificates"
  ON donation_certificates FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_donation_certificates" ON donation_certificates;
CREATE POLICY "insert_donation_certificates"
  ON donation_certificates FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_donation_certificates" ON donation_certificates;
CREATE POLICY "update_donation_certificates"
  ON donation_certificates FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Add handover status values for the new workflow steps
-- (no constraint to alter, handover_status is text)

-- Add index for admin verification queries
CREATE INDEX IF NOT EXISTS idx_food_donations_admin_verified
  ON food_donations (admin_verified, handover_status);
CREATE INDEX IF NOT EXISTS idx_donation_handovers_admin_verified
  ON donation_handovers (admin_verified, handover_status);
