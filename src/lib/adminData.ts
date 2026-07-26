// Realistic sample data for the Admin Dashboard — mimics a production NGO platform.

export type AdminDonationStatus =
  | 'Pending'
  | 'Quality Check'
  | 'Volunteer Assigned'
  | 'Picked Up'
  | 'In Transit'
  | 'Delivered'
  | 'Completed';

export interface AdminDonation {
  id: string;
  donorName: string;
  foodType: string;
  quantity: string;
  pickupAddress: string;
  assignedVolunteer: string;
  status: AdminDonationStatus;
  qualityScore: number;
  donationDate: string;
  deliveryTime: string | null;
}

export type AdminUserRole = 'Donor' | 'Volunteer' | 'NGO' | 'Restaurant' | 'Admin';
export type VerificationStatus = 'Verified' | 'Pending' | 'Suspended';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminUserRole;
  city: string;
  avatar: string;
  registeredOn: string;
  verification: VerificationStatus;
  lastLogin: string;
  totalDonations: number;
  totalDeliveries: number;
}

export interface AdminVolunteer {
  id: string;
  name: string;
  city: string;
  availability: 'Available' | 'On Delivery' | 'Offline';
  completedDeliveries: number;
  currentAssignment: string | null;
  avgRating: number;
  responseTime: string;
  verified: boolean;
}

export interface FoodQualityReport {
  donationId: string;
  temperature: string;
  packaging: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  freshness: 'Fresh' | 'Good' | 'Average' | 'Stale';
  expiryCheck: 'Pass' | 'Fail';
  inspectionResult: 'Approved' | 'Rejected' | 'Pending';
  inspector: string;
  approvalStatus: 'Approved' | 'Pending' | 'Rejected';
}

export type ActivityType =
  | 'user_registered'
  | 'donation_submitted'
  | 'volunteer_assigned'
  | 'pickup_started'
  | 'food_delivered'
  | 'certificate_generated'
  | 'qr_verified';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: string;
}

export interface OverviewStat {
  key: string;
  label: string;
  icon: string;
  value: number;
  todayIncrease: number;
  weeklyTrend: number;
  monthlyTrend: number;
  sparkline: number[];
  status: 'up' | 'down' | 'stable';
  suffix?: string;
}

// ── Overview stats (12 cards) ───────────────────────────────────────────────
export const overviewStats: OverviewStat[] = [
  { key: 'users', label: 'Total Registered Users', icon: 'users', value: 14827, todayIncrease: 34, weeklyTrend: 8.2, monthlyTrend: 24.5, sparkline: [12, 18, 15, 22, 28, 25, 34], status: 'up' },
  { key: 'donations', label: 'Total Food Donations', icon: 'package', value: 9341, todayIncrease: 47, weeklyTrend: 12.1, monthlyTrend: 31.8, sparkline: [20, 25, 22, 30, 35, 40, 47], status: 'up' },
  { key: 'pending', label: 'Pending Donations', icon: 'clock', value: 186, todayIncrease: 5, weeklyTrend: -3.4, monthlyTrend: 6.2, sparkline: [8, 6, 10, 7, 5, 9, 5], status: 'down' },
  { key: 'completed', label: 'Completed Deliveries', icon: 'check', value: 7824, todayIncrease: 41, weeklyTrend: 14.7, monthlyTrend: 28.3, sparkline: [15, 20, 25, 28, 32, 38, 41], status: 'up' },
  { key: 'volunteers', label: 'Active Volunteers', icon: 'truck', value: 1247, todayIncrease: 12, weeklyTrend: 5.6, monthlyTrend: 18.9, sparkline: [5, 8, 6, 10, 9, 11, 12], status: 'up' },
  { key: 'restaurants', label: 'Partner Restaurants', icon: 'hotel', value: 386, todayIncrease: 3, weeklyTrend: 2.1, monthlyTrend: 9.4, sparkline: [1, 2, 1, 2, 3, 2, 3], status: 'up' },
  { key: 'ngos', label: 'Registered NGOs', icon: 'building', value: 192, todayIncrease: 2, weeklyTrend: 1.8, monthlyTrend: 7.2, sparkline: [1, 1, 2, 1, 2, 1, 2], status: 'up' },
  { key: 'certificates', label: 'Certificates Generated', icon: 'scroll', value: 5634, todayIncrease: 28, weeklyTrend: 9.3, monthlyTrend: 22.7, sparkline: [10, 15, 18, 20, 22, 25, 28], status: 'up' },
  { key: 'qr', label: 'QR Verifications', icon: 'qr', value: 11203, todayIncrease: 56, weeklyTrend: 16.4, monthlyTrend: 34.1, sparkline: [25, 30, 35, 40, 45, 50, 56], status: 'up' },
  { key: 'waste', label: 'Food Waste Prevented (kg)', icon: 'recycle', value: 46820, todayIncrease: 215, weeklyTrend: 11.2, monthlyTrend: 29.6, sparkline: [80, 120, 150, 180, 195, 205, 215], status: 'up', suffix: ' kg' },
  { key: 'families', label: 'Families Served', icon: 'heart', value: 23146, todayIncrease: 89, weeklyTrend: 13.8, monthlyTrend: 26.4, sparkline: [30, 45, 55, 65, 72, 80, 89], status: 'up' },
  { key: 'rating', label: 'Average Food Quality Rating', icon: 'star', value: 4.7, todayIncrease: 0, weeklyTrend: 1.2, monthlyTrend: 3.4, sparkline: [4.5, 4.6, 4.5, 4.7, 4.6, 4.7, 4.7], status: 'stable', suffix: '/5' },
];

