/*
# Smart Food Quality Assessment System

## Overview
Adds food quality tracking fields to the `food_donations` table so each
donation carries its own freshness metadata: preparation time, storage
method, food condition, temperature, and a computed quality score.

## Changes
### New columns on `food_donations`
- `preparation_time` (timestamptz) — when the food was prepared/cooked
- `storage_method` (text) — 'room_temperature' | 'refrigerated' | 'frozen'
- `food_temperature` (numeric, nullable) — measured temperature in °C
- `food_condition` (text) — 'fresh' | 'good' | 'average'
- `quality_score` (integer) — 0–100 computed quality score
- `freshness_status` (text) — 'fresh' | 'consume_soon' | 'expired'
- `estimated_meals` (integer) — estimated number of meals servable
- `recommended_recipient` (text) — suggested recipient type
- `priority_level` (text) — 'low' | 'medium' | 'high'

## Notes
- All new columns are nullable so existing rows are not affected.
- No data is lost; this is an additive migration only.
*/

ALTER TABLE food_donations
  ADD COLUMN IF NOT EXISTS preparation_time timestamptz,
  ADD COLUMN IF NOT EXISTS storage_method text DEFAULT 'room_temperature' CHECK (storage_method IN ('room_temperature', 'refrigerated', 'frozen')),
  ADD COLUMN IF NOT EXISTS food_temperature numeric,
  ADD COLUMN IF NOT EXISTS food_condition text DEFAULT 'good' CHECK (food_condition IN ('fresh', 'good', 'average')),
  ADD COLUMN IF NOT EXISTS quality_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS freshness_status text DEFAULT 'fresh' CHECK (freshness_status IN ('fresh', 'consume_soon', 'expired')),
  ADD COLUMN IF NOT EXISTS estimated_meals integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recommended_recipient text DEFAULT '',
  ADD COLUMN IF NOT EXISTS priority_level text DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high'));