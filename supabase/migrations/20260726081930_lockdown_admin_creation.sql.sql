/*
# Lock down admin account creation

## Summary
Ensures that no new user can register or be assigned the 'admin' role
through the standard sign-up flow. The single existing admin account
remains intact and can still log in normally.

## Changes
1. Replace the `handle_new_user()` trigger function so it rejects any
   signUp attempt that sets `role = 'admin'`. The function raises an
   exception, which aborts the auth.users insert — so the account is
   never created and the caller gets a clear error.
2. Add a CHECK constraint on `profiles.role` that prevents INSERT of
   new admin rows while still allowing the existing admin row to be
   updated (the constraint is enforced only on INSERT via a trigger,
   not on UPDATE, so the existing admin stays functional).

## Security
- No RLS policy changes.
- The existing admin account is preserved.
- Future admin creation is blocked at the database level, so even a
  bypassed frontend cannot create admin accounts.
*/

-- 1. Replace handle_new_user to reject admin role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'volunteer') = 'admin' THEN
    RAISE EXCEPTION 'Admin accounts cannot be created through registration.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (
      id,
      full_name,
      email,
      username,
      phone,
      role,
      organization,
      address,
      city,
      state,
      pincode
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'email', NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'volunteer'),
      COALESCE(NEW.raw_user_meta_data->>'organization', ''),
      COALESCE(NEW.raw_user_meta_data->>'address', ''),
      COALESCE(NEW.raw_user_meta_data->>'city', ''),
      COALESCE(NEW.raw_user_meta_data->>'state', ''),
      COALESCE(NEW.raw_user_meta_data->>'pincode', '')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Block direct INSERT of admin rows into profiles (defense in depth)
CREATE OR REPLACE FUNCTION public.block_admin_profile_insert()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin' AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RAISE EXCEPTION 'Admin accounts cannot be created.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS block_admin_insert ON public.profiles;
CREATE TRIGGER block_admin_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.block_admin_profile_insert();
