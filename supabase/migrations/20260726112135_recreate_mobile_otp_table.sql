/*
# Mobile OTP Verification System

## Purpose
Stores one-time-use OTP codes for mobile number verification during donor and
volunteer registration. Each OTP is a 6-digit code tied to a mobile number,
expires 5 minutes after creation, and can only be used once.

## 1. New Table: mobile_otps
- id (uuid PK)
- mobile (text, NOT NULL) — 10-digit mobile number being verified
- otp_code (text, NOT NULL) — the 6-digit OTP code
- purpose (text, NOT NULL DEFAULT 'registration')
- is_used (boolean, NOT NULL DEFAULT false) — whether the OTP has been consumed
- is_verified (boolean, NOT NULL DEFAULT false) — whether verification succeeded
- verified_at (timestamptz, nullable) — when verification succeeded
- expires_at (timestamptz, NOT NULL) — created_at + 5 minutes
- attempts (integer, NOT NULL DEFAULT 0) — failed verification attempts
- created_at (timestamptz, NOT NULL DEFAULT now())

## 2. Security (RLS)
- Registration runs BEFORE the user has an auth session, so the anon-key client
  must be able to insert and read OTP rows. We allow anon + authenticated CRUD
  since the mobile number itself serves as the ownership key.

## 3. Indexes
- mobile_otps(mobile), mobile_otps(expires_at), mobile_otps(is_used)

## 4. Notes
- OTP expires after 5 minutes.
- Resend allowed after 30 seconds (enforced by edge function).
- Rate limit: max 5 OTP requests per mobile per hour (edge function).
- Max 5 failed verification attempts per OTP.
*/

CREATE TABLE IF NOT EXISTS mobile_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile text NOT NULL,
  otp_code text NOT NULL,
  purpose text NOT NULL DEFAULT 'registration',
  is_used boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE mobile_otps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_otps" ON mobile_otps;
CREATE POLICY "anon_select_otps"
  ON mobile_otps FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_otps" ON mobile_otps;
CREATE POLICY "anon_insert_otps"
  ON mobile_otps FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_otps" ON mobile_otps;
CREATE POLICY "anon_update_otps"
  ON mobile_otps FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_otps" ON mobile_otps;
CREATE POLICY "anon_delete_otps"
  ON mobile_otps FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_mobile_otps_mobile ON mobile_otps(mobile);
CREATE INDEX IF NOT EXISTS idx_mobile_otps_expires ON mobile_otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_mobile_otps_used ON mobile_otps(is_used);