// ── Donations ───────────────────────────────────────────────────────────────
const donorNames = [
  'The Taj Hotel', 'Biryani House', 'Green Leaf Catering', 'Sunrise Bakery', 'Spice Garden Restaurant',
  'Royal Feast Banquets', 'Annapurna Meals Trust', 'Hyderabad House', 'Paradise Food Court', 'Ohri\'s Group',
  'Barbeque Nation', 'Mainland China', 'Ohris Banjara', 'Minerva Coffee Club', 'Swagath Grand',
  'Komatose Hotel', 'Jubilee Restaurant', 'Pearl Restaurant', 'Southern Spice', 'Blue Star Cafe',
];
const foodTypes = [
  'Veg Biryani (50 portions)', 'Roti Bundle (200 pcs)', 'Dal & Rice (30 portions)', 'Idli Sambar (40 portions)',
  'Mixed Curry (25 portions)', 'Sandwiches (60 pcs)', 'Fresh Fruits (15 kg)', 'Cooked Rice (20 kg)',
  'Chapati & Curry (35 portions)', 'Pasta (40 portions)', 'Dosa Batter (10 kg)', 'Samosa (100 pcs)',
  'Veg Pulao (45 portions)', 'Curd Rice (30 portions)', 'Lemon Rice (25 portions)',
];
const cities = ['Hyderabad', 'Secunderabad', 'Vizag', 'Warangal', 'Guntur', 'Vijayawada', 'Tirupati', 'Kurnool'];
const volunteerNames = [
  'Arjun Reddy', 'Sneha Patel', 'Vikram Singh', 'Priya Sharma', 'Rahul Verma', 'Ananya Gupta',
  'Karthik Nair', 'Divya Rao', 'Sanjay Kumar', 'Meera Iyer', 'Rohit Mehta', 'Pooja Desai',
];
const statuses: AdminDonationStatus[] = ['Pending', 'Quality Check', 'Volunteer Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Completed'];

function seedRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = seedRand(42);

