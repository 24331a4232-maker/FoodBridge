import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Package, Search, Bell, TrendingUp, TrendingDown, Activity, CheckCircle2, Clock, FileText, X, Mail,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import type { Profile, FoodDonation, Pickup, ContactMessage } from '@/types';
import { fadeInUp, staggerContainer, AnimatedCounter } from '@/lib/animations';
import { FoodQualityBadge } from '@/components/FoodQualityBadge';
import { DonationImage } from '@/components/Illustration';
import { DonationStatusTracker } from '@/components/DonationStatusTracker';

type Tab = 'overview' | 'users' | 'donations' | 'reports' | 'messages';

import { PageNav } from '@/components/PageNav';
export function AdminDashboardPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState({ users: 0, donors: 0, volunteers: 0, donations: 0, available: 0, delivered: 0, messages: 0 });
  const [users, setUsers] = useState<Profile[]>([]);
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [search, setSearch] = useState('');
  const [detailDonation, setDetailDonation] = useState<FoodDonation | null>(null);
  const [detailPickup, setDetailPickup] = useState<Pickup | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: profiles }, { data: food }, { data: msgs }] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('food_donations').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      ]);
      const p = (profiles as Profile[]) ?? [];
      const f = (food as FoodDonation[]) ?? [];
      const m = (msgs as ContactMessage[]) ?? [];
      setUsers(p);
      setDonations(f);
      setMessages(m);
      setStats({
        users: p.length,
        donors: p.filter((x) => x.role === 'donor').length,
        volunteers: p.filter((x) => x.role === 'volunteer').length,
        donations: f.length,
        available: f.filter((x) => x.status === 'available').length,
        delivered: f.filter((x) => x.status === 'delivered').length,
        messages: m.filter((x) => x.status === 'unread').length,
      });
    };
    load();
  }, [toast]);

  const filteredUsers = useMemo(() => users.filter((u) => !search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())), [users, search]);
  const filteredDonations = useMemo(() => donations.filter((d) => !search || d.food_name.toLowerCase().includes(search.toLowerCase()) || d.organization.toLowerCase().includes(search.toLowerCase())), [donations, search]);

  const openDonationDetail = async (d: FoodDonation) => {
    setDetailDonation(d);
    setDetailPickup(null);
    const { data } = await supabase.from('pickups').select('*, donation:food_donations(*)').eq('donation_id', d.id).maybeSingle();
    setDetailPickup((data as Pickup) ?? null);
  };

  const markMessageRead = async (id: string) => {
    await supabase.from('contact_messages').update({ status: 'read' }).eq('id', id);
    setMessages((m) => m.map((x) => x.id === id ? { ...x, status: 'read' } : x));
    setStats((s) => ({ ...s, messages: Math.max(0, s.messages - 1) }));
    toast('Message marked as read', 'success');
  };

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'donations', label: 'Donations', icon: Package },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'messages', label: 'Messages', icon: Bell },
  ];

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <PageNav crumbs={[{ label: 'Dashboards' }, { label: 'Admin Dashboard', icon: Users }]} />

      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitor and manage the FoodBridge platform</p>
          </div>
          <AdminNotifications messages={messages} onMarkRead={markMessageRead} unreadCount={stats.messages} />
        </motion.div>

        {/* Stats */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.users, icon: Users, color: 'from-secondary-500 to-primary-500', trend: '+12%' },
            { label: 'Active Donations', value: stats.available, icon: Package, color: 'from-primary-500 to-primary-600', trend: '+8%' },
            { label: 'Delivered', value: stats.delivered, icon: CheckCircle2, color: 'from-primary-600 to-primary-500', trend: '+24%' },
            { label: 'Unread Messages', value: stats.messages, icon: Bell, color: 'from-accent-500 to-red-500', trend: '-3%' },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeInUp} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-lg`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${s.trend.startsWith('+') ? 'text-primary-600' : 'text-red-500'}`}>
                  {s.trend.startsWith('+') ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {s.trend}
                </span>
              </div>
              <p className="font-display text-2xl font-bold"><AnimatedCounter value={s.value} /></p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'glass hover:bg-primary-50 dark:hover:bg-primary-900/30'
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
              {t.id === 'messages' && stats.messages > 0 && (
                <span className="ml-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">{stats.messages}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        {(tab === 'users' || tab === 'donations') && (
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="input-field pl-12" />
          </div>
        )}

        {/* Content */}
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          {tab === 'overview' && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-bold">Platform Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bar chart */}
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="text-sm font-semibold mb-4">Donations by Status</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Available', value: stats.available, color: 'bg-primary-500' },
                      { label: 'Delivered', value: stats.delivered, color: 'bg-primary-500' },
                      { label: 'Claimed', value: donations.filter((d) => d.status === 'claimed').length, color: 'bg-secondary-500' },
                      { label: 'Expired', value: donations.filter((d) => d.status === 'expired').length, color: 'bg-red-500' },
                    ].map((b) => (
                      <div key={b.label}>
                        <div className="flex justify-between text-xs mb-1"><span>{b.label}</span><span className="font-semibold">{b.value}</span></div>
                        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (b.value / Math.max(1, stats.donations)) * 100)}%` }} transition={{ duration: 1 }} className={`h-full ${b.color} rounded-full`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Pie / role breakdown */}
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="text-sm font-semibold mb-4">Users by Role</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Donors', value: stats.donors, color: 'bg-secondary-500' },
                      { label: 'Volunteers', value: stats.volunteers, color: 'bg-primary-500' },
                      { label: 'Admins', value: users.filter((u) => u.role === 'admin').length, color: 'bg-accent-500' },
                      { label: 'NGOs', value: users.filter((u) => u.role === 'ngo').length, color: 'bg-purple-500' },
                    ].map((b) => (
                      <div key={b.label}>
                        <div className="flex justify-between text-xs mb-1"><span>{b.label}</span><span className="font-semibold">{b.value}</span></div>
                        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (b.value / Math.max(1, stats.users)) * 100)}%` }} transition={{ duration: 1 }} className={`h-full ${b.color} rounded-full`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Recent activity */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Recent Donations</h3>
                <div className="space-y-2">
                  {donations.slice(0, 5).map((d) => (
                    <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <DonationImage src={d.image_url} alt="" variant="donation" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{d.food_name}</p>
                        <p className="text-xs text-gray-400">{d.organization}</p>
                      </div>
                      {d.freshness_status && <FoodQualityBadge freshness={d.freshness_status} score={d.quality_score} size="sm" showScore />}
                      <span className={`badge text-[10px] ${d.status === 'available' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : d.status === 'delivered' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{d.status}</span>
                    </div>
                  ))}
                  {donations.length === 0 && <p className="text-center text-gray-400 py-4">No donations yet</p>}
                </div>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div>
              <h2 className="font-display text-xl font-bold mb-4">All Users ({filteredUsers.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Organization</th>
                      <th className="pb-3 font-medium">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 font-medium">{u.full_name}</td>
                        <td className="py-3 text-gray-500">{u.email}</td>
                        <td className="py-3"><span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 capitalize">{u.role}</span></td>
                        <td className="py-3 text-gray-500">{u.organization ?? '-'}</td>
                        <td className="py-3 font-semibold text-primary-600">{u.reward_points}</td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No users found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'donations' && (
            <div>
              <h2 className="font-display text-xl font-bold mb-4">All Donations ({filteredDonations.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-3 font-medium">Food</th>
                      <th className="pb-3 font-medium">Organization</th>
                      <th className="pb-3 font-medium">Qty</th>
                      <th className="pb-3 font-medium">Quality</th>
                      <th className="pb-3 font-medium">City</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.map((d) => (
                      <tr key={d.id} onClick={() => openDonationDetail(d)} className="border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-primary-50/40 dark:hover:bg-primary-900/20 transition-colors">
                        <td className="py-3 font-medium">{d.food_name}</td>
                        <td className="py-3 text-gray-500">{d.organization}</td>
                        <td className="py-3">{d.quantity} {d.quantity_unit}</td>
                        <td className="py-3">{d.freshness_status ? <FoodQualityBadge freshness={d.freshness_status} score={d.quality_score} size="sm" showScore /> : <span className="text-xs text-gray-400">-</span>}</td>
                        <td className="py-3 text-gray-500">{d.city || '-'}</td>
                        <td className="py-3"><span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 capitalize">{d.status}</span></td>
                      </tr>
                    ))}
                    {filteredDonations.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">No donations found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'reports' && (
            <div>
              <h2 className="font-display text-xl font-bold mb-4">Reports & Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Meals Saved', value: stats.delivered * 10, icon: Package },
                  { label: 'CO2 Reduced (kg)', value: stats.delivered * 2.5, icon: Activity },
                  { label: 'Avg Delivery Time', value: '42 min', icon: Clock },
                ].map((r) => (
                  <div key={r.label} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <r.icon className="h-8 w-8 text-primary-500 mb-3" />
                    <p className="font-display text-2xl font-bold">{typeof r.value === 'number' ? <AnimatedCounter value={r.value} /> : r.value}</p>
                    <p className="text-xs text-gray-500">{r.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-sm font-semibold mb-3">Monthly Growth</h3>
                <div className="flex items-end gap-2 h-32">
                  {[40, 55, 35, 70, 60, 85, 75, 95, 80, 100, 90, 110].map((h, i) => (
                    <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.05, duration: 0.5 }} className="flex-1 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'messages' && (
            <div>
              <h2 className="font-display text-xl font-bold mb-4">Contact Messages ({messages.length})</h2>
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`p-4 rounded-2xl ${m.status === 'unread' ? 'bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{m.name} <span className="text-xs text-gray-400 font-normal">&lt;{m.email}&gt;</span></p>
                        <p className="text-xs text-gray-500">{m.subject}</p>
                      </div>
                      {m.status === 'unread' && (
                        <button onClick={() => markMessageRead(m.id)} className="text-xs text-primary-600 hover:underline">Mark read</button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{m.message}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                ))}
                {messages.length === 0 && <p className="text-center text-gray-400 py-8">No messages yet</p>}
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* Donation detail modal with timeline */}
      <AnimatePresence>
        {detailDonation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailDonation(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 24, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-display text-xl font-bold">{detailDonation.food_name}</h3>
                  <p className="text-sm text-ink-soft dark:text-cream/50">{detailDonation.organization} - {detailDonation.quantity} {detailDonation.quantity_unit}</p>
                </div>
                <button onClick={() => setDetailDonation(null)} className="p-2 rounded-full hover:bg-oat dark:hover:bg-secondary-800 transition-colors" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="pt-4 border-t border-linen dark:border-secondary-800">
                <DonationStatusTracker donation={detailDonation} pickup={detailPickup} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminNotifications({ messages, onMarkRead, unreadCount }: { messages: ContactMessage[]; onMarkRead: (id: string) => void; unreadCount: number }) {
  const [open, setOpen] = useState(false);
  const recent = messages.slice(0, 5);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative h-11 w-11 rounded-full glass flex items-center justify-center hover:shadow-md transition-all"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 glass-card p-3 z-20"
            >
              <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-gray-100 dark:border-gray-800">
                <p className="font-semibold text-sm">Notifications</p>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
              </div>
              {recent.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">No notifications</p>
              ) : (
                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {recent.map((m) => (
                    <div key={m.id} className={`p-3 rounded-xl ${m.status === 'unread' ? 'bg-accent-50 dark:bg-accent-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'} transition-colors`}>
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{m.name}: {m.subject}</p>
                          <p className="text-[11px] text-gray-400 truncate">{m.message}</p>
                          {m.status === 'unread' && (
                            <button onClick={() => onMarkRead(m.id)} className="text-[10px] text-primary-600 hover:underline mt-1">Mark read</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
