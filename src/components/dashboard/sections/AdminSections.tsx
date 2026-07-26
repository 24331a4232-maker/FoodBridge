import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Package, Truck, Store, Building2, ShieldCheck, QrCode, Award,
  BarChart3, FileText, Bell, Settings, Radio, TrendingUp, TrendingDown,
  Loader2, Search, CheckCircle2, Clock, XCircle, Download, Star,
  Activity, AlertTriangle, Eye, EyeOff, Filter, Save, RefreshCw,
  Camera, MapPin,
} from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Line, Area, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { AnimatedCounter } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { DashboardSectionHeader, StatCard } from '@/components/dashboard/DashboardLayout';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { LeafletMap, type MapPoint } from '@/components/LeafletMap';
import {
  type OpsStat, type OpsActivity, type ActivityKind, type TimeFilter,
  fetchLiveStats, fetchLiveActivities, fetchLiveAnalytics, subscribeToStats,
} from '@/lib/opsData';
import type { Profile, FoodDonation, Pickup, Certificate, QrVerification, FoodQualityInspection, UserRole, DonationHandover } from '@/types';

/* ---------- Dashboard Overview ---------- */
const statIcons: Record<string, { icon: typeof Users; bg: string }> = {
  total_users: { icon: Users, bg: 'from-secondary-500 to-primary-500' },
  active_users: { icon: Activity, bg: 'from-blue-500 to-cyan-500' },
  total_donations: { icon: Package, bg: 'from-primary-500 to-primary-600' },
  pending_requests: { icon: Clock, bg: 'from-rose-500 to-pink-500' },
  completed_deliveries: { icon: CheckCircle2, bg: 'from-green-500 to-emerald-500' },
  active_volunteers: { icon: Truck, bg: 'from-amber-500 to-orange-500' },
  restaurants: { icon: Store, bg: 'from-rose-500 to-pink-500' },
  ngos: { icon: Building2, bg: 'from-teal-500 to-green-500' },
  food_waste_prevented: { icon: TrendingUp, bg: 'from-lime-500 to-green-500' },
  families_supported: { icon: Users, bg: 'from-red-500 to-rose-500' },
  certificates_generated: { icon: Award, bg: 'from-indigo-500 to-blue-500' },
  qr_verifications: { icon: QrCode, bg: 'from-purple-500 to-violet-500' },
};

const activityMeta: Record<ActivityKind, { icon: typeof Users; color: string }> = {
  user_registered: { icon: Users, color: 'bg-blue-500' },
  donation_submitted: { icon: Package, color: 'bg-primary-500' },
  volunteer_assigned: { icon: Truck, color: 'bg-amber-500' },
  food_quality_approved: { icon: ShieldCheck, color: 'bg-green-500' },
  pickup_started: { icon: Radio, color: 'bg-orange-500' },
  delivery_completed: { icon: CheckCircle2, color: 'bg-emerald-500' },
  certificate_generated: { icon: Award, color: 'bg-indigo-500' },
  qr_verified: { icon: QrCode, color: 'bg-purple-500' },
};

