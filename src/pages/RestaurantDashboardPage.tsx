import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Store, Clock, CheckCircle2, TrendingUp, Plus, MapPin, Award, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { PageNav } from '@/components/PageNav';
import { AnimatedCounter } from '@/lib/animations';
import type { FoodDonation } from '@/types';

interface DashboardStats {
  totalDonations: number;
  pendingPickups: number;
  completed: number;
  mealsDonated: number;
}

interface RecentDonation {
  id: string;
  food_name: string;
  status: string;
}

export function RestaurantDashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ totalDonations: 0, pendingPickups: 0, completed: 0, mealsDonated: 0 });
  const [recent, setRecent] = useState<RecentDonation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    const { data, error } = await supabase
      .from('food_donations')
      .select('id, food_name, status, estimated_meals')
      .eq('donor_id', profile.id)
      .order('created_at', { ascending: false });
    if (error || !data) { setLoading(false); return; }
    const donations = data as Pick<FoodDonation, 'id' | 'food_name' | 'status' | 'estimated_meals'>[];
    const pending = donations.filter((d) => d.status === 'available' || d.status === 'claimed').length;
    const completed = donations.filter((d) => d.status === 'delivered').length;
    const meals = donations.reduce((s, d) => s + (d.estimated_meals ?? 0), 0);
    setStats({ totalDonations: donations.length, pendingPickups: pending, completed, mealsDonated: meals });
    setRecent(donations.slice(0, 5).map((d) => ({ id: d.id, food_name: d.food_name, status: d.status })));
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    load();
    const ch = supabase.channel('restaurant-dash').on('postgres_changes', { event: '*', schema: 'public', table: 'food_donations' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const statsArr = [
    { label: 'Total Donations', value: stats.totalDonations, icon: Store, color: 'from-rose-500 to-pink-500' },
    { label: 'Pending Pickups', value: stats.pendingPickups, icon: Clock, color: 'from-amber-500 to-orange-500' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
    { label: 'Meals Donated', value: stats.mealsDonated, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      available: 'bg-amber-100 text-amber-700',
      claimed: 'bg-blue-100 text-blue-700',
      delivered: 'bg-green-100 text-green-700',
    };
    const label: Record<string, string> = { available: 'Awaiting Volunteer', claimed: 'Assigned', delivered: 'Delivered' };
    return { cls: map[status] ?? 'bg-gray-100 text-gray-700', text: label[status] ?? status };
  };

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <PageNav crumbs={[{ label: 'Dashboards' }, { label: 'Restaurant', icon: Store }]} />
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Welcome, {profile?.organization || profile?.full_name?.split(' ')[0] || 'Restaurant'}!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your surplus food donations and pickups</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsArr.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-lg mb-3`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="font-display text-2xl font-bold">{loading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : <AnimatedCounter value={s.value} />}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <h2 className="font-display text-lg font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/services/donate-food" className="flex items-center gap-3 p-4 rounded-xl glass hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center"><Plus className="h-5 w-5" /></div>
                <div><p className="font-medium text-sm">Donate Surplus Food</p><p className="text-xs text-gray-500">List food available for pickup</p></div>
              </Link>
              <Link to="/services/tracking" className="flex items-center gap-3 p-4 rounded-xl glass hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><MapPin className="h-5 w-5" /></div>
                <div><p className="font-medium text-sm">Track Pickups</p><p className="text-xs text-gray-500">Monitor volunteer pickups</p></div>
              </Link>
              <Link to="/services/certificate-history" className="flex items-center gap-3 p-4 rounded-xl glass hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><Award className="h-5 w-5" /></div>
                <div><p className="font-medium text-sm">My Certificates</p><p className="text-xs text-gray-500">View your impact certificates</p></div>
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
            <h2 className="font-display text-lg font-bold mb-4">Pending Pickups</h2>
            <div className="space-y-2">
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
              ) : recent.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">No donations yet. Start by donating surplus food!</p>
              ) : (
                recent.map((item) => {
                  const badge = statusBadge(item.status);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl glass">
                      <span className="text-sm font-medium truncate">{item.food_name}</span>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium shrink-0 ml-2 ${badge.cls}`}>{badge.text}</span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
