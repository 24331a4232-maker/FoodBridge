import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Package, Activity, ClipboardCheck, Truck, FileText, BarChart3,
  Search, Download, FileDown, ChevronLeft, ChevronRight, Star, ShieldCheck,
  UserPlus, Package2, Play, CheckCircle2, Award, QrCode, Clock, MapPin,
  TrendingUp, Filter,
} from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { PageNav } from '@/components/PageNav';
import { StatCard } from '@/components/admin/StatCard';
import { RippleButton } from '@/components/ui/RippleButton';
import { AnimatedCounter } from '@/lib/animations';
import {
  overviewStats, adminDonations, adminUsers, adminVolunteers,
  foodQualityReports, liveActivities, monthlyAnalytics, recentDonations,
  type AdminDonationStatus, type AdminUserRole, type ActivityType,
} from '@/lib/adminData';
import { donationsToCSV, usersToCSV, exportToPDF } from '@/lib/adminExport';

type Tab = 'overview' | 'donations' | 'users' | 'volunteers' | 'quality' | 'activity' | 'analytics';

const PAGE_SIZE = 8;

const statusStyles: Record<AdminDonationStatus, string> = {
  'Pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'Quality Check': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Volunteer Assigned': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'Picked Up': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'In Transit': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'Delivered': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'Completed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const roleStyles: Record<AdminUserRole, string> = {
  'Donor': 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  'Volunteer': 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300',
  'NGO': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  'Restaurant': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  'Admin': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
};

const activityIcons: Record<ActivityType, { icon: typeof Users; color: string }> = {
  user_registered: { icon: UserPlus, color: 'bg-blue-500' },
  donation_submitted: { icon: Package2, color: 'bg-primary-500' },
  volunteer_assigned: { icon: Users, color: 'bg-accent-500' },
  pickup_started: { icon: Play, color: 'bg-amber-500' },
  food_delivered: { icon: CheckCircle2, color: 'bg-green-500' },
  certificate_generated: { icon: Award, color: 'bg-purple-500' },
  qr_verified: { icon: QrCode, color: 'bg-indigo-500' },
};

