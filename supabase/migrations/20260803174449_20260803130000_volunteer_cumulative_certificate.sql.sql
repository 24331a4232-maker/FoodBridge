/*
# Volunteer Cumulative Certificate Auto-Generation

When a volunteer completes a delivery, this function upserts their certificate:
- Creates one if none exists (cumulative, per-volunteer, not per-donation)
- Updates deliveries_count, hours_served, total_meals, completion_date if it does
- Returns the certificate row
*/

CREATE OR REPLACE FUNCTION upsert_volunteer_certificate(
  p_volunteer_id uuid,
  p_volunteer_name text DEFAULT NULL,
  p_deliveries_delta integer DEFAULT 1,
  p_hours_delta numeric DEFAULT 0.5,
  p_meals_delta integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  certificate_number text,
  volunteer_id uuid,
  deliveries_count integer,
  hours_served numeric,
  total_meals integer,
  is_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cert_id uuid;
  v_cert_number text;
  v_existing_deliveries integer;
  v_existing_hours numeric;
  v_existing_meals integer;
BEGIN
  -- Try to find an existing cumulative certificate for this volunteer
  SELECT id, deliveries_count, hours_served, total_meals
    INTO v_cert_id, v_existing_deliveries, v_existing_hours, v_existing_meals
  FROM certificates
  WHERE volunteer_id = p_volunteer_id AND donation_id IS NULL
  LIMIT 1;

  IF v_cert_id IS NOT NULL THEN
    -- Update existing
    UPDATE certificates SET
      deliveries_count = COALESCE(v_existing_deliveries, 0) + p_deliveries_delta,
      hours_served = COALESCE(v_existing_hours, 0) + p_hours_delta,
      total_meals = COALESCE(v_existing_meals, 0) + p_meals_delta,
      completion_date = CURRENT_DATE,
      is_valid = true,
      volunteer_name = COalesce(p_volunteer_name, volunteer_name)
    WHERE id = v_cert_id;

    RETURN QUERY
      SELECT id, certificate_number, volunteer_id, deliveries_count, hours_served, total_meals, is_valid
      FROM certificates WHERE id = v_cert_id;
  ELSE
    -- Create new cumulative certificate
    v_cert_number := 'FB-VOL-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad((nextval('certificate_number_seq') % 10000)::text, 4, '0');

    INSERT INTO certificates (
      volunteer_id, donor_id, donation_id,
      certificate_number, unique_id,
      volunteer_name, organization_name,
      issue_date, completion_date,
      deliveries_count, hours_served, total_meals,
      is_valid
    ) VALUES (
      p_volunteer_id, NULL, NULL,
      v_cert_number, 'UID-' || upper(substr(md5(random()::text), 1, 8)),
      p_volunteer_name, 'FoodBridge',
      CURRENT_DATE, CURRENT_DATE,
      p_deliveries_delta, p_hours_delta, p_meals_delta,
      true
    )
    RETURNING id INTO v_cert_id;

    RETURN QUERY
      SELECT id, certificate_number, volunteer_id, deliveries_count, hours_served, total_meals, is_valid
      FROM certificates WHERE id = v_cert_id;
  END IF;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION upsert_volunteer_certificate(uuid, text, integer, numeric, integer) TO authenticated;