export const adminDonations: AdminDonation[] = Array.from({ length: 48 }, (_, i) => {
  const status = statuses[Math.floor(rand() * statuses.length)];
  const date = new Date(2026, 6, 26 - Math.floor(rand() * 14));
  const hasDelivery = ['Delivered', 'Completed', 'In Transit'].includes(status);
  return {
    id: `FB-DON-${(10000 + i).toString()}`,
    donorName: donorNames[i % donorNames.length],
    foodType: foodTypes[i % foodTypes.length],
    quantity: `${Math.floor(rand() * 80) + 10} ${rand() > 0.5 ? 'kg' : 'portions'}`,
    pickupAddress: `${Math.floor(rand() * 200) + 1} ${['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Madhapur', 'Kondapur', 'Begumpet'][i % 6]}, ${cities[i % cities.length]}`,
    assignedVolunteer: rand() > 0.2 ? volunteerNames[i % volunteerNames.length] : '—',
    status,
    qualityScore: Math.round((rand() * 2 + 3) * 10) / 10,
    donationDate: date.toISOString().split('T')[0],
    deliveryTime: hasDelivery ? `${String(Math.floor(rand() * 12) + 8).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')} ${rand() > 0.5 ? 'AM' : 'PM'}` : null,
  };
});

// ── Users ───────────────────────────────────────────────────────────────────
const firstNames = ['Arjun', 'Sneha', 'Vikram', 'Priya', 'Rahul', 'Ananya', 'Karthik', 'Divya', 'Sanjay', 'Meera', 'Rohit', 'Pooja', 'Arun', 'Kavya', 'Nikhil', 'Srija', 'Manoj', 'Harika', 'Gopal', 'Lakshmi'];
const lastNames = ['Reddy', 'Patel', 'Singh', 'Sharma', 'Verma', 'Gupta', 'Nair', 'Rao', 'Kumar', 'Iyer', 'Mehta', 'Desai', 'Chowdary', 'Bose', 'Menon', 'Joshi', 'Pillai', 'Shetty'];
const roles: AdminUserRole[] = ['Donor', 'Volunteer', 'NGO', 'Restaurant', 'Admin'];
const verifications: VerificationStatus[] = ['Verified', 'Pending', 'Suspended'];

export const adminUsers: AdminUser[] = Array.from({ length: 52 }, (_, i) => {
  const role = i < 20 ? 'Donor' : i < 35 ? 'Volunteer' : i < 42 ? 'NGO' : i < 50 ? 'Restaurant' : 'Admin';
  const first = firstNames[i % firstNames.length];
  const last = lastNames[i % lastNames.length];
  const name = role === 'Restaurant' || role === 'NGO'
    ? `${first} ${last} Foundation`
    : `${first} ${last}`;
  const regDate = new Date(2026, 6, 26 - Math.floor(rand() * 120));
  const lastLoginDate = new Date(2026, 6, 26 - Math.floor(rand() * 7));
  return {
    id: `FB-USR-${(20000 + i).toString()}`,
    name,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@gmail.com`,
    phone: `+91 ${Math.floor(rand() * 90000 + 10000)} ${Math.floor(rand() * 90000 + 10000)}`,
    role,
    city: cities[i % cities.length],
    avatar: `https://i.pravatar.cc/100?img=${(i % 70) + 1}`,
    registeredOn: regDate.toISOString().split('T')[0],
    verification: i % 7 === 0 ? 'Pending' : i % 17 === 0 ? 'Suspended' : 'Verified',
    lastLogin: lastLoginDate.toISOString().split('T')[0],
    totalDonations: role === 'Donor' || role === 'Restaurant' ? Math.floor(rand() * 80) + 1 : 0,
    totalDeliveries: role === 'Volunteer' ? Math.floor(rand() * 120) + 1 : 0,
  };
});

// ── Volunteers ──────────────────────────────────────────────────────────────
const availabilities: AdminVolunteer['availability'][] = ['Available', 'On Delivery', 'Offline'];

export const adminVolunteers: AdminVolunteer[] = Array.from({ length: 18 }, (_, i) => {
  const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
  const avail = availabilities[i % 3];
  return {
    id: `FB-VOL-${(30000 + i).toString()}`,
    name,
    city: cities[i % cities.length],
    availability: avail,
    completedDeliveries: Math.floor(rand() * 150) + 5,
    currentAssignment: avail === 'On Delivery' ? `FB-DON-${(10000 + i).toString()}` : null,
    avgRating: Math.round((rand() * 1.5 + 3.5) * 10) / 10,
    responseTime: `${Math.floor(rand() * 15) + 2} min`,
    verified: i % 5 !== 0,
  };
});

