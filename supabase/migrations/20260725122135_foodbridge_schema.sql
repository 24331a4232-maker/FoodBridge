
/*
# FoodBridge Database Schema

## Overview
Complete schema for the FoodBridge surplus food redistribution platform.

## Tables
1. profiles - Extended user profiles (linked to auth.users)
2. food_donations - Surplus food listings by donors
3. pickups - Volunteer pickup assignments
4. volunteer_stats - Aggregated volunteer performance data
5. contact_messages - Contact form submissions
6. newsletter_subscribers - Email newsletter list
7. certificates - Generated volunteer certificates

## Security
- RLS enabled on all tables
- Authenticated users can manage their own data
- Public read access for food_donations (available food listings)
- Anon users can submit contact messages and subscribe to newsletter
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  role text NOT NULL DEFAULT 'volunteer' CHECK (role IN ('donor', 'volunteer', 'admin', 'ngo')),
  organization text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  reward_points integer NOT NULL DEFAULT 0,
  total_deliveries integer NOT NULL DEFAULT 0,
  total_hours numeric NOT NULL DEFAULT 0,
  badges text[] DEFAULT '{}',
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_delete" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Food donations table
CREATE TABLE IF NOT EXISTS food_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  donor_name text NOT NULL DEFAULT '',
  organization text NOT NULL DEFAULT '',
  organization_type text NOT NULL DEFAULT 'hotel' CHECK (organization_type IN ('hotel', 'restaurant', 'event', 'caterer', 'other')),
  food_name text NOT NULL,
  category text NOT NULL DEFAULT 'cooked' CHECK (category IN ('cooked', 'raw', 'packaged', 'beverages', 'bakery', 'other')),
  quantity text NOT NULL,
  quantity_unit text NOT NULL DEFAULT 'servings',
  pickup_time timestamptz NOT NULL,
  expiry_time timestamptz NOT NULL,
  address text NOT NULL,
  city text NOT NULL DEFAULT '',
  latitude numeric,
  longitude numeric,
  image_url text DEFAULT '',
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'picked_up', 'delivered', 'expired', 'cancelled')),
  is_urgent boolean NOT NULL DEFAULT false,
  contact_phone text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE food_donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "food_donations_select_all" ON food_donations;
CREATE POLICY "food_donations_select_all" ON food_donations FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "food_donations_insert" ON food_donations;
CREATE POLICY "food_donations_insert" ON food_donations FOR INSERT TO authenticated WITH CHECK (auth.uid() = donor_id);

DROP POLICY IF EXISTS "food_donations_update" ON food_donations;
CREATE POLICY "food_donations_update" ON food_donations FOR UPDATE TO authenticated USING (auth.uid() = donor_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (true);

DROP POLICY IF EXISTS "food_donations_delete" ON food_donations;
CREATE POLICY "food_donations_delete" ON food_donations FOR DELETE TO authenticated USING (auth.uid() = donor_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Pickups table
CREATE TABLE IF NOT EXISTS pickups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid NOT NULL REFERENCES food_donations(id) ON DELETE CASCADE,
  volunteer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'accepted' CHECK (status IN ('accepted', 'in_progress', 'delivered', 'cancelled')),
  accepted_at timestamptz DEFAULT now(),
  picked_up_at timestamptz,
  delivered_at timestamptz,
  delivery_notes text DEFAULT '',
  recipient_name text DEFAULT '',
  recipient_org text DEFAULT '',
  points_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pickups_select" ON pickups;
CREATE POLICY "pickups_select" ON pickups FOR SELECT TO authenticated USING (auth.uid() = volunteer_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR EXISTS (SELECT 1 FROM food_donations WHERE id = donation_id AND donor_id = auth.uid()));

DROP POLICY IF EXISTS "pickups_insert" ON pickups;
CREATE POLICY "pickups_insert" ON pickups FOR INSERT TO authenticated WITH CHECK (auth.uid() = volunteer_id);

DROP POLICY IF EXISTS "pickups_update" ON pickups;
CREATE POLICY "pickups_update" ON pickups FOR UPDATE TO authenticated USING (auth.uid() = volunteer_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (true);

DROP POLICY IF EXISTS "pickups_delete" ON pickups;
CREATE POLICY "pickups_delete" ON pickups FOR DELETE TO authenticated USING (auth.uid() = volunteer_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_insert" ON contact_messages;
CREATE POLICY "contact_insert" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "contact_select_admin" ON contact_messages;
CREATE POLICY "contact_select_admin" ON contact_messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "contact_update_admin" ON contact_messages;
CREATE POLICY "contact_update_admin" ON contact_messages FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (true);

DROP POLICY IF EXISTS "contact_delete_admin" ON contact_messages;
CREATE POLICY "contact_delete_admin" ON contact_messages FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter_insert" ON newsletter_subscribers;
CREATE POLICY "newsletter_insert" ON newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "newsletter_select_admin" ON newsletter_subscribers;
CREATE POLICY "newsletter_select_admin" ON newsletter_subscribers FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "newsletter_update_admin" ON newsletter_subscribers;
CREATE POLICY "newsletter_update_admin" ON newsletter_subscribers FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (true);

DROP POLICY IF EXISTS "newsletter_delete_admin" ON newsletter_subscribers;
CREATE POLICY "newsletter_delete_admin" ON newsletter_subscribers FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  certificate_number text UNIQUE NOT NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  completion_date date NOT NULL,
  deliveries_count integer NOT NULL DEFAULT 0,
  hours_served numeric NOT NULL DEFAULT 0,
  is_valid boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "certificates_select" ON certificates;
CREATE POLICY "certificates_select" ON certificates FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "certificates_insert" ON certificates;
CREATE POLICY "certificates_insert" ON certificates FOR INSERT TO authenticated WITH CHECK (auth.uid() = volunteer_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "certificates_update" ON certificates;
CREATE POLICY "certificates_update" ON certificates FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (true);

DROP POLICY IF EXISTS "certificates_delete" ON certificates;
CREATE POLICY "certificates_delete" ON certificates FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed sample food donations for demo
INSERT INTO food_donations (donor_id, donor_name, organization, organization_type, food_name, category, quantity, quantity_unit, pickup_time, expiry_time, address, city, image_url, description, status, is_urgent, contact_phone)
VALUES
  (NULL, 'Raj Kumar', 'The Grand Hotel', 'hotel', 'Biryani & Curry', 'cooked', '50', 'servings', now() + interval '2 hours', now() + interval '4 hours', '12 MG Road, Bangalore', 'Bangalore', 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg', 'Freshly prepared biryani and vegetable curry from lunch buffet', 'available', true, '+91-9876543210'),
  (NULL, 'Priya Sharma', 'Spice Garden Restaurant', 'restaurant', 'Paneer Dishes & Dal', 'cooked', '30', 'servings', now() + interval '3 hours', now() + interval '5 hours', '45 Brigade Road, Bangalore', 'Bangalore', 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg', 'Leftover from evening service - paneer butter masala and dal tadka', 'available', false, '+91-9876543211'),
  (NULL, 'Ahmed Khan', 'Wedding Palace Banquet', 'event', 'Wedding Feast Leftovers', 'cooked', '200', 'servings', now() + interval '1 hour', now() + interval '3 hours', '78 Koramangala, Bangalore', 'Bangalore', 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg', 'Large wedding event - multiple dishes available including rice, curries, sweets', 'available', true, '+91-9876543212'),
  (NULL, 'Sunita Devi', 'Paradise Catering Services', 'caterer', 'Assorted Sweets & Snacks', 'packaged', '100', 'packets', now() + interval '4 hours', now() + interval '8 hours', '23 Indiranagar, Bangalore', 'Bangalore', 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', 'Packed sweets and snacks from corporate event', 'available', false, '+91-9876543213'),
  (NULL, 'Vikram Singh', 'Hotel Sunshine', 'hotel', 'Breakfast Items', 'bakery', '40', 'servings', now() + interval '2 hours', now() + interval '6 hours', '56 Jayanagar, Bangalore', 'Bangalore', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 'Bread, pastries, and breakfast items from morning buffet', 'available', false, '+91-9876543214'),
  (NULL, 'Meera Iyer', 'Green Leaf Cafe', 'restaurant', 'Veg Meals', 'cooked', '25', 'servings', now() + interval '5 hours', now() + interval '7 hours', '89 Whitefield, Bangalore', 'Bangalore', 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg', 'South Indian meals - rice, sambar, rasam, and curries', 'available', false, '+91-9876543215'),
  (NULL, 'Ravi Patel', 'Celebration Events', 'event', 'Birthday Party Food', 'cooked', '60', 'servings', now() + interval '1 hour', now() + interval '2 hours', '34 Electronic City, Bangalore', 'Bangalore', 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg', 'Birthday party leftovers - cake, snacks, and main course', 'available', true, '+91-9876543216'),
  (NULL, 'Anita Roy', 'Royal Feast Caterers', 'caterer', 'Rice & Curry Combo', 'cooked', '80', 'servings', now() + interval '3 hours', now() + interval '5 hours', '12 HSR Layout, Bangalore', 'Bangalore', 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg', 'Corporate lunch leftovers - rice, multiple curries, curd', 'available', false, '+91-9876543217')
ON CONFLICT DO NOTHING;
