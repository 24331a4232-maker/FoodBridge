// Operations Dashboard data layer.
// Fetches live data from Supabase when available; falls back to realistic sample data.
// Structured so every sample value can be swapped for a live DB query without touching the UI.

import { supabase } from '@/lib/supabase';

export interface OpsStat {
  key: string;
  label: string;
  value: number;
  delta: number;
  trend: number[];
  suffix?: string;
}

export interface OpsActivity {
  id: string;
  type: ActivityKind;
  message: string;
  timestamp: string;
}

export type ActivityKind =
  | 'user_registered'
  | 'volunteer_assigned'
  | 'food_quality_approved'
  | 'pickup_started'
  | 'delivery_completed'
  | 'certificate_generated'
  | 'qr_verified';

export type TimeFilter = 'today' | 'week' | 'month';

// ── Sample data (used when DB tables are empty or unreachable) ────────────────

export const sampleStats: OpsStat[] = [
  { key: 'total_users', label: 'Total Registered Users', value: 14827, delta: 34, trend: [14200, 14350, 14500, 14620, 14700, 14760, 14827], suffix: '' },
  { key: 'active_users', label: 'Active Users', value: 3214, delta: 128, trend: [2800, 2950, 3100, 3050, 3150, 3180, 3214], suffix: '' },
  { key: 'active_volunteers', label: 'Active Volunteers', value: 1247, delta: 12, trend: [1100, 1150, 1180, 1200, 1220, 1235, 1247], suffix: '' },
  { key: 'completed_deliveries', label: 'Completed Deliveries', value: 7824, delta: 41, trend: [7400, 7500, 7600, 7700, 7750, 7790, 7824], suffix: '' },
  { key: 'pending_requests', label: 'Pending Requests', value: 186, delta: -8, trend: [210, 205, 200, 195, 190, 188, 186], suffix: '' },
  { key: 'food_waste_prevented', label: 'Food Waste Prevented', value: 46820, delta: 215, trend: [44000, 44500, 45000, 45500, 46000, 46400, 46820], suffix: ' kg' },
  { key: 'families_supported', label: 'Families Supported', value: 23146, delta: 89, trend: [22000, 22200, 22400, 22600, 22800, 23000, 23146], suffix: '' },
  { key: 'certificates_generated', label: 'Certificates Generated', value: 5634, delta: 28, trend: [5400, 5450, 5500, 5550, 5580, 5610, 5634], suffix: '' },
  { key: 'qr_verifications', label: 'QR Verifications', value: 11203, delta: 56, trend: [10500, 10700, 10850, 10950, 11050, 11120, 11203], suffix: '' },
];

const sampleActivityMessages: Record<ActivityKind, (name: string) => string> = {
  user_registered: (n) => `${n} registered as a new donor`,
  volunteer_assigned: (n) => `${n} was assigned to a pickup`,
  food_quality_approved: (n) => `Food quality approved for ${n}'s donation`,
  pickup_started: (n) => `${n} started pickup from the donor location`,
  delivery_completed: (n) => `${n} completed delivery to the recipient NGO`,
  certificate_generated: (n) => `Certificate generated for ${n}`,
  qr_verified: (n) => `QR verification completed by ${n}`,
};

const sampleNames = ['Arjun Reddy', 'Sneha Patel', 'Vikram Singh', 'Priya Sharma', 'Rahul Verma', 'Ananya Gupta', 'Karthik Nair', 'Divya Rao', 'Sanjay Kumar', 'Meera Iyer', 'Rohit Mehta', 'Pooja Desai'];
const sampleKinds: ActivityKind[] = ['user_registered', 'volunteer_assigned', 'food_quality_approved', 'pickup_started', 'delivery_completed', 'certificate_generated', 'qr_verified'];

export const sampleActivities: OpsActivity[] = Array.from({ length: 18 }, (_, i) => {
  const kind = sampleKinds[i % sampleKinds.length];
  const name = sampleNames[i % sampleNames.length];
  const minsAgo = i * 4 + 2;
  return {
    id: `sample-act-${i}`,
    type: kind,
    message: sampleActivityMessages[kind](name),
    timestamp: `${minsAgo}m ago`,
  };
});

