/*
# Allow admins to edit any user's profile

## Purpose
Previously the `profiles_update` RLS policy only allowed a user to update
their OWN profile (`auth.uid() = id`). Admins managing users from the
Admin Dashboard could not edit other users' name, email, phone, role, etc.
This migration widens the UPDATE policy so that users with the `admin` role
can update ANY profile row, while non-admins remain restricted to their own.

## Security changes
- Drops and recreates the `profiles_update` policy.
- USING clause: allow if the row belongs to the caller OR the caller is an admin.
- WITH CHECK clause: same condition — an admin may set any row; a non-admin
  may only modify their own row (and cannot reassign it to another user,
  because the check still requires `auth.uid() = id` for non-admins).

## Important notes
1. Admin detection reuses the existing pattern used across the schema:
   `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')`.
2. This only affects UPDATE. SELECT, INSERT, and DELETE policies are unchanged.
3. Non-admin users retain exactly the same self-edit access as before.
*/

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