export function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AdminDonationStatus | 'All'>('All');
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | 'All'>('All');
  const [chartToggles, setChartToggles] = useState({ donations: true, deliveries: true, users: false, volunteers: false });

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'donations', label: 'Donations', icon: Package },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'volunteers', label: 'Volunteers', icon: Truck },
    { id: 'quality', label: 'Quality Reports', icon: ClipboardCheck },
    { id: 'activity', label: 'Live Activity', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  // ── Donations ───────────────────────────────────────────────────────────
  const filteredDonations = useMemo(() => {
    return adminDonations.filter((d) => {
      const matchesSearch = !search ||
        d.id.toLowerCase().includes(search.toLowerCase()) ||
        d.donorName.toLowerCase().includes(search.toLowerCase()) ||
        d.foodType.toLowerCase().includes(search.toLowerCase()) ||
        d.assignedVolunteer.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const paginatedDonations = filteredDonations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const donPages = Math.ceil(filteredDonations.length / PAGE_SIZE);

  // ── Users ────────────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    return adminUsers.filter((u) => {
      const matchesSearch = !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [search, roleFilter]);

  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const userPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setSearch('');
    setPage(1);
    setStatusFilter('All');
    setRoleFilter('All');
  };

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <PageNav crumbs={[{ label: 'Dashboards' }, { label: 'Admin Dashboard', icon: Users }]} />

      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl lg:max-w-[88rem] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Monitor and manage the FoodBridge platform</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">System Live</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'glass hover:bg-primary-50 dark:hover:bg-primary-900/30'
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                  {overviewStats.map((stat, i) => (
                    <StatCard key={stat.key} stat={stat} index={i} />
                  ))}
                </div>

                {/* Recent Donations + Live Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Recent Donations */}
                  <div className="lg:col-span-2 glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-display text-lg font-bold">Recent Donations</h2>
                      <button onClick={() => handleTabChange('donations')} className="text-xs text-primary-600 hover:underline">View all</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-gray-400 border-b border-gray-200 dark:border-gray-700">
                            <th className="pb-2 pr-3 font-medium">Donor</th>
                            <th className="pb-2 pr-3 font-medium hidden sm:table-cell">Food Type</th>
                            <th className="pb-2 pr-3 font-medium">Qty</th>
                            <th className="pb-2 pr-3 font-medium hidden md:table-cell">Volunteer</th>
                            <th className="pb-2 pr-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentDonations.map((d) => (
                            <tr key={d.id} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-2.5 pr-3 font-medium truncate max-w-[120px]">{d.donorName}</td>
                              <td className="py-2.5 pr-3 text-gray-500 hidden sm:table-cell truncate max-w-[140px]">{d.foodType}</td>
                              <td className="py-2.5 pr-3 text-gray-500">{d.quantity}</td>
                              <td className="py-2.5 pr-3 text-gray-500 hidden md:table-cell truncate max-w-[100px]">{d.assignedVolunteer}</td>
                              <td className="py-2.5"><span className={`text-[10px] px-2 py-1 rounded-full font-medium ${statusStyles[d.status]}`}>{d.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Live Activity */}
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <h2 className="font-display text-lg font-bold">Live Activity</h2>
                    </div>
                    <div className="space-y-3 max-h-[420px] overflow-y-auto no-scrollbar">
                      {liveActivities.map((act) => {
                        const { icon: Icon, color } = activityIcons[act.type];
                        return (
                          <div key={act.id} className="flex items-start gap-3">
                            <div className={`h-8 w-8 rounded-lg ${color} text-white flex items-center justify-center shrink-0 shadow`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium leading-tight">{act.message}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{act.timestamp}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── DONATIONS ─────────────────────────────────────────────────── */}
            {tab === 'donations' && (
              <div className="glass-card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <h2 className="font-display text-lg font-bold">Donation Management <span className="text-sm font-normal text-gray-400">({filteredDonations.length})</span></h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <RippleButton variant="ghost" onClick={() => donationsToCSV(filteredDonations)}><Download className="h-4 w-4" /> CSV</RippleButton>
                    <RippleButton variant="ghost" onClick={() => exportToPDF('Donation Report', ['ID', 'Donor', 'Food Type', 'Qty', 'Status', 'Quality', 'Date'], filteredDonations.map((d) => [d.id, d.donorName, d.foodType, d.quantity, d.status, String(d.qualityScore), d.donationDate]))}><FileDown className="h-4 w-4" /> PDF</RippleButton>
                  </div>
                </div>

                {/* Search + Status filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by ID, donor, food, volunteer..." className="input-field pl-10 text-sm" />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as AdminDonationStatus | 'All'); setPage(1); }} className="input-field pl-10 pr-8 text-sm appearance-none cursor-pointer">
                      <option value="All">All Statuses</option>
                      {Object.keys(statusStyles).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-3 pr-3 font-medium">Donation ID</th>
                        <th className="pb-3 pr-3 font-medium">Donor Name</th>
                        <th className="pb-3 pr-3 font-medium hidden md:table-cell">Food Type</th>
                        <th className="pb-3 pr-3 font-medium">Quantity</th>
                        <th className="pb-3 pr-3 font-medium hidden lg:table-cell">Pickup Address</th>
                        <th className="pb-3 pr-3 font-medium hidden md:table-cell">Volunteer</th>
                        <th className="pb-3 pr-3 font-medium">Status</th>
                        <th className="pb-3 pr-3 font-medium">Quality</th>
                        <th className="pb-3 pr-3 font-medium hidden sm:table-cell">Date</th>
                        <th className="pb-3 pr-3 font-medium hidden xl:table-cell">Delivery</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDonations.map((d) => (
                        <tr key={d.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors">
                          <td className="py-3 pr-3 font-mono text-xs font-medium">{d.id}</td>
                          <td className="py-3 pr-3 font-medium truncate max-w-[130px]">{d.donorName}</td>
                          <td className="py-3 pr-3 text-gray-500 hidden md:table-cell truncate max-w-[140px]">{d.foodType}</td>
                          <td className="py-3 pr-3 text-gray-500">{d.quantity}</td>
                          <td className="py-3 pr-3 text-gray-500 hidden lg:table-cell truncate max-w-[160px]">{d.pickupAddress}</td>
                          <td className="py-3 pr-3 text-gray-500 hidden md:table-cell truncate max-w-[100px]">{d.assignedVolunteer}</td>
                          <td className="py-3 pr-3"><span className={`text-[10px] px-2 py-1 rounded-full font-medium ${statusStyles[d.status]}`}>{d.status}</span></td>
                          <td className="py-3 pr-3">
                            <span className={`flex items-center gap-0.5 text-xs font-semibold ${d.qualityScore >= 4.5 ? 'text-green-600' : d.qualityScore >= 3.5 ? 'text-amber-600' : 'text-red-500'}`}>
                              <Star className="h-3 w-3 fill-current" /> {d.qualityScore}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-gray-500 hidden sm:table-cell text-xs">{d.donationDate}</td>
                          <td className="py-3 pr-3 text-gray-500 hidden xl:table-cell text-xs">{d.deliveryTime ?? '—'}</td>
                        </tr>
                      ))}
                      {paginatedDonations.length === 0 && <tr><td colSpan={10} className="py-8 text-center text-gray-400">No donations found</td></tr>}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {donPages > 1 && <Pagination page={page} pages={donPages} setPage={setPage} />}
              </div>
            )}

            {/* ── USERS ─────────────────────────────────────────────────────── */}
            {tab === 'users' && (
              <div className="glass-card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <h2 className="font-display text-lg font-bold">User Management <span className="text-sm font-normal text-gray-400">({filteredUsers.length})</span></h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <RippleButton variant="ghost" onClick={() => usersToCSV(filteredUsers)}><Download className="h-4 w-4" /> CSV</RippleButton>
                    <RippleButton variant="ghost" onClick={() => exportToPDF('User Report', ['ID', 'Name', 'Email', 'Role', 'City', 'Verified'], filteredUsers.map((u) => [u.id, u.name, u.email, u.role, u.city, u.verification]))}><FileDown className="h-4 w-4" /> PDF</RippleButton>
                  </div>
                </div>

                {/* Search + Role filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, email, ID..." className="input-field pl-10 text-sm" />
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {(['All', 'Donor', 'Volunteer', 'NGO', 'Restaurant', 'Admin'] as const).map((r) => (
                      <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }} className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${roleFilter === r ? 'bg-primary-600 text-white' : 'glass hover:bg-primary-50 dark:hover:bg-primary-900/30'}`}>{r}</button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-3 pr-3 font-medium">User ID</th>
                        <th className="pb-3 pr-3 font-medium">Photo</th>
                        <th className="pb-3 pr-3 font-medium">Name</th>
                        <th className="pb-3 pr-3 font-medium hidden md:table-cell">Email</th>
                        <th className="pb-3 pr-3 font-medium hidden lg:table-cell">Phone</th>
                        <th className="pb-3 pr-3 font-medium">Role</th>
                        <th className="pb-3 pr-3 font-medium hidden sm:table-cell">City</th>
                        <th className="pb-3 pr-3 font-medium hidden lg:table-cell">Registered</th>
                        <th className="pb-3 pr-3 font-medium">Verification</th>
                        <th className="pb-3 pr-3 font-medium hidden xl:table-cell">Last Login</th>
                        <th className="pb-3 pr-3 font-medium hidden md:table-cell">Donations</th>
                        <th className="pb-3 pr-3 font-medium hidden md:table-cell">Deliveries</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((u) => (
                        <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors">
                          <td className="py-3 pr-3 font-mono text-xs">{u.id}</td>
                          <td className="py-3 pr-3"><img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full object-cover" loading="lazy" /></td>
                          <td className="py-3 pr-3 font-medium truncate max-w-[120px]">{u.name}</td>
                          <td className="py-3 pr-3 text-gray-500 hidden md:table-cell truncate max-w-[160px]">{u.email}</td>
                          <td className="py-3 pr-3 text-gray-500 hidden lg:table-cell text-xs">{u.phone}</td>
                          <td className="py-3 pr-3"><span className={`text-[10px] px-2 py-1 rounded-full font-medium ${roleStyles[u.role]}`}>{u.role}</span></td>
                          <td className="py-3 pr-3 text-gray-500 hidden sm:table-cell">{u.city}</td>
                          <td className="py-3 pr-3 text-gray-500 hidden lg:table-cell text-xs">{u.registeredOn}</td>
                          <td className="py-3 pr-3">
                            <span className={`flex items-center gap-1 text-[10px] font-medium ${u.verification === 'Verified' ? 'text-green-600' : u.verification === 'Pending' ? 'text-amber-600' : 'text-red-500'}`}>
                              {u.verification === 'Verified' && <ShieldCheck className="h-3 w-3" />}
                              {u.verification}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-gray-500 hidden xl:table-cell text-xs">{u.lastLogin}</td>
                          <td className="py-3 pr-3 hidden md:table-cell font-semibold text-primary-600">{u.totalDonations}</td>
                          <td className="py-3 pr-3 hidden md:table-cell font-semibold text-accent-600">{u.totalDeliveries}</td>
                        </tr>
                      ))}
                      {paginatedUsers.length === 0 && <tr><td colSpan={12} className="py-8 text-center text-gray-400">No users found</td></tr>}
                    </tbody>
                  </table>
                </div>

                {userPages > 1 && <Pagination page={page} pages={userPages} setPage={setPage} />}
              </div>
            )}

            {/* ── VOLUNTEERS ─────────────────────────────────────────────────── */}
            {tab === 'volunteers' && (
              <div className="glass-card p-5">
                <h2 className="font-display text-lg font-bold mb-4">Volunteer Management <span className="text-sm font-normal text-gray-400">({adminVolunteers.length})</span></h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-3 pr-3 font-medium">Volunteer Name</th>
                        <th className="pb-3 pr-3 font-medium hidden sm:table-cell">City</th>
                        <th className="pb-3 pr-3 font-medium">Availability</th>
                        <th className="pb-3 pr-3 font-medium hidden md:table-cell">Completed</th>
                        <th className="pb-3 pr-3 font-medium hidden lg:table-cell">Current Assignment</th>
                        <th className="pb-3 pr-3 font-medium">Rating</th>
                        <th className="pb-3 pr-3 font-medium hidden md:table-cell">Response</th>
                        <th className="pb-3 pr-3 font-medium">Verified</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminVolunteers.map((v) => (
                        <tr key={v.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors">
                          <td className="py-3 pr-3 font-medium">{v.name}</td>
                          <td className="py-3 pr-3 text-gray-500 hidden sm:table-cell">{v.city}</td>
                          <td className="py-3 pr-3">
                            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${v.availability === 'Available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : v.availability === 'On Delivery' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>{v.availability}</span>
                          </td>
                          <td className="py-3 pr-3 hidden md:table-cell font-semibold">{v.completedDeliveries}</td>
                          <td className="py-3 pr-3 hidden lg:table-cell font-mono text-xs text-gray-500">{v.currentAssignment ?? '—'}</td>
                          <td className="py-3 pr-3"><span className="flex items-center gap-0.5 text-xs font-semibold text-amber-600"><Star className="h-3 w-3 fill-current" /> {v.avgRating}</span></td>
                          <td className="py-3 pr-3 text-gray-500 hidden md:table-cell text-xs">{v.responseTime}</td>
                          <td className="py-3 pr-3">{v.verified ? <ShieldCheck className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-amber-500" />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── QUALITY REPORTS ─────────────────────────────────────────────── */}
            {tab === 'quality' && (
              <div className="glass-card p-5">
                <h2 className="font-display text-lg font-bold mb-4">Food Quality Reports <span className="text-sm font-normal text-gray-400">({foodQualityReports.length})</span></h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-3 pr-3 font-medium">Donation ID</th>
                        <th className="pb-3 pr-3 font-medium">Temperature</th>
                        <th className="pb-3 pr-3 font-medium hidden sm:table-cell">Packaging</th>
                        <th className="pb-3 pr-3 font-medium hidden sm:table-cell">Freshness</th>
                        <th className="pb-3 pr-3 font-medium">Expiry Check</th>
                        <th className="pb-3 pr-3 font-medium hidden md:table-cell">Inspection Result</th>
                        <th className="pb-3 pr-3 font-medium hidden lg:table-cell">Inspector</th>
                        <th className="pb-3 pr-3 font-medium">Approval</th>
                      </tr>
                    </thead>
                    <tbody>
                      {foodQualityReports.map((r) => (
                        <tr key={r.donationId} className="border-b border-gray-100 dark:border-gray-800 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors">
                          <td className="py-3 pr-3 font-mono text-xs font-medium">{r.donationId}</td>
                          <td className="py-3 pr-3 text-gray-500">{r.temperature}</td>
                          <td className="py-3 pr-3 hidden sm:table-cell">
                            <span className={`text-xs font-medium ${r.packaging === 'Excellent' ? 'text-green-600' : r.packaging === 'Good' ? 'text-primary-600' : r.packaging === 'Fair' ? 'text-amber-600' : 'text-red-500'}`}>{r.packaging}</span>
                          </td>
                          <td className="py-3 pr-3 hidden sm:table-cell">
                            <span className={`text-xs font-medium ${r.freshness === 'Fresh' ? 'text-green-600' : r.freshness === 'Good' ? 'text-primary-600' : r.freshness === 'Average' ? 'text-amber-600' : 'text-red-500'}`}>{r.freshness}</span>
                          </td>
                          <td className="py-3 pr-3"><span className={`text-[10px] px-2 py-1 rounded-full font-medium ${r.expiryCheck === 'Pass' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>{r.expiryCheck}</span></td>
                          <td className="py-3 pr-3 hidden md:table-cell">
                            <span className={`text-xs font-medium ${r.inspectionResult === 'Approved' ? 'text-green-600' : r.inspectionResult === 'Rejected' ? 'text-red-500' : 'text-amber-600'}`}>{r.inspectionResult}</span>
                          </td>
                          <td className="py-3 pr-3 text-gray-500 hidden lg:table-cell text-xs">{r.inspector}</td>
                          <td className="py-3 pr-3">
                            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${r.approvalStatus === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : r.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>{r.approvalStatus}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── LIVE ACTIVITY ─────────────────────────────────────────────── */}
            {tab === 'activity' && (
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                  <h2 className="font-display text-lg font-bold">Live Activity Feed</h2>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto no-scrollbar">
                  {liveActivities.map((act, i) => {
                    const { icon: Icon, color } = activityIcons[act.type];
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
                </div>
              </div>
            )}

            {/* ── ANALYTICS ─────────────────────────────────────────────────── */}
            {tab === 'analytics' && (
              <div className="glass-card p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <h2 className="font-display text-lg font-bold">Platform Analytics</h2>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { key: 'donations', label: 'Donations', color: '#1B4332' },
                      { key: 'deliveries', label: 'Deliveries', color: '#4F8060' },
                      { key: 'users', label: 'Users', color: '#3B82F6' },
                      { key: 'volunteers', label: 'Volunteers', color: '#F59E0B' },
                    ] as const).map((m) => (
                      <button
                        key={m.key}
                        onClick={() => setChartToggles((t) => ({ ...t, [m.key]: !t[m.key] }))}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${chartToggles[m.key] ? 'glass ring-2 ring-primary-400' : 'glass opacity-50'}`}
                      >
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-[300px] sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyAnalytics} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      {chartToggles.donations && <Line type="monotone" dataKey="donations" stroke="#1B4332" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />}
                      {chartToggles.deliveries && <Line type="monotone" dataKey="deliveries" stroke="#4F8060" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />}
                      {chartToggles.users && <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />}
                      {chartToggles.volunteers && <Line type="monotone" dataKey="volunteers" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary stats below chart */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  {[
                    { label: 'Total Donations', value: 9341, icon: Package, color: 'text-primary-600' },
                    { label: 'Total Deliveries', value: 7824, icon: CheckCircle2, color: 'text-green-600' },
                    { label: 'Total Users', value: 14827, icon: Users, color: 'text-blue-600' },
                    { label: 'Active Volunteers', value: 1247, icon: Truck, color: 'text-amber-600' },
                  ].map((s) => (
                    <div key={s.label} className="p-4 rounded-xl glass">
                      <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
                      <p className="font-display text-xl font-bold"><AnimatedCounter value={s.value} /></p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}

function Pagination({ page, pages, setPage }: { page: number; pages: number; setPage: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-gray-400">Page {page} of {pages}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-lg glass disabled:opacity-40 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors" aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${page === p ? 'bg-primary-600 text-white' : 'glass hover:bg-primary-50 dark:hover:bg-primary-900/30'}`}>{p}</button>
        ))}
        <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages} className="p-2 rounded-lg glass disabled:opacity-40 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors" aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
