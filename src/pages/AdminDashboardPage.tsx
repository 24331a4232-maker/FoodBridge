import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Activity, Truck, CheckCircle2, Clock, Recycle, Heart, Award,
  QrCode, UserPlus, Package2, Play, ShieldCheck, BarChart3, TrendingUp,
  TrendingDown, Minus, Radio,
} from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { PageNav } from '@/components/PageNav';
import { Sparkline } from '@/components/admin/Sparkline';
import { AnimatedCounter } from '@/lib/animations';
import {
  type OpsStat, type OpsActivity, type ActivityKind, type TimeFilter,
  sampleStats, sampleActivities, sampleAnalytics,
  fetchLiveStats, fetchLiveActivities,
} from '@/lib/opsData';

const statIcons: Record<string, { icon: typeof Users; bg: string; spark: string }> = {
  total_users: { icon: Users, bg: 'from-secondary-500 to-primary-500', spark: '#4F8060' },
  active_users: { icon: Activity, bg: 'from-blue-500 to-cyan-500', spark: '#3B82F6' },
  active_volunteers: { icon: Truck, bg: 'from-amber-500 to-orange-500', spark: '#F59E0B' },
  completed_deliveries: { icon: CheckCircle2, bg: 'from-green-500 to-emerald-500', spark: '#10B981' },
  pending_requests: { icon: Clock, bg: 'from-rose-500 to-pink-500', spark: '#F43F5E' },
  food_waste_prevented: { icon: Recycle, bg: 'from-lime-500 to-green-500', spark: '#84CC16' },
  families_supported: { icon: Heart, bg: 'from-red-500 to-rose-500', spark: '#EF4444' },
  certificates_generated: { icon: Award, bg: 'from-indigo-500 to-blue-500', spark: '#6366F1' },
  qr_verifications: { icon: QrCode, bg: 'from-purple-500 to-violet-500', spark: '#8B5CF6' },
};

const activityMeta: Record<ActivityKind, { icon: typeof Users; color: string }> = {
  user_registered: { icon: UserPlus, color: 'bg-blue-500' },
  volunteer_assigned: { icon: Users, color: 'bg-accent-500' },
  food_quality_approved: { icon: ShieldCheck, color: 'bg-green-500' },
  pickup_started: { icon: Play, color: 'bg-amber-500' },
  delivery_completed: { icon: CheckCircle2, color: 'bg-emerald-500' },
  certificate_generated: { icon: Award, color: 'bg-purple-500' },
  qr_verified: { icon: QrCode, color: 'bg-indigo-500' },
};

const timeFilters: { key: TimeFilter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

export function AdminDashboardPage() {
  const [stats, setStats] = useState<OpsStat[]>(sampleStats);
  const [activities, setActivities] = useState<OpsActivity[]>(sampleActivities);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch live data on mount; fall back to sample data gracefully
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [liveStats, liveActs] = await Promise.all([fetchLiveStats(), fetchLiveActivities()]);
      if (cancelled) return;
      if (liveStats && liveStats.some((s) => s.value > 0)) {
        setStats(liveStats);
        setIsLive(true);
      }
      if (liveActs && liveActs.length > 0) {
        setActivities(liveActs);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const chartData = useMemo(() => sampleAnalytics[timeFilter], [timeFilter]);

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <PageNav crumbs={[{ label: 'Dashboards' }, { label: 'Operations', icon: Radio }]} />

      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl lg:max-w-[88rem] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Operations Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Real-time overview of FoodBridge platform activity</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass">
              <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-amber-500'} ${loading ? 'animate-ping' : ''}`} />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {loading ? 'Connecting...' : isLive ? 'Live Data' : 'Sample Data'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          {stats.map((stat, i) => {
            const meta = statIcons[stat.key] ?? statIcons.total_users;
            const Icon = meta.icon;
            const TrendIcon = stat.delta > 0 ? TrendingUp : stat.delta < 0 ? TrendingDown : Minus;
            const trendColor = stat.delta > 0 ? 'text-green-600' : stat.delta < 0 ? 'text-red-500' : 'text-gray-400';
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="glass-card p-4 sm:p-5 group hover:shadow-premium-lg transition-shadow duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br ${meta.bg} text-white flex items-center justify-center shadow-lg shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Sparkline data={stat.trend} color={meta.spark} width={56} height={24} className="hidden sm:block" />
                </div>
                <p className="font-display text-xl sm:text-2xl font-bold tabular-nums">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix ?? ''} />
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{stat.label}</p>
                <div className="flex items-center gap-1 mt-2 text-[10px]">
                  <span className={`flex items-center gap-0.5 font-semibold ${trendColor}`}>
                    <TrendIcon className="h-3 w-3" />
                    {stat.delta > 0 ? `+${stat.delta}` : stat.delta < 0 ? `${stat.delta}` : '0'}
                  </span>
                  <span className="text-gray-400">since last period</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Analytics + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Unified Analytics Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass-card p-5 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary-600" />
                <h2 className="font-display text-lg font-bold">Platform Analytics</h2>
              </div>
              <div className="flex gap-1.5">
                {timeFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setTimeFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      timeFilter === f.key ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'glass hover:bg-primary-50 dark:hover:bg-primary-900/30'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[280px] sm:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="users" name="Users" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="volunteers" name="Volunteers" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="deliveries" name="Deliveries" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="waste" name="Food Waste Prevented (kg)" stroke="#4F8060" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Live Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <h2 className="font-display text-lg font-bold">Live Activity</h2>
            </div>
            <div className="space-y-2.5 flex-1 overflow-y-auto no-scrollbar max-h-[420px] lg:max-h-[400px]">
              <AnimatePresence>
                {activities.map((act, i) => {
                  const { icon: Icon, color } = activityMeta[act.type];
                  return (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl glass hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors"
                    >
                      <div className={`h-9 w-9 rounded-lg ${color} text-white flex items-center justify-center shrink-0 shadow`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{act.message}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{act.timestamp}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
