/*
# Create login_activity table — Admin login monitoring

## Summary
Adds a `login_activity` table that records every successful user sign-in so
admins can monitor who is logging into the platform and when. This is an
audit/security feature: it captures the login identifier (email), the user's
display name, their role, the timestamp of the login, and the IP address /
user-agent when available.

## What is captured (and what is NOT)
- Captured: email (the login credential identifier), full name, role, login time,
  IP address, user-agent string.
- NOT captured: passwords are never stored in plain text anywhere in Supabase
  and are NOT included here. Passwords remain securely hashed in auth.users and
  are never readable by anyone, including admins.

## 1. New Table: login_activity
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles, on delete cascade) — the user who logged in
- `email` (text, not null) — the login identifier used
- `full_name` (text) — denormalized display name at time of login
- `role` (text) — denormalized user role at time of login
- `ip_address` (text, nullable) — client IP when available
- `user_agent` (text, nullable) — browser/device string when available
- `login_at` (timestamptz, not null, default now()) — when the login occurred
- `created_at` (timestamptz, default now())

## 2. Security — RLS
- RLS enabled on login_activity.
- SELECT restricted to admins only (role = 'admin') so only admin accounts can
  review login history. Regular users cannot read other users' login records.
- INSERT allowed for authenticated users (they insert their own login row on
  sign-in). No UPDATE or DELETE policies are defined — login records are
  immutable audit entries.

## 3. Indexes
- login_activity(login_at DESC) for recent-first listing
- login_activity(user_id) for per-user history
*/

CREATE TABLE IF NOT EXISTS login_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  ip_address text,
  user_agent text,
  login_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE login_activity ENABLE ROW LEVEL SECURITY;

-- Admins can read all login activity records
DROP POLICY IF EXISTS "select_login_activity_admin" ON login_activity;
CREATE POLICY "select_login_activity_admin"
  ON login_activity FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Any authenticated user can insert their own login record
DROP POLICY IF EXISTS "insert_own_login_activity" ON login_activity;
CREATE POLICY "insert_own_login_activity"
  ON login_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_login_activity_login_at ON login_activity(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_activity_user_id ON login_activity(user_id);
