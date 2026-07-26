/*
# Fix Authentication: Auto-create profile on signup

## Root Cause
The profiles_insert RLS policy requires auth.uid() = id, but during
signUp the session may not be established yet when the profile insert
runs. This causes the insert to fail silently, leaving the auth user
without a profile row.

## Fix
Create a trigger on auth.users that auto-creates a profile row
using the user_metadata from the signUp call. This is the canonical
Supabase pattern and eliminates the race condition.
*/

-- ── 1. Create function to handle new user signup ───────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

-- ── 2. Create trigger on auth.users ─────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
