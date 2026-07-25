import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Users,
  Hotel,
  PartyPopper,
  UserRound,
  Building2,
  Leaf,
  Globe2,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  Utensils,
  PackageCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { AnimatedCounter, SectionHeading, scaleIn, staggerContainer, fadeInUp } from '@/lib/animations';
import { LeafletMap, type MapPoint } from '@/components/LeafletMap';
import { RippleButton } from '@/components/ui/RippleButton';

interface ImpactStat {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: typeof UtensilsCrossed;
  gradient: string;
  glow: string;
  progress: number;
}

const impactStats: ImpactStat[] = [
  { label: 'Meals Rescued', value: 25000, suffix: '+', icon: UtensilsCrossed, gradient: 'from-emerald-500 to-green-600', glow: 'shadow-emerald-500/40', progress: 92 },
  { label: 'Families Fed', value: 8500, suffix: '+', icon: Users, gradient: 'from-orange-500 to-amber-500', glow: 'shadow-orange-500/40', progress: 78 },
  { label: 'Partner Hotels', value: 320, suffix: '+', icon: Hotel, gradient: 'from-sky-500 to-blue-600', glow: 'shadow-sky-500/40', progress: 64 },
  { label: 'Events Covered', value: 540, suffix: '+', icon: PartyPopper, gradient: 'from-rose-500 to-pink-600', glow: 'shadow-rose-500/40', progress: 70 },
  { label: 'Active Volunteers', value: 1800, suffix: '+', icon: UserRound, gradient: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/40', progress: 85 },
  { label: 'NGOs Connected', value: 145, suffix: '+', icon: Building2, gradient: 'from-teal-500 to-cyan-600', glow: 'shadow-teal-500/40', progress: 58 },
  { label: 'Food Saved', value: 52, suffix: ' Tons', icon: Leaf, gradient: 'from-lime-500 to-green-600', glow: 'shadow-lime-500/40', progress: 81 },
  { label: 'CO₂ Reduced', value: 18, suffix: ' Tons', icon: Globe2, gradient: 'from-green-600 to-emerald-700', glow: 'shadow-green-600/40', progress: 67 },
  { label: 'Lives Impacted', value: 60000, suffix: '+', icon: HeartHandshake, gradient: 'from-red-500 to-rose-600', glow: 'shadow-red-500/40', progress: 95 },
];

const monthlyData = [
  { month: 'Jan', donations: 120, meals: 2400, waste: 3.2 },
  { month: 'Feb', donations: 145, meals: 3100, waste: 4.1 },
  { month: 'Mar', donations: 180, meals: 4200, waste: 5.5 },
  { month: 'Apr', donations: 165, meals: 3800, waste: 4.8 },
  { month: 'May', donations: 210, meals: 5100, waste: 6.2 },
  { month: 'Jun', donations: 240, meals: 5800, waste: 7.4 },
  { month: 'Jul', donations: 280, meals: 6900, waste: 8.1 },
  { month: 'Aug', donations: 310, meals: 7600, waste: 9.3 },
  { month: 'Sep', donations: 295, meals: 7200, waste: 8.8 },
  { month: 'Oct', donations: 340, meals: 8400, waste: 10.2 },
  { month: 'Nov', donations: 380, meals: 9100, waste: 11.5 },
  { month: 'Dec', donations: 420, meals: 10200, waste: 12.8 },
];

const mapPoints: MapPoint[] = [
  { lat: 19.076, lng: 72.8777, type: 'donor', label: 'Taj Hotel Mumbai', popup: '<b>Partner Hotel</b><br/>Taj Hotel — 250 meals this week' },
  { lat: 28.6139, lng: 77.209, type: 'donor', label: 'The Leela Delhi', popup: '<b>Partner Hotel</b><br/>The Leela — 180 meals this week' },
  { lat: 12.9716, lng: 77.5946, type: 'donor', label: 'ITC Royal Bangalore', popup: '<b>Partner Hotel</b><br/>ITC Royal — 320 meals this week' },
  { lat: 13.0827, lng: 80.2707, type: 'ngo', label: 'Hope Foundation Chennai', popup: '<b>NGO Partner</b><br/>Hope Foundation — serves 400 people daily' },
  { lat: 22.5726, lng: 88.3639, type: 'ngo', label: 'Annapurna Kolkata', popup: '<b>NGO Partner</b><br/>Annapurna — serves 250 people daily' },
  { lat: 17.385, lng: 78.4867, type: 'ngo', label: 'Feeding India Hyderabad', popup: '<b>NGO Partner</b><br/>Feeding India — serves 600 people daily' },
  { lat: 19.044, lng: 72.846, type: 'donation', label: 'Donation Point Mumbai', popup: '<b>Donation Point</b><br/>Active collection center' },
  { lat: 28.5562, lng: 77.1, type: 'donation', label: 'Donation Point Delhi', popup: '<b>Donation Point</b><br/>Active collection center' },
  { lat: 12.9352, lng: 77.6245, type: 'volunteer', label: 'Volunteer Rahul', popup: '<b>Volunteer</b><br/>Rahul — 142 deliveries completed' },
  { lat: 18.5204, lng: 73.8567, type: 'volunteer', label: 'Volunteer Priya', popup: '<b>Volunteer</b><br/>Priya — 98 deliveries completed' },
];

const timeline = [
  { icon: Hotel, text: 'Hotel Paradise donated 250 meals', time: '2 hours ago', color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-900/30' },
  { icon: Utensils, text: 'Royal Convention donated 180 meals', time: '5 hours ago', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { icon: PackageCheck, text: 'Volunteer Rahul completed delivery in 22 minutes', time: 'Today', color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-2xl px-4 py-3 shadow-xl border border-white/40 dark:border-white/10">
      <p className="font-display font-bold text-sm mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs flex items-center gap-2" style={{ color: p.color }}>
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold">{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

export function ImpactDashboard() {
  return (
    <div>
      {/* Hero stats */}
      <section className="section">
        <SectionHeading badge="Our Impact" title="Our Impact in Numbers" subtitle="Every donation creates hope, reduces food waste, and builds a stronger community." />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 mt-12"
        >
          {impactStats.map((s) => (
            <motion.div
              key={s.label}
              variants={scaleIn}
              whileHover={{ y: -8 }}
              className="relative group rounded-[20px] p-[1.5px] bg-gradient-to-br from-white/60 to-white/20 dark:from-white/10 dark:to-white/5 backdrop-blur-xl shadow-xl shadow-primary-900/5 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              <div className="relative rounded-[19px] p-5 sm:p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br ${s.gradient} text-white items-center justify-center shadow-lg ${s.glow} group-hover:scale-110 transition-transform duration-300`}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium text-gray-400">live</span>
                </div>
                <p className="font-display text-2xl sm:text-3xl font-bold gradient-text">
                  <AnimatedCounter value={s.value} suffix={s.suffix} prefix={s.prefix} />
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">{s.label}</p>
                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                    <span>Goal progress</span>
                    <span>{s.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r ${s.gradient}`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Monthly Impact Chart */}
      <section className="section bg-gradient-to-b from-primary-50/30 to-white dark:from-primary-950/10 dark:to-gray-950">
        <SectionHeading badge="Monthly Impact" title="Donations by Month" subtitle="Tracking donations, meals delivered, and food waste reduced across the year." />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7 }}
          className="mt-12 glass-card p-5 sm:p-8"
        >
          <div className="w-full h-[340px] sm:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradMeals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradWaste" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.15)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} iconType="circle" />
                <Area type="monotone" dataKey="donations" name="Donations" stroke="#10b981" strokeWidth={2.5} fill="url(#gradDonations)" dot={false} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="meals" name="Meals Delivered" stroke="#f97316" strokeWidth={2.5} fill="url(#gradMeals)" dot={false} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="waste" name="Food Waste Reduced (Tons)" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#gradWaste)" dot={false} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      {/* Impact Map */}
      <section className="section">
        <SectionHeading badge="Impact Map" title="Our Reach Across India" subtitle="Partner hotels, NGOs, donation points, and volunteers — all connected in real time." />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7 }}
          className="mt-12 glass-card p-3 sm:p-5"
        >
          <div className="rounded-[18px] overflow-hidden h-[400px] sm:h-[480px]">
            <LeafletMap points={mapPoints} center={[20.5937, 78.9629]} zoom={5} className="h-full w-full" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 text-xs sm:text-sm">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-600 ring-2 ring-white shadow" /> Partner Hotels</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-violet-600 ring-2 ring-white shadow" /> NGOs</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-cyan-600 ring-2 ring-white shadow" /> Donation Points</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-orange-500 ring-2 ring-white shadow" /> Volunteers</span>
          </div>
        </motion.div>
      </section>

      {/* Recent Success Stories Timeline */}
      <section className="section bg-gradient-to-b from-primary-50/30 to-white dark:from-primary-950/10 dark:to-gray-950">
        <SectionHeading badge="Recent Activity" title="Recent Success Stories" subtitle="Real-time milestones from our community of donors and volunteers." />

        <div className="max-w-3xl mx-auto mt-12 space-y-5">
          {timeline.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="glass-card p-5 sm:p-6 flex items-center gap-4 sm:gap-5 group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl ${t.bg} ${t.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <t.icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <p className="font-display font-semibold text-sm sm:text-base">{t.text}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">{t.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-600 via-green-600 to-green-700 p-8 sm:p-14 text-center text-white"
        >
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-orange-400/20 blur-3xl" />
          <motion.h2 variants={fadeInUp} className="font-display text-3xl sm:text-4xl font-bold mb-4 relative z-10">
            Together We Can End Food Waste
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-white/90 max-w-xl mx-auto mb-8 relative z-10">
            Join thousands of donors and volunteers reducing food waste and fighting hunger every single day.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link to="/donate-food">
              <RippleButton className="bg-white text-green-700 hover:bg-gray-50 text-base px-7 py-3.5">
                Donate Now <ArrowRight className="h-4 w-4" />
              </RippleButton>
            </Link>
            <Link to="/register">
              <RippleButton variant="ghost" className="text-white hover:bg-white/10 text-base px-7 py-3.5">
                Become a Volunteer <HeartHandshake className="h-4 w-4" />
              </RippleButton>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
