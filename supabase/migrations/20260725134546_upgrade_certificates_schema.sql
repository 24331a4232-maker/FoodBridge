/*
# Upgrade Certificates Schema for Premium Verification System

## Overview
Enhances the existing `certificates` table to support a premium volunteer
appreciation certificate with unique IDs, QR verification, organization
metadata, and a sequential certificate numbering system (FB-YYYY-0001).

## Changes

### 1. New columns on `certificates`
- `unique_id` (text) — secondary human-readable unique code (e.g. UID-XXXX)
- `organization_name` (text) — organization the volunteer belongs to
- `volunteer_name` (text) — snapshot of the volunteer's full name at issue time
- `total_meals` (integer) — snapshot of meals delivered
- `qr_code_url` (text) — the full URL encoded into the QR (verify link)

### 2. Sequence + function for sequential certificate numbers
- `certificate_id_seq` — a global sequence used to generate the numeric
  portion of certificate numbers (FB-YYYY-NNNN).
- `generate_certificate_number()` — returns the next certificate number in
  the format `FB-2026-0001`, padding the sequence value to 4 digits and using
  the current year.

### 3. RLS
- Existing policies remain: public SELECT, owner/admin INSERT, admin UPDATE/DELETE.

## Notes
- The new columns are nullable so existing rows are not affected.
- The sequence starts at 1; the first certificate issued will be FB-YYYY-0001.
*/

-- Add new columns to certificates table
ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS unique_id text,
  ADD COLUMN IF NOT EXISTS organization_name text DEFAULT 'FoodBridge',
  ADD COLUMN IF NOT EXISTS volunteer_name text,
  ADD COLUMN IF NOT EXISTS total_meals integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS qr_code_url text;

-- Create a sequence for sequential certificate numbers
CREATE SEQUENCE IF NOT EXISTS certificate_id_seq START 1 INCREMENT 1;

-- Function to generate the next certificate number: FB-YYYY-0001
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'FB-' || EXTRACT(YEAR FROM now())::text || '-' || LPAD(nextval('certificate_id_seq')::text, 4, '0');
$$;