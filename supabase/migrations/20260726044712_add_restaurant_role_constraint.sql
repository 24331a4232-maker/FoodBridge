/*
# Add 'restaurant' role to profiles check constraint

## Summary
The profiles table's role CHECK constraint currently allows only
donor, volunteer, admin, ngo. This migration adds 'restaurant' so
restaurants can register with their own role and get role-based routing.

## Changes
1. Drop the existing `profiles_role_check` constraint.
2. Recreate it with the same four roles PLUS 'restaurant'.

## Security
- No RLS changes. Only the role validation constraint is modified.
*/

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role = ANY (ARRAY['donor'::text, 'volunteer'::text, 'admin'::text, 'ngo'::text, 'restaurant'::text]));
