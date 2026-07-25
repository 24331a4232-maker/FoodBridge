/*
# Extend profiles with settings and address fields

1. Modified Tables
- `profiles`
  - `state` (text) - Indian state
  - `pincode` (text) - postal code
  - `notification_settings` (jsonb) - toggles for email/push/donation/certificate/volunteer/quality alerts
  - `privacy_settings` (jsonb) - toggles for profile visibility, location sharing, phone hiding
  - `preferences` (jsonb) - theme + language preference
2. Security
- No policy changes; existing profiles_update policy covers these columns.
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS state text DEFAULT '',
  ADD COLUMN IF NOT EXISTS pincode text DEFAULT '',
  ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{"email":true,"push":true,"donations":true,"certificates":true,"volunteer":true,"quality":true}',
  ADD COLUMN IF NOT EXISTS privacy_settings jsonb DEFAULT '{"profileVisible":true,"locationOnPickup":true,"hidePhone":false}',
  ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{"theme":"system","language":"en"}';
