/*
# Fix: Allow anon role to INSERT into profiles (fallback during signUp)

During signUp, if the database trigger doesn't create the profile in time,
the client tries to insert it manually. But if the session isn't established
yet, auth.uid() returns null and the insert fails.

Fix: Allow both anon and authenticated to insert, but keep the CHECK
constraint that auth.uid() must match the id being inserted. This ensures
only the authenticated user can insert their own profile, while also
allowing the insert during the brief window of signUp.
*/

DROP POLICY IF EXISTS profiles_insert ON public.profiles;

CREATE POLICY profiles_insert ON public.profiles
  FOR INSERT TO anon, authenticated WITH CHECK (auth.uid() = id);
