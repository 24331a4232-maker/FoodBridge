/*
# Add vehicle field to profiles

## Purpose
Stores the volunteer's vehicle info (e.g. "Bike - KA01 AB 1234") so the admin
volunteer-tracking modal can display it alongside other volunteer details.

## Changes
- Adds `vehicle` (text, nullable) to `profiles`.
- Non-destructive: ADD COLUMN IF NOT EXISTS only.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='vehicle') THEN
    ALTER TABLE profiles ADD COLUMN vehicle text;
  END IF;
END $$;
