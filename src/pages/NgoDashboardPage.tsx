import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Building2, Package, Clock, CheckCircle2, TrendingUp, MapPin, Award, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { PageNav } from '@/components/PageNav';
import { AnimatedCounter } from '@/lib/animations';
import type { FoodDonation } from '@/types';

interface DashboardStats {
  totalReceived: number;
  pendingDeliveries: number;
  familiesServed: number;
  mealsDistributed: number;
}

interface IncomingDelivery {
  id: string;
  food_name: string;
  status: string;
}

export function NgoDashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ totalReceived: 0, pendingDeliveries: 0, familiesServed: 0, mealsDistributed: 0 });
  const [incoming, setIncoming] = useState<IncomingDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    // NGOs receive deliveries — query pickups where recipient_org matches the NGO's organization or name
    const orgName = profile?.organization || profile?.full_name || '';
    if (!orgName) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('pickups')
      .select('id, status, recipient_org, donation:food_donations(food_name, estimated_meals)')
      .or(`recipient_org.eq.${orgName},recipient_org.eq.${profile?.full_name}`)
      .order('created_at', { ascending: false });

    if (error || !data) { setLoading(false); return; }

    const pickups = data as Array<{ id: string; status: string; recipient_org: string; donation: { food_name: string; estimated_meals: number } | null }>;
    const pending = pickups.filter((p) => p.status === 'accepted' || p.status === 'in_progress').length;
    const completed = pickups.filter((p) => p.status === 'delivered').length;
    const meals = pickups.reduce((s, p) => s + (p.donation?.estimated_meals ?? 0), 0);

    setStats({
      totalReceived: completed,
      pendingDeliveries: pending,
      familiesServed: Math.round(meals / 4),
      mealsDistributed: meals,
    });
    setIncoming(pickups.slice(0, 5).map((p) => ({ id: p.id, food_name: p.donation?.food_name ?? 'Unknown', status: p.status })));
    setLoading(false);
  }, [profile?.organization, profile?.full_name]);

  useEffect(() => {
    load();
    const ch = supabase.channel('ngo-dash').on('postgres_changes', { event: '*', schema: 'public', table: 'pickups' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const statsArr = [
    { label: 'Total Received', value: stats.totalReceived, icon: Package, color: 'from-teal-500 to-green-500' },
    { label: 'Pending Deliveries', value: stats.pendingDeliveries, icon: Clock, color: 'from-amber-500 to-orange-500' },
    { label: 'Families Served', value: stats.familiesServed, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
    { label: 'Meals Distributed', value: stats.mealsDistributed, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      accepted: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-amber-100 text-amber-700',
      delivered: 'bg-green-100 text-green-700',
    };
    const label: Record<string, string> = { accepted: 'In Transit', in_progress: 'On the Way', delivered: 'Received' };
    return { cls: map[status] ?? 'bg-gray-100 text-gray-700', text: label[status] ?? status };
  };

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <PageNav crumbs={[{ label: 'Dashboards' }, { label: 'NGO', icon: Building2 }]} />
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Welcome, {profile?.organization || profile?.full_name?.split(' ')[0] || 'NGO'}!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage incoming food deliveries and distribution</p>
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
              <Link to="/services/available-food" className="flex items-center gap-3 p-4 rounded-xl glass hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center"><Package className="h-5 w-5" /></div>
                <div><p className="font-medium text-sm">Available Food</p><p className="text-xs text-gray-500">Browse donations near you</p></div>
              </Link>
              <Link to="/services/tracking" className="flex items-center gap-3 p-4 rounded-xl glass hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><MapPin className="h-5 w-5" /></div>
                <div><p className="font-medium text-sm">Track Deliveries</p><p className="text-xs text-gray-500">Monitor incoming food</p></div>
              </Link>
              <Link to="/services/certificate-history" className="flex items-center gap-3 p-4 rounded-xl glass hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><Award className="h-5 w-5" /></div>
                <div><p className="font-medium text-sm">Receipts</p><p className="text-xs text-gray-500">View received donation records</p></div>
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
            <h2 className="font-display text-lg font-bold mb-4">Incoming Deliveries</h2>
            <div className="space-y-2">
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
              ) : incoming.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">No incoming deliveries yet. Browse available food to get started!</p>
              ) : (
                incoming.map((item) => {
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
