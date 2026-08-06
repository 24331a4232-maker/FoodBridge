export interface LoginActivity {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  ip_address: string | null;
  user_agent: string | null;
  login_at: string;
  created_at: string;
}

export type UserRole = 'donor' | 'volunteer' | 'admin' | 'ngo' | 'restaurant';
export type OrganizationType = 'hotel' | 'restaurant' | 'event' | 'caterer' | 'other';
export type FoodCategory = 'cooked' | 'raw' | 'packaged' | 'beverages' | 'bakery' | 'other';
export type DonationStatus = 'available' | 'claimed' | 'picked_up' | 'delivered' | 'expired' | 'cancelled';
export type PickupStatus = 'accepted' | 'in_progress' | 'delivered' | 'cancelled';
export type HandoverStatus =
  | 'waiting_volunteer'
  | 'volunteer_assigned'
  | 'qr_verified'
  | 'quality_approved'
  | 'quality_rejected'
  | 'picked_up'
  | 'distributed'
  | 'admin_approved'
  | 'admin_rejected'
  | 'certificate_generated'
  | 'delivered'
  | 'cancelled';

export interface DonationHandover {
  id: string;
  donation_id: string;
  qr_code: string;
  qr_code_url: string | null;
  donor_id: string | null;
  volunteer_id: string | null;
  qr_verified: boolean;
  qr_verified_at: string | null;
  pickup_confirmed: boolean;
  pickup_confirmed_at: string | null;
  quality_report: Record<string, unknown> | null;
  inspection_rating: number | null;
  pickup_photo_url: string | null;
  handover_status: HandoverStatus;
  distribution_photo_url: string | null;
  distribution_people_served: number | null;
  distribution_location: string | null;
  distribution_notes: string | null;
  distribution_at: string | null;
  admin_verified: boolean | null;
  admin_verified_at: string | null;
  admin_rejection_reason: string | null;
  certificate_generated: boolean | null;
  certificate_generated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QrPayload {
  donationId: string;
  donorId: string;
  donorName: string;
  foodName: string;
  foodCategory: string;
  quantity: string;
  pickupAddress: string;
  createdAt: string;
  status: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  donations: boolean;
  certificates: boolean;
  volunteer: boolean;
  quality: boolean;
}

export interface PrivacySettings {
  profileVisible: boolean;
  locationOnPickup: boolean;
  hidePhone: boolean;
}

export interface Preferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'te' | 'hi';
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  username: string;
  phone: string | null;
  role: UserRole;
  organization: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  avatar_url: string | null;
  bio: string | null;
  reward_points: number;
  total_deliveries: number;
  total_hours: number;
  badges: string[];
  is_verified: boolean;
  notification_settings: NotificationSettings | null;
  privacy_settings: PrivacySettings | null;
  preferences: Preferences | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  availability: 'available' | 'on_delivery' | 'offline';
  current_location_lat: number | null;
  current_location_lng: number | null;
  rating: number;
  assigned_deliveries: number;
  completed_deliveries_count: number;
  vehicle: string | null;
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
  food_type: 'veg' | 'non_veg' | null;
  meals_count: number | null;
  distribution_photo_url: string | null;
  distribution_people_served: number | null;
  distribution_location: string | null;
  distribution_notes: string | null;
  distribution_at: string | null;
  admin_verified: boolean | null;
  admin_verified_at: string | null;
  admin_rejection_reason: string | null;
  certificate_generated: boolean | null;
  certificate_generated_at: string | null;
  created_at: string;
  updated_at: string;
  assigned_volunteer_id: string | null;
  delivery_time: string | null;
  quality_result: 'approved' | 'rejected' | 'pending' | null;
  certificate_id: string | null;
  qr_verified: boolean;
  donation_code: string | null;
  handover_status: HandoverStatus | null;
  pickup_confirmed_at: string | null;
}

export type TrackingStatus =
  | 'accepted'
  | 'pickup_started'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

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
  current_lat: number | null;
  current_lng: number | null;
  tracking_status: TrackingStatus;
  started_at: string | null;
  on_the_way_at: string | null;
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
  | 'thank_you'
  | 'distribution_complete'
  | 'pickup_confirmed'
  | 'admin_approved'
  | 'admin_rejected';

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

export interface DonationCertificate {
  id: string;
  donation_id: string;
  volunteer_id: string | null;
  donor_id: string | null;
  certificate_number: string;
  qr_code: string | null;
  qr_code_url: string | null;
  issue_date: string;
  created_at: string;
}

export type RejectionReason =
  | ''
  | 'expired'
  | 'damaged_packaging'
  | 'bad_smell'
  | 'contaminated'
  | 'unsafe_temperature';

export interface InspectionChecklist {
  visual_inspection?: boolean;
  temperature_check?: boolean;
  packaging_intact?: boolean;
  no_contamination?: boolean;
  within_expiry?: boolean;
  no_off_odour?: boolean;
}

export interface FoodQualityInspection {
  id: string;
  donation_id: string;
  pickup_id: string | null;
  inspector_id: string | null;
  inspector_name: string;
  freshness: 'fresh' | 'good' | 'average' | 'stale';
  packaging: 'excellent' | 'good' | 'fair' | 'poor';
  temperature: string;
  expiry_check: 'pass' | 'fail';
  approval_status: 'approved' | 'pending' | 'rejected';
  rejection_reason: RejectionReason;
  rating: number;
  photo_url: string;
  checklist: InspectionChecklist;
  inspector_lat: number | null;
  inspector_lng: number | null;
  notes: string;
  created_at: string;
}

export interface QrVerification {
  id: string;
  certificate_id: string;
  qr_code: string;
  verify_url: string;
  is_verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
}