export function AdminOverviewSection() {
  const [stats, setStats] = useState<OpsStat[]>([]);
  const [activities, setActivities] = useState<OpsActivity[]>([]);
  const [chartData, setChartData] = useState<{ label: string; users: number; deliveries: number; waste: number }[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const [liveStats, liveActs] = await Promise.all([fetchLiveStats(), fetchLiveActivities()]);
    setStats(liveStats);
    setActivities(liveActs);
    setLoading(false);
  }, []);

  const loadChart = useCallback(async (filter: TimeFilter) => {
    setChartLoading(true);
    const data = await fetchLiveAnalytics(filter);
    setChartData(data);
    setChartLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
    loadChart(timeFilter);
    const unsub = subscribeToStats(() => { loadAll(); loadChart(timeFilter); });
    return unsub;
  }, []);

  useEffect(() => { loadChart(timeFilter); }, [timeFilter, loadChart]);

  const timeFilters: { key: TimeFilter; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  return (
    <div>
      <DashboardSectionHeader
        title="Dashboard Overview"
        description="Real-time overview of FoodBridge platform activity."
        action={<div className="flex items-center gap-2 px-3 py-2 rounded-xl glass"><span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /><span className="text-xs font-medium text-gray-600 dark:text-gray-300">{loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Live Data'}</span></div>}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-8">
        {stats.map((stat, i) => {
          const meta = statIcons[stat.key] ?? statIcons.total_users;
          const Icon = meta.icon;
          return (
            <motion.div key={stat.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${meta.bg} text-white flex items-center justify-center shadow-lg mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-display text-xl sm:text-2xl font-bold tabular-nums">{loading ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : <AnimatedCounter value={stat.value} suffix={stat.suffix ?? ''} />}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass-card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary-600" /><h2 className="font-display text-lg font-bold">Platform Analytics</h2></div>
            <div className="flex gap-1.5">
              {timeFilters.map((f) => (
                <button key={f.key} onClick={() => setTimeFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${timeFilter === f.key ? 'bg-primary-600 text-white' : 'glass hover:bg-primary-50 dark:hover:bg-primary-900/30'}`}>{f.label}</button>
              ))}
            </div>
          </div>
          <div className="h-[300px] relative">
            {chartLoading ? <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div> : chartData.length === 0 ? <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No data for this period</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="users" name="New Users" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="deliveries" name="Deliveries" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="waste" name="Waste Prevented (kg)" stroke="#4F8060" strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4"><span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" /><h2 className="font-display text-lg font-bold">Live Activity</h2></div>
          <div className="space-y-2.5 flex-1 overflow-y-auto no-scrollbar max-h-[340px]">
            {loading && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>}
            {!loading && activities.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No recent activity</p>}
            {!loading && activities.map((act, i) => {
              const { icon: Icon, color } = activityMeta[act.type];
              return (
                <motion.div key={act.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 p-3 rounded-xl glass">
                  <div className={`h-9 w-9 rounded-lg ${color} text-white flex items-center justify-center shrink-0 shadow`}><Icon className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium leading-tight">{act.message}</p><p className="text-[11px] text-gray-400 mt-0.5">{act.timestamp}</p></div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- User Management ---------- */
export function AdminUserManagementSection() {
  return (
    <div>
      <DashboardSectionHeader title="User Management" description="View and manage all registered users on the platform." />
      <UserManagementTable />
    </div>
  );
}

/* ---------- Donation Management ---------- */
export function AdminDonationManagementSection() {
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const load = useCallback(async () => {
    const { data } = await supabase.from('food_donations').select('*').order('created_at', { ascending: false });
    setDonations((data as FoodDonation[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase.channel('admin-donations').on('postgres_changes', { event: '*', schema: 'public', table: 'food_donations' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return donations.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (!q) return true;
      return d.food_name.toLowerCase().includes(q) || d.organization.toLowerCase().includes(q) || d.donor_name.toLowerCase().includes(q);
    });
  }, [donations, search, statusFilter]);

  const statusColors: Record<string, string> = {
    available: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    claimed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    picked_up: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div>
      <DashboardSectionHeader title="Donation Management" description="Monitor and manage all food donations on the platform." />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Package} label="Total" value={donations.length} color="bg-primary-500" />
        <StatCard icon={Clock} label="Pending" value={donations.filter((d) => d.status === 'available' || d.status === 'claimed').length} color="bg-amber-500" />
        <StatCard icon={CheckCircle2} label="Delivered" value={donations.filter((d) => d.status === 'delivered').length} color="bg-green-500" />
        <StatCard icon={XCircle} label="Cancelled" value={donations.filter((d) => d.status === 'cancelled').length} color="bg-red-500" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search donations..." className="input-field pl-12" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-48">
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="claimed">Claimed</option>
          <option value="picked_up">Picked Up</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div> : filtered.length === 0 ? <div className="glass-card p-10 text-center"><p className="text-gray-500">No donations found.</p></div> : (
        <div className="space-y-2">
          {filtered.slice(0, 20).map((d, i) => {
            const badgeClass = statusColors[d.status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
            return (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="glass-card p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center shrink-0"><Package className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{d.food_name}</p>
                <p className="text-xs text-gray-500 truncate">{d.organization} - {d.donor_name}</p>
              </div>
              <div className="hidden sm:block text-xs text-gray-400">{d.quantity} {d.quantity_unit}</div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0 ${badgeClass}`}>{d.status}</span>
            </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Volunteer Management ---------- */
export function AdminVolunteerManagementSection() {
  const [volunteers, setVolunteers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'volunteer').order('created_at', { ascending: false });
      setVolunteers((data as Profile[]) ?? []);
      setLoading(false);
    };
    load();
    const ch = supabase.channel('admin-vol').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const availColors: Record<string, string> = {
    available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    on_delivery: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    offline: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <div>
      <DashboardSectionHeader title="Volunteer Management" description="Manage volunteer accounts and monitor availability." />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Truck} label="Total" value={volunteers.length} color="bg-blue-500" />
        <StatCard icon={CheckCircle2} label="Available" value={volunteers.filter((v) => v.availability === 'available').length} color="bg-green-500" />
        <StatCard icon={Clock} label="On Delivery" value={volunteers.filter((v) => v.availability === 'on_delivery').length} color="bg-amber-500" />
        <StatCard icon={Star} label="Avg Rating" value={(volunteers.reduce((s, v) => s + (v.rating ?? 0), 0) / (volunteers.length || 1)).toFixed(1)} color="bg-yellow-500" />
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div> : volunteers.length === 0 ? <div className="glass-card p-10 text-center"><p className="text-gray-500">No volunteers registered.</p></div> : (
        <div className="space-y-2">
          {volunteers.map((v, i) => {
            const availClass = availColors[v.availability] || availColors.offline;
            return (
            <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 flex items-center justify-center text-sm font-bold shrink-0">{v.full_name?.[0]?.toUpperCase() ?? 'V'}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{v.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{v.total_deliveries} deliveries - {Math.round(v.total_hours)} hrs</p>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-xs"><Star className="h-3.5 w-3.5 text-yellow-500" />{v.rating ?? 0}</div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0 ${availClass}`}>{v.availability}</span>
            </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Volunteer Location Tracking ---------- */
export function AdminVolunteerTrackingSection() {
  const [volunteers, setVolunteers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'volunteer')
      .order('created_at', { ascending: false });
    setVolunteers((data as Profile[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel('admin-vol-track')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const located = volunteers.filter(
    (v) => v.current_location_lat != null && v.current_location_lng != null,
  );

  const mapPoints: MapPoint[] = located.map((v) => ({
    lat: v.current_location_lat as number,
    lng: v.current_location_lng as number,
    type: 'volunteer',
    label: v.full_name,
    popup: `<strong>${v.full_name}</strong><br/>${v.availability}<br/>${v.total_deliveries} deliveries`,
  }));

  const selected = located.find((v) => v.id === selectedId) ?? null;
  const selectedPoint: MapPoint | null = selected
    ? { lat: selected.current_location_lat as number, lng: selected.current_location_lng as number, type: 'volunteer', label: selected.full_name }
    : null;

  return (
    <div>
      <DashboardSectionHeader
        title="Volunteer Location Tracking"
        description="See where volunteers are currently sharing their live location."
        action={
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass">
            <span className={`h-2 w-2 rounded-full ${located.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {located.length} live
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-4">
          <div className="h-[420px]">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : mapPoints.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MapPin className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No volunteers are sharing their location right now.</p>
                <p className="text-xs text-gray-400 mt-1">Volunteers can enable sharing from their Live Tracking tab.</p>
              </div>
            ) : (
              <LeafletMap points={mapPoints} selectedPoint={selectedPoint} height="h-full" />
            )}
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col">
          <h3 className="font-display font-bold mb-3 flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary-500" /> Live Volunteers
          </h3>
          <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar max-h-[380px]">
            {located.length === 0 && !loading && (
              <p className="text-sm text-gray-400 text-center py-6">No active locations.</p>
            )}
            {located.map((v) => {
              const availColors: Record<string, string> = {
                available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                on_delivery: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                offline: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
              };
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedId(selectedId === v.id ? null : v.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${selectedId === v.id ? 'bg-primary-50 dark:bg-primary-900/30 ring-2 ring-primary-500' : 'glass hover:bg-primary-50/50 dark:hover:bg-primary-900/20'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 flex items-center justify-center text-sm font-bold shrink-0">
                      {v.full_name?.[0]?.toUpperCase() ?? 'V'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{v.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {v.current_location_lat?.toFixed(4)}, {v.current_location_lng?.toFixed(4)}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${availColors[v.availability]}`}>
                      {v.availability}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Restaurant Management ---------- */
export function AdminRestaurantManagementSection() {
  const [restaurants, setRestaurants] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [donationCounts, setDonationCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'restaurant').order('created_at', { ascending: false });
      const rest = (profiles as Profile[]) ?? [];
      setRestaurants(rest);
      const counts: Record<string, number> = {};
      await Promise.all(rest.map(async (r) => {
        const { count } = await supabase.from('food_donations').select('id', { count: 'exact', head: true }).eq('donor_id', r.id);
        counts[r.id] = count ?? 0;
      }));
      setDonationCounts(counts);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <DashboardSectionHeader title="Restaurant Management" description="Manage partner restaurants and their donation activity." />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Store} label="Total" value={restaurants.length} color="bg-rose-500" />
        <StatCard icon={Package} label="Total Donations" value={Object.values(donationCounts).reduce((s, c) => s + c, 0)} color="bg-primary-500" />
        <StatCard icon={CheckCircle2} label="Verified" value={restaurants.filter((r) => r.is_verified).length} color="bg-green-500" />
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div> : restaurants.length === 0 ? <div className="glass-card p-10 text-center"><p className="text-gray-500">No restaurants registered.</p></div> : (
        <div className="space-y-2">
          {restaurants.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300 flex items-center justify-center text-sm font-bold shrink-0">{r.full_name?.[0]?.toUpperCase() ?? 'R'}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{r.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{r.organization ?? r.email}</p>
              </div>
              <div className="text-xs text-gray-500">{donationCounts[r.id] ?? 0} donations</div>
              {r.is_verified && <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- NGO Management ---------- */
export function AdminNgoManagementSection() {
  const [ngos, setNgos] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'ngo').order('created_at', { ascending: false });
      setNgos((data as Profile[]) ?? []);
      setLoading(false);
    };
    load();
    const ch = supabase.channel('admin-ngo').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div>
      <DashboardSectionHeader title="NGO Management" description="Manage registered NGOs and their contact information." />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Building2} label="Total" value={ngos.length} color="bg-teal-500" />
        <StatCard icon={CheckCircle2} label="Verified" value={ngos.filter((n) => n.is_verified).length} color="bg-green-500" />
        <StatCard icon={Clock} label="Pending" value={ngos.filter((n) => !n.is_verified).length} color="bg-amber-500" />
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div> : ngos.length === 0 ? <div className="glass-card p-10 text-center"><p className="text-gray-500">No NGOs registered.</p></div> : (
        <div className="space-y-2">
          {ngos.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300 flex items-center justify-center text-sm font-bold shrink-0">{n.full_name?.[0]?.toUpperCase() ?? 'N'}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{n.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{n.organization ?? n.email}</p>
              </div>
              <div className="hidden sm:block text-xs text-gray-500">{[n.city, n.state].filter(Boolean).join(', ') || 'No location'}</div>
              {n.is_verified ? <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" /> : <Clock className="h-4 w-4 text-amber-500 shrink-0" />}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Food Quality Monitoring ---------- */
export function AdminFoodQualitySection() {
  const [inspections, setInspections] = useState<FoodQualityInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FoodQualityInspection | null>(null);
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected' | 'pending'>('all');

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('food_quality_inspections')
      .select('*, donation:food_donations(*), pickup:pickups(*)')
      .order('created_at', { ascending: false })
      .limit(50);
    setInspections((data as FoodQualityInspection[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase.channel('admin-quality').on('postgres_changes', { event: '*', schema: 'public', table: 'food_quality_inspections' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const statusColors: Record<string, string> = {
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  const reasonLabel = (reason: string) =>
    ({ expired: 'Expired', damaged_packaging: 'Damaged Packaging', bad_smell: 'Bad Smell', contaminated: 'Contaminated', unsafe_temperature: 'Unsafe Temperature' } as Record<string, string>)[reason] ?? reason;

  const filtered = inspections.filter((i) => filter === 'all' || i.approval_status === filter);

  return (
    <div>
      <DashboardSectionHeader title="Food Quality Monitoring" description="Review food quality inspections, photos, ratings, and volunteer reports." />
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon={CheckCircle2} label="Approved" value={inspections.filter((i) => i.approval_status === 'approved').length} color="bg-green-500" />
        <StatCard icon={Clock} label="Pending" value={inspections.filter((i) => i.approval_status === 'pending').length} color="bg-amber-500" />
        <StatCard icon={XCircle} label="Rejected" value={inspections.filter((i) => i.approval_status === 'rejected').length} color="bg-red-500" />
        <StatCard icon={Star} label="Avg Rating" value={(inspections.reduce((s, i) => s + (i.rating ?? 0), 0) / (inspections.length || 1)).toFixed(1)} color="bg-yellow-500" />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {(['all', 'approved', 'rejected', 'pending'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${filter === f ? 'bg-primary-600 text-white' : 'glass hover:bg-primary-50 dark:hover:bg-primary-900/30'}`}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-10 text-center"><ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No quality inspections yet.</p></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((insp, i) => (
            <motion.div key={insp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center text-sm font-bold shrink-0">
                    {insp.inspector_name?.[0]?.toUpperCase() ?? 'V'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{insp.inspector_name || 'Unknown inspector'}</p>
                    <p className="text-xs text-gray-400 truncate">{insp.donation?.food_name ?? 'Donation'} - {new Date(insp.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0 ${statusColors[insp.approval_status]}`}>{insp.approval_status}</span>
              </div>

              {/* Photo + rating */}
              <div className="flex gap-3 mb-3">
                {insp.photo_url ? (
                  <img src={insp.photo_url} alt="Food" className="h-20 w-20 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0"><Camera className="h-6 w-6 text-gray-400" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`h-4 w-4 ${n <= (insp.rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                    ))}
                    <span className="ml-1 text-xs text-gray-500">{insp.rating ?? 0}/5</span>
                  </div>
                  {insp.approval_status === 'rejected' && insp.rejection_reason && (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1"><XCircle className="h-3 w-3" /> {reasonLabel(insp.rejection_reason)}</p>
                  )}
                  {insp.pickup?.current_lat != null && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {insp.pickup.current_lat.toFixed(4)}, {insp.pickup.current_lng?.toFixed(4)}</p>
                  )}
                </div>
              </div>

              {/* Quality grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
                <div><span className="text-gray-400">Freshness:</span> <span className="font-medium capitalize">{insp.freshness}</span></div>
                <div><span className="text-gray-400">Packaging:</span> <span className="font-medium capitalize">{insp.packaging}</span></div>
                <div><span className="text-gray-400">Temp:</span> <span className="font-medium">{insp.temperature || 'N/A'}</span></div>
                <div><span className="text-gray-400">Expiry:</span> <span className="font-medium capitalize">{insp.expiry_check}</span></div>
              </div>

              {insp.notes && <p className="text-xs text-gray-500 mb-3">{insp.notes}</p>}

              <RippleButton onClick={() => setSelected(selected?.id === insp.id ? null : insp)} variant="ghost" className="text-xs w-full">
                <Eye className="h-3.5 w-3.5" /> {selected?.id === insp.id ? 'Hide' : 'View'} Full Report
              </RippleButton>

              {selected?.id === insp.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden mt-3 pt-3 border-t border-linen dark:border-secondary-800">
                  <p className="text-xs font-medium mb-2">Checklist</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {Object.entries(insp.checklist ?? {}).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-2 text-xs">
                        {v ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <XCircle className="h-3.5 w-3.5 text-red-400" />}
                        <span className="capitalize">{k.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                  {insp.photo_url && <img src={insp.photo_url} alt="Food full" className="mt-3 w-full max-h-64 object-cover rounded-xl" />}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- QR Verification ---------- */
export function AdminQrVerificationSection() {
  const [handovers, setHandovers] = useState<DonationHandover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('donation_handovers')
        .select('*, donation:food_donations(*), volunteer:profiles!volunteer_id(*), donor:profiles!donor_id(*)')
        .order('created_at', { ascending: false })
        .limit(40);
      setHandovers((data as DonationHandover[]) ?? []);
      setLoading(false);
    };
    load();
    const ch = supabase.channel('admin-qr').on('postgres_changes', { event: '*', schema: 'public', table: 'donation_handovers' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const statusColors: Record<string, string> = {
    waiting_volunteer: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    volunteer_assigned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    qr_verified: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    quality_approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    quality_rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    picked_up: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <div>
      <DashboardSectionHeader title="QR Verification" description="Monitor QR-based donation handovers: verification status, volunteer, donor, pickup time, and food quality reports." />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon={QrCode} label="Total Handovers" value={handovers.length} color="bg-purple-500" />
        <StatCard icon={CheckCircle2} label="QR Verified" value={handovers.filter((h) => h.qr_verified).length} color="bg-cyan-500" />
        <StatCard icon={ShieldCheck} label="Quality Approved" value={handovers.filter((h) => h.handover_status === 'quality_approved' || h.handover_status === 'picked_up' || h.handover_status === 'delivered').length} color="bg-green-500" />
        <StatCard icon={Package} label="Picked Up" value={handovers.filter((h) => h.pickup_confirmed).length} color="bg-primary-500" />
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div> : handovers.length === 0 ? <div className="glass-card p-10 text-center"><QrCode className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No donation handovers yet.</p></div> : (
        <div className="space-y-3">
          {handovers.map((h, i) => {
            const donation = (h as unknown as { donation?: FoodDonation }).donation;
            const volunteer = (h as unknown as { volunteer?: Profile }).volunteer;
            const donor = (h as unknown as { donor?: Profile }).donor;
            const badgeClass = statusColors[h.handover_status] || statusColors.cancelled;
            return (
              <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 flex items-center justify-center shrink-0"><QrCode className="h-5 w-5" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{donation?.food_name ?? 'Donation'}</p>
                    <p className="text-xs text-gray-500 truncate font-mono">{h.qr_code.slice(0, 40)}...</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0 ${badgeClass}`}>{h.handover_status.replace(/_/g, ' ')}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div><span className="text-gray-400">Donor</span><p className="font-medium truncate">{donor?.full_name ?? h.donor_id?.slice(0, 8) ?? 'N/A'}</p></div>
                  <div><span className="text-gray-400">Volunteer</span><p className="font-medium truncate">{volunteer?.full_name ?? 'Unassigned'}</p></div>
                  <div><span className="text-gray-400">QR Verified</span><p className="font-medium">{h.qr_verified_at ? new Date(h.qr_verified_at).toLocaleString() : 'Not verified'}</p></div>
                  <div><span className="text-gray-400">Pickup Time</span><p className="font-medium">{h.pickup_confirmed_at ? new Date(h.pickup_confirmed_at).toLocaleString() : 'Pending'}</p></div>
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-linen dark:border-secondary-800">
                  {h.pickup_photo_url ? (
                    <img src={h.pickup_photo_url} alt="Pickup" className="h-12 w-12 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0"><Camera className="h-5 w-5 text-gray-400" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    {h.inspection_rating != null && (
                      <div className="flex items-center gap-1 mb-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`h-3.5 w-3.5 ${n <= h.inspection_rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                        ))}
                        <span className="ml-1 text-xs text-gray-500">{h.inspection_rating}/5</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 truncate">
                      {h.quality_report ? `Quality: ${(h.quality_report as { approval?: string }).approval ?? 'N/A'}` : 'No quality report'}
                    </p>
                  </div>
                  {h.qr_verified ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> : <Clock className="h-5 w-5 text-amber-500 shrink-0" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Certificate Management ---------- */
export function AdminCertificateManagementSection() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('certificates').select('*').order('created_at', { ascending: false }).limit(30);
      setCerts((data as Certificate[]) ?? []);
      setLoading(false);
    };
    load();
    const ch = supabase.channel('admin-certs').on('postgres_changes', { event: '*', schema: 'public', table: 'certificates' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div>
      <DashboardSectionHeader title="Certificate Management" description="Manage all volunteer appreciation certificates." />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Award} label="Total" value={certs.length} color="bg-indigo-500" />
        <StatCard icon={CheckCircle2} label="Valid" value={certs.filter((c) => c.is_valid).length} color="bg-green-500" />
        <StatCard icon={Package} label="Total Deliveries" value={certs.reduce((s, c) => s + c.deliveries_count, 0)} color="bg-primary-500" />
        <StatCard icon={Clock} label="Total Hours" value={Math.round(certs.reduce((s, c) => s + c.hours_served, 0))} color="bg-blue-500" />
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div> : certs.length === 0 ? <div className="glass-card p-10 text-center"><Award className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No certificates issued yet.</p></div> : (
        <div className="space-y-2">
          {certs.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center shrink-0"><Award className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{c.volunteer_name ?? 'Volunteer'}</p>
                <p className="text-xs text-gray-400 font-mono truncate">{c.certificate_number}</p>
              </div>
              <div className="hidden sm:flex gap-3 text-xs text-gray-500">
                <span>{c.deliveries_count} deliveries</span>
                <span>{Math.round(c.hours_served)} hrs</span>
              </div>
              {c.is_valid ? <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">Valid</span> : <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs">Revoked</span>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Analytics ---------- */
export function AdminAnalyticsSection() {
  const [chartData, setChartData] = useState<{ label: string; users: number; deliveries: number; waste: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TimeFilter>('month');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchLiveAnalytics(filter);
      setChartData(data);
      setLoading(false);
    };
    load();
  }, [filter]);

  const filters: { key: TimeFilter; label: string }[] = [{ key: 'today', label: 'Today' }, { key: 'week', label: 'Week' }, { key: 'month', label: 'Month' }];

  return (
    <div>
      <DashboardSectionHeader title="Analytics" description="Deep-dive analytics across the platform." action={
        <div className="flex gap-1.5">
          {filters.map((f) => <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.key ? 'bg-primary-600 text-white' : 'glass'}`}>{f.label}</button>)}
        </div>
      } />
      <div className="glass-card p-5 mb-4">
        <h3 className="font-display font-bold mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary-500" /> User Growth & Deliveries</h3>
        <div className="h-[300px] relative">
          {loading ? <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div> : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="users" name="New Users" fill="#3B82F6" stroke="#3B82F6" fillOpacity={0.2} />
                <Bar type="monotone" dataKey="deliveries" name="Deliveries" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="waste" name="Waste (kg)" stroke="#4F8060" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Reports ---------- */
export function AdminReportsSection() {
  const [stats, setStats] = useState({ users: 0, donations: 0, deliveries: 0, meals: 0, certs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [u, d, p, c] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('food_donations').select('estimated_meals', { count: 'exact' }),
        supabase.from('pickups').select('id', { count: 'exact', head: true }).eq('status', 'delivered'),
        supabase.from('certificates').select('id', { count: 'exact', head: true }),
      ]);
      setStats({ users: u.count ?? 0, donations: d.count ?? 0, deliveries: p.count ?? 0, meals: (d.data ?? []).reduce((s, x) => s + (x.estimated_meals ?? 0), 0), certs: c.count ?? 0 });
      setLoading(false);
    };
    load();
  }, []);

  const reports = [
    { title: 'User Registration Report', desc: 'All registered users by role', icon: Users, color: 'bg-blue-500', count: stats.users },
    { title: 'Donation Summary Report', desc: 'All food donations with status', icon: Package, color: 'bg-primary-500', count: stats.donations },
    { title: 'Delivery Performance Report', desc: 'Completed deliveries and metrics', icon: Truck, color: 'bg-green-500', count: stats.deliveries },
    { title: 'Impact Report', desc: 'Meals served and waste prevented', icon: TrendingUp, color: 'bg-amber-500', count: stats.meals },
    { title: 'Certificate Report', desc: 'All issued certificates', icon: Award, color: 'bg-indigo-500', count: stats.certs },
  ];

  const handleExport = (title: string) => {
    const csv = `Report,${title}\nGenerated,${new Date().toISOString()}\n\nThis is a summary report from FoodBridge Admin Dashboard.`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <DashboardSectionHeader title="Reports" description="Generate and download platform reports." />
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reports.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div key={r.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl ${r.color} text-white flex items-center justify-center shadow-lg shrink-0`}><Icon className="h-6 w-6" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-gray-500">{r.desc}</p>
                  <p className="text-xs text-gray-400 mt-1">{r.count} records</p>
                </div>
                <RippleButton onClick={() => handleExport(r.title)} variant="secondary" className="text-xs px-3 py-2 shrink-0"><Download className="h-3.5 w-3.5" /> Export</RippleButton>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Notifications ---------- */
export function AdminNotificationsSection() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  return (
    <div>
      <DashboardSectionHeader title="Notifications" description={`${unreadCount} unread of ${notifications.length} total`} action={unreadCount > 0 ? <RippleButton onClick={markAllAsRead} variant="secondary">Mark all read</RippleButton> : undefined} />
      {notifications.length === 0 ? <div className="glass-card p-10 text-center"><Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No notifications.</p></div> : (
        <div className="space-y-2">
          {notifications.slice(0, 20).map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className={`glass-card p-4 flex items-start gap-3 ${!n.is_read ? 'border-l-4 border-primary-500' : ''}`}>
              <div className="h-9 w-9 rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center shrink-0"><Bell className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.description}</p>
                <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Settings ---------- */
export function AdminSettingsSection() {
  const { profile, refreshProfile } = useAuth();
  const { pushToast } = useNotifications();
  const [settings, setSettings] = useState({
    emailNotifications: profile?.notification_settings?.email ?? true,
    pushNotifications: profile?.notification_settings?.push ?? true,
    donationAlerts: profile?.notification_settings?.donations ?? true,
    certificateAlerts: profile?.notification_settings?.certificates ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('profiles').update({
      notification_settings: {
        email: settings.emailNotifications,
        push: settings.pushNotifications,
        donations: settings.donationAlerts,
        certificates: settings.certificateAlerts,
        volunteer: true,
        quality: true,
      },
    }).eq('id', profile?.id);
    await refreshProfile();
    setSaving(false);
    pushToast('Settings saved successfully', 'success');
  };

  const toggles = [
    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive browser push notifications' },
    { key: 'donationAlerts', label: 'Donation Alerts', desc: 'Get notified about new donations' },
    { key: 'certificateAlerts', label: 'Certificate Alerts', desc: 'Get notified about new certificates' },
  ];

  return (
    <div>
      <DashboardSectionHeader title="Settings" description="Manage your admin account preferences." action={<RippleButton onClick={handleSave} variant="primary" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes</RippleButton>} />
      <div className="glass-card p-6 mb-4">
        <h3 className="font-display font-bold mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-primary-500" /> Notification Preferences</h3>
        <div className="space-y-3">
          {toggles.map((t) => (
            <div key={t.key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-gray-500">{t.desc}</p>
              </div>
              <button
                onClick={() => setSettings((s) => ({ ...s, [t.key]: !s[t.key as keyof typeof s] }))}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings[t.key as keyof typeof settings] ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings[t.key as keyof typeof settings] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card p-6">
        <h3 className="font-display font-bold mb-4 flex items-center gap-2"><Settings className="h-5 w-5 text-primary-500" /> System Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-gray-400">Platform</p><p className="font-medium">FoodBridge</p></div>
          <div><p className="text-xs text-gray-400">Admin Account</p><p className="font-medium">{profile?.email}</p></div>
          <div><p className="text-xs text-gray-400">Last Login</p><p className="font-medium">{profile?.last_login ? new Date(profile.last_login).toLocaleString() : 'Never'}</p></div>
          <div><p className="text-xs text-gray-400">Member Since</p><p className="font-medium">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}</p></div>
        </div>
      </div>
    </div>
  );
}
