import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Store, Clock, CheckCircle2, TrendingUp, Plus, MapPin, Award } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PageNav } from '@/components/PageNav';
import { AnimatedCounter } from '@/lib/animations';

export function RestaurantDashboardPage() {
  const { profile } = useAuth();

  const stats = [
    { label: 'Total Donations', value: 89, icon: Store, color: 'from-rose-500 to-pink-500' },
    { label: 'Pending Pickups', value: 5, icon: Clock, color: 'from-amber-500 to-orange-500' },
    { label: 'Completed', value: 84, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
    { label: 'Meals Donated', value: 2380, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
  ];

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <PageNav crumbs={[{ label: 'Dashboards' }, { label: 'Restaurant', icon: Store }]} />
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Welcome, {profile?.organization || profile?.full_name?.split(' ')[0] || 'Restaurant'}!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your surplus food donations and pickups</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-lg mb-3`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="font-display text-2xl font-bold"><AnimatedCounter value={s.value} /></p>
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
              {['Cooked Rice (20 kg)', 'Veg Biryani (50 portions)', 'Sandwiches (60 pcs)'].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl glass">
                  <span className="text-sm font-medium">{item}</span>
                  <span className="text-[10px] px-2 py-1 rounded-full font-medium bg-amber-100 text-amber-700">Awaiting Volunteer</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
