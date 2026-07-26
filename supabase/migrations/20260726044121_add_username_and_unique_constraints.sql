/*
# Add username column and unique constraints for duplicate account prevention

## Summary
This migration adds a `username` column to the `profiles` table and enforces
uniqueness on `username`, `email`, and `phone` so that duplicate accounts are
impossible at the database level — even if a user bypasses frontend validation.

## Changes

### 1. New column
- `profiles.username` (text, NOT NULL, default '') — a unique, case-insensitive
  username chosen by the user at registration. Must contain only letters,
  numbers, and underscores (enforced by a CHECK constraint).

### 2. Unique constraints
- `profiles_username_key` — UNIQUE on `lower(username)` so username comparisons
  are case-insensitive at the database level.
- `profiles_email_key` — UNIQUE on `lower(email)` so email comparisons are
  case-insensitive at the database level.
- `profiles_phone_key` — UNIQUE on `phone` so no two accounts share a phone number.

### 3. CHECK constraint
- `profiles_username_format_check` — enforces username contains only
  letters, numbers, and underscores (^[A-Za-z0-9_]+$).

## Security
- No RLS policy changes. Existing policies on `profiles` remain intact.
- Unique constraints are database-level enforcement, preventing duplicates even
  if frontend validation is bypassed.

## Important notes
1. The username unique index uses `lower(username)` for case-insensitive
   comparison, matching the frontend's case-insensitive check.
2. The email unique index uses `lower(email)` for the same reason.
3. Phone uniqueness is exact-match (no lowercasing needed).
4. Existing rows get a default empty username; the unique index allows multiple
   empty strings only if no real username conflicts — we use a partial approach
   by filtering nulls. Since username is NOT NULL with default '', existing rows
   get '' which would conflict if more than one row exists. To handle this, we
   set existing rows to a unique value based on their id prefix before adding
   the constraint.
*/

-- Step 1: Add username column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND table_schema = 'public' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Step 2: Backfill existing rows with unique usernames to avoid constraint conflicts
-- Set each existing row's username to a unique placeholder based on the last 8 chars of their id
DO $$
BEGIN
  UPDATE profiles SET username = 'user_' || right(id::text, 8)
  WHERE username = '' OR username IS NULL;
END $$;

-- Step 3: Add username format check constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_format_check'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT profiles_username_format_check
    CHECK (username ~ '^[A-Za-z0-9_]+$');
  END IF;
END $$;

-- Step 4: Drop existing constraints if they exist (idempotent), then create
DROP INDEX IF EXISTS profiles_username_lower_idx;
DROP INDEX IF EXISTS profiles_email_lower_idx;
DROP INDEX IF EXISTS profiles_phone_idx;

-- Create unique indexes (these enforce uniqueness at the DB level)
CREATE UNIQUE INDEX profiles_username_lower_idx ON profiles (lower(username));
CREATE UNIQUE INDEX profiles_email_lower_idx ON profiles (lower(email));
CREATE UNIQUE INDEX profiles_phone_idx ON profiles (phone) WHERE phone IS NOT NULL AND phone <> '';