// ── Food Quality Reports ─────────────────────────────────────────────────────
const packagings: FoodQualityReport['packaging'][] = ['Excellent', 'Good', 'Fair', 'Poor'];
const freshnesses: FoodQualityReport['freshness'][] = ['Fresh', 'Good', 'Average', 'Stale'];
const inspectionResults: FoodQualityReport['inspectionResult'][] = ['Approved', 'Rejected', 'Pending'];
const inspectors = ['Dr. Meena Rao', 'Dr. Suresh Babu', 'Dr. Anita Desai', 'Dr. Rajesh Khanna'];

export const foodQualityReports: FoodQualityReport[] = Array.from({ length: 24 }, (_, i) => {
  const result = i % 6 === 0 ? 'Rejected' : i % 4 === 0 ? 'Pending' : 'Approved';
  const temp = `${Math.floor(rand() * 15 + 2)}°C`;
  return {
    donationId: `FB-DON-${(10000 + i).toString()}`,
    temperature: temp,
    packaging: packagings[i % packagings.length],
    freshness: freshnesses[i % freshnesses.length],
    expiryCheck: result === 'Rejected' && i % 2 === 0 ? 'Fail' : 'Pass',
    inspectionResult: result as FoodQualityReport['inspectionResult'],
    inspector: inspectors[i % inspectors.length],
    approvalStatus: result as FoodQualityReport['approvalStatus'],
  };
});

// ── Live Activity Feed ──────────────────────────────────────────────────────
const activityTemplates: { type: ActivityType; message: (n: string) => string }[] = [
  { type: 'user_registered', message: (n) => `${n} registered as a new Donor` },
  { type: 'donation_submitted', message: (n) => `${n} submitted a new food donation` },
  { type: 'volunteer_assigned', message: (n) => `${n} was assigned to a pickup` },
  { type: 'pickup_started', message: (n) => `${n} started pickup for donation FB-DON-10042` },
  { type: 'food_delivered', message: (n) => `${n} delivered food to Annapurna Trust` },
  { type: 'certificate_generated', message: (n) => `Certificate generated for ${n}` },
  { type: 'qr_verified', message: (n) => `QR code verified for donation by ${n}` },
];

export const liveActivities: ActivityEntry[] = Array.from({ length: 20 }, (_, i) => {
  const tmpl = activityTemplates[i % activityTemplates.length];
  const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
  const minsAgo = i * 3 + Math.floor(rand() * 2);
  return {
    id: `act-${i}`,
    type: tmpl.type,
    message: tmpl.message(name),
    timestamp: `${minsAgo}m ago`,
  };
});

// ── Analytics (12 months) ───────────────────────────────────────────────────
export const monthlyAnalytics = [
  { month: 'Aug', donations: 620, deliveries: 540, users: 9800, volunteers: 890 },
  { month: 'Sep', donations: 715, deliveries: 630, users: 10200, volunteers: 940 },
  { month: 'Oct', donations: 680, deliveries: 610, users: 10650, volunteers: 970 },
  { month: 'Nov', donations: 790, deliveries: 720, users: 11100, volunteers: 1010 },
  { month: 'Dec', donations: 850, deliveries: 780, users: 11550, volunteers: 1050 },
  { month: 'Jan', donations: 820, deliveries: 750, users: 12000, volunteers: 1090 },
  { month: 'Feb', donations: 910, deliveries: 840, users: 12450, volunteers: 1130 },
  { month: 'Mar', donations: 880, deliveries: 810, users: 12900, volunteers: 1160 },
  { month: 'Apr', donations: 950, deliveries: 880, users: 13350, volunteers: 1190 },
  { month: 'May', donations: 920, deliveries: 860, users: 13800, volunteers: 1210 },
  { month: 'Jun', donations: 1010, deliveries: 940, users: 14250, volunteers: 1230 },
  { month: 'Jul', donations: 9341, deliveries: 7824, users: 14827, volunteers: 1247 },
];

// ── Recent Donations (latest 10) ────────────────────────────────────────────
export const recentDonations = adminDonations.slice(0, 10);