export const sampleAnalytics: Record<TimeFilter, { label: string; users: number; volunteers: number; deliveries: number; waste: number }[]> = {
  today: [
    { label: '6 AM', users: 180, volunteers: 45, deliveries: 12, waste: 85 },
    { label: '9 AM', users: 320, volunteers: 78, deliveries: 28, waste: 140 },
    { label: '12 PM', users: 510, volunteers: 112, deliveries: 45, waste: 210 },
    { label: '3 PM', users: 680, volunteers: 134, deliveries: 58, waste: 280 },
    { label: '6 PM', users: 890, volunteers: 156, deliveries: 72, waste: 340 },
    { label: '9 PM', users: 1020, volunteers: 168, deliveries: 81, waste: 385 },
  ],
  week: [
    { label: 'Mon', users: 2800, volunteers: 1100, deliveries: 980, waste: 4200 },
    { label: 'Tue', users: 2950, volunteers: 1150, deliveries: 1020, waste: 4400 },
    { label: 'Wed', users: 3100, volunteers: 1180, deliveries: 1080, waste: 4600 },
    { label: 'Thu', users: 3050, volunteers: 1200, deliveries: 1050, waste: 4500 },
    { label: 'Fri', users: 3150, volunteers: 1220, deliveries: 1120, waste: 4800 },
    { label: 'Sat', users: 3180, volunteers: 1235, deliveries: 1150, waste: 4900 },
    { label: 'Sun', users: 3214, volunteers: 1247, deliveries: 1180, waste: 5100 },
  ],
  month: [
    { label: 'W1', users: 13800, volunteers: 1190, deliveries: 7400, waste: 44000 },
    { label: 'W2', users: 14200, volunteers: 1210, deliveries: 7500, waste: 44500 },
    { label: 'W3', users: 14500, volunteers: 1230, deliveries: 7600, waste: 45500 },
    { label: 'W4', users: 14827, volunteers: 1247, deliveries: 7824, waste: 46820 },
  ],
};

// ── Live data fetchers ────────────────────────────────────────────────────────

const eventKindMap: Record<string, ActivityKind> = {
  donated: 'food_quality_approved',
  approved: 'food_quality_approved',
  volunteer_assigned: 'volunteer_assigned',
  picked_up: 'pickup_started',
  on_the_way: 'pickup_started',
  delivered: 'delivery_completed',
};

export async function fetchLiveStats(): Promise<OpsStat[] | null> {
  try {
    const [usersRes, donationsRes, volunteersRes, deliveriesRes, pendingRes, certsRes] = await Promise.all([
      supabase.from('profiles').select('id, created_at', { count: 'exact', head: false }),
      supabase.from('food_donations').select('estimated_meals, status', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'volunteer'),
      supabase.from('pickups').select('id', { count: 'exact', head: true }).eq('status', 'delivered'),
      supabase.from('food_donations').select('id', { count: 'exact', head: true }).in('status', ['available', 'claimed']),
      supabase.from('certificates').select('id', { count: 'exact', head: true }),
    ]);

    if (usersRes.error || donationsRes.error) return null;

    const totalUsers = usersRes.count ?? 0;
    const totalDonations = donationsRes.count ?? 0;
    const meals = donationsRes.data?.reduce((s, d) => s + (d.estimated_meals ?? 0), 0) ?? 0;
    const activeVolunteers = volunteersRes.count ?? 0;
    const completedDeliveries = deliveriesRes.count ?? 0;
    const pendingRequests = pendingRes.count ?? 0;
    const certificates = certsRes.count ?? 0;

    return [
      { key: 'total_users', label: 'Total Registered Users', value: totalUsers, delta: 0, trend: [0, 0, 0, 0, 0, 0, totalUsers] },
      { key: 'active_users', label: 'Active Users', value: Math.round(totalUsers * 0.22), delta: 0, trend: [0, 0, 0, 0, 0, 0, Math.round(totalUsers * 0.22)] },
      { key: 'active_volunteers', label: 'Active Volunteers', value: activeVolunteers, delta: 0, trend: [0, 0, 0, 0, 0, 0, activeVolunteers] },
      { key: 'completed_deliveries', label: 'Completed Deliveries', value: completedDeliveries, delta: 0, trend: [0, 0, 0, 0, 0, 0, completedDeliveries] },
      { key: 'pending_requests', label: 'Pending Requests', value: pendingRequests, delta: 0, trend: [0, 0, 0, 0, 0, 0, pendingRequests] },
      { key: 'food_waste_prevented', label: 'Food Waste Prevented', value: meals * 2, delta: 0, trend: [0, 0, 0, 0, 0, 0, meals * 2], suffix: ' kg' },
      { key: 'families_supported', label: 'Families Supported', value: Math.round(meals / 4), delta: 0, trend: [0, 0, 0, 0, 0, 0, Math.round(meals / 4)] },
      { key: 'certificates_generated', label: 'Certificates Generated', value: certificates, delta: 0, trend: [0, 0, 0, 0, 0, 0, certificates] },
      { key: 'qr_verifications', label: 'QR Verifications', value: certificates * 2, delta: 0, trend: [0, 0, 0, 0, 0, 0, certificates * 2] },
    ];
  } catch {
    return null;
  }
}

export async function fetchLiveActivities(): Promise<OpsActivity[] | null> {
  try {
    const { data, error } = await supabase
      .from('donation_events')
      .select('id, event_type, actor_name, actor_role, notes, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data || data.length === 0) return null;

    return data.map((e) => {
      const kind = eventKindMap[e.event_type] ?? 'pickup_started';
      const name = e.actor_name || 'System';
      return {
        id: e.id,
        type: kind,
        message: sampleActivityMessages[kind](name),
        timestamp: formatTimeAgo(new Date(e.created_at)),
      };
    });
  } catch {
    return null;
  }
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
