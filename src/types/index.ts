export type UserRole = 'donor' | 'volunteer' | 'admin' | 'ngo';
export type OrganizationType = 'hotel' | 'restaurant' | 'event' | 'caterer' | 'other';
export type FoodCategory = 'cooked' | 'raw' | 'packaged' | 'beverages' | 'bakery' | 'other';
export type DonationStatus = 'available' | 'claimed' | 'picked_up' | 'delivered' | 'expired' | 'cancelled';
export type PickupStatus = 'accepted' | 'in_progress' | 'delivered' | 'cancelled';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  organization: string | null;
  address: string | null;
  city: string | null;
  avatar_url: string | null;
  bio: string | null;
  reward_points: number;
  total_deliveries: number;
  total_hours: number;
  badges: string[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type StorageMethod = 'room_temperature' | 'refrigerated' | 'frozen';
export type FoodCondition = 'fresh' | 'good' | 'average';
export type FreshnessStatus = 'fresh' | 'consume_soon' | 'expired';
export type PriorityLevel = 'low' | 'medium' | 'high';

export interface FoodDonation {
  id: string;
  donor_id: string | null;
  donor_name: string;
  organization: string;
  organization_type: OrganizationType;
  food_name: string;
  category: FoodCategory;
  quantity: string;
  quantity_unit: string;
  pickup_time: string;
  expiry_time: string;
  preparation_time: string | null;
  storage_method: StorageMethod | null;
  food_temperature: number | null;
  food_condition: FoodCondition | null;
  quality_score: number | null;
  freshness_status: FreshnessStatus | null;
  estimated_meals: number | null;
  recommended_recipient: string | null;
  priority_level: PriorityLevel | null;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  image_url: string;
  description: string;
  status: DonationStatus;
  is_urgent: boolean;
  contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface Pickup {
  id: string;
  donation_id: string;
  volunteer_id: string;
  status: PickupStatus;
  accepted_at: string;
  picked_up_at: string | null;
  delivered_at: string | null;
  delivery_notes: string;
  recipient_name: string;
  recipient_org: string;
  points_earned: number;
  created_at: string;
  donation?: FoodDonation;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export type NotificationType =
  | 'new_donation'
  | 'volunteer_assigned'
  | 'donation_approved'
  | 'pickup_started'
  | 'delivery_completed'
  | 'certificate_generated'
  | 'volunteer_arrived'
  | 'food_expiring'
  | 'thank_you';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  description: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface Certificate {
  id: string;
  volunteer_id: string;
  certificate_number: string;
  unique_id: string | null;
  organization_name: string | null;
  volunteer_name: string | null;
  total_meals: number;
  qr_code_url: string | null;
  issue_date: string;
  completion_date: string;
  deliveries_count: number;
  hours_served: number;
  is_valid: boolean;
  created_at: string;
  volunteer?: Profile;
}
