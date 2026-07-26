/*
# Fix: Allow anon role to SELECT from profiles

## Root Cause
The profiles_select RLS policy only applied to the `authenticated` role,
not `anon`. This meant:
1. During login with username, the anon client couldn't look up the
   email associated with the username → "Invalid email/username or password."
2. During registration, duplicate checks (username/email/phone) returned
   empty results because anon couldn't read profiles → duplicates not detected.

## Fix
Drop the existing profiles_select policy and recreate it to apply to
both `anon` and `authenticated` roles. The USING clause remains `true`
since profile data (username, email, role) is needed for login and
duplicate checks.
*/

DROP POLICY IF EXISTS profiles_select ON public.profiles;

CREATE POLICY profiles_select ON public.profiles
  FOR SELECT TO anon, authenticated USING (true);
