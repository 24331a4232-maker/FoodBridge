import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  UtensilsCrossed, Users, Recycle, Heart, TrendingUp, BarChart3,
  type LucideIcon,
} from 'lucide-react';

/* ---------- realistic monthly sample data (steady growth) ---------- */

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const donationData = months.map((m, i) => ({
  month: m,
  donations: 120 + i * 18 + Math.round(Math.sin(i) * 8),
}));

const volunteerData = months.map((m, i) => ({
  month: m,
  volunteers: 45 + i * 9 + Math.round(Math.cos(i) * 4),
}));

const wasteData = months.map((m, i) => ({
  month: m,
  kg: 320 + i * 42 + Math.round(Math.sin(i * 0.8) * 18),
}));

const familiesData = months.map((m, i) => ({
  month: m,
  families: 180 + i * 28 + Math.round(Math.cos(i * 0.5) * 10),
}));

const doughnutData = [
  { name: 'Meals Delivered', value: 128450, fill: '#1B4332' },
  { name: 'Donations Completed', value: 18920, fill: '#2D6A4F' },
  { name: 'Active Volunteers', value: 1560, fill: '#8B5E3C' },
  { name: 'Partner Organizations', value: 340, fill: '#C9A66B' },
];

const growthCards = [
  { label: 'Donations', value: 18920, growth: '+18%', spark: [120, 138, 156, 174, 192, 210, 228, 246], icon: UtensilsCrossed, color: '#1B4332', bg: 'from-primary-500 to-primary-700' },
  { label: 'Volunteers', value: 1560, growth: '+12%', spark: [45, 54, 63, 72, 81, 90, 99, 108], icon: Users, color: '#2D6A4F', bg: 'from-secondary-500 to-primary-600' },
  { label: 'Meals Delivered', value: 128450, growth: '+22%', spark: [8400, 9200, 10800, 11500, 13200, 14500, 16800, 18200], icon: Heart, color: '#8B5E3C', bg: 'from-accent-500 to-accent-700' },
  { label: 'Food Waste Prevented', value: 4200, suffix: ' kg', growth: '+15%', spark: [320, 362, 404, 446, 488, 530, 572, 614], icon: Recycle, color: '#C9A66B', bg: 'from-gold-400 to-gold-600' },
];

/* ---------- shared tooltip style ---------- */

const tooltipStyle = {
  backgroundColor: 'rgba(27, 67, 50, 0.95)',
  border: 'none',
  borderRadius: '12px',
  color: '#F5F1E8',
  fontSize: '13px',
  fontWeight: 600,
  padding: '10px 14px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
};

const tooltipItemStyle = { color: '#F5F1E8' };

/* ---------- Sparkline ---------- */

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const w = 100;
  const h = 32;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`);
  const d = `M ${pts.join(' L ')}`;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={`${d} L ${w},${h} L 0,${h} Z`} fill={color} opacity={0.1} />
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / range) * (h - 4) - 2} r={2.5} fill={color} />
    </svg>
  );
}

/* ---------- Animated counter ---------- */

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 70, damping: 22 });

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  useEffect(() => {
    const unsub = spring.on('change', (v: number) => {
      if (ref.current) ref.current.textContent = `${Math.round(v).toLocaleString()}${suffix}`;
    });
    return () => { unsub(); };
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ---------- Chart card wrapper ---------- */

function ChartCard({ title, subtitle, icon: Icon, children, delay = 0 }: { title: string; subtitle: string; icon: LucideIcon; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-secondary-900 rounded-3xl p-6 shadow-soft border border-linen/60 dark:border-secondary-800/60 transition-shadow hover:shadow-premium"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-lg">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold text-ink dark:text-cream">{title}</h3>
          <p className="text-xs text-ink-soft dark:text-cream/50">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </motion.div>
  );
}

/* ---------- Main component ---------- */

export function ImpactAnalyticsDashboard() {
  return (
    <section className="section-wide bg-cream dark:bg-secondary-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto mb-14"
      >
        <span className="eyebrow justify-center">
          <BarChart3 className="h-3.5 w-3.5" /> Live Dashboard
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-ink dark:text-cream mt-4 text-balance">
          FoodBridge Impact Analytics
        </h2>
        <p className="text-lg text-ink-soft dark:text-cream/60 mt-4 text-pretty">
          Real-time insights showing how FoodBridge is reducing food waste and helping communities.
        </p>
      </motion.div>

      {/* Monthly Growth Cards (4 across) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {growthCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="relative bg-white dark:bg-secondary-900 rounded-3xl p-6 shadow-soft border border-linen/60 dark:border-secondary-800/60 overflow-hidden group transition-shadow hover:shadow-premium"
            >
              <div className={`absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br ${c.bg} opacity-15 blur-2xl group-hover:opacity-30 transition-opacity`} />
              <div className="relative flex items-start justify-between mb-4">
                <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${c.bg} text-white flex items-center justify-center shadow-lg`}>
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" /> {c.growth}
                </span>
              </div>
              <p className="font-stat text-2xl sm:text-3xl font-bold text-ink dark:text-cream tabular-nums">
                <Counter value={c.value} suffix={c.suffix ?? ''} />
              </p>
              <p className="text-sm text-ink-soft dark:text-cream/60 mt-1">{c.label}</p>
              <div className="mt-3 -mx-1">
                <MiniSparkline data={c.spark} color={c.color} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts — 2 column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donations Over Time — Line chart */}
        <ChartCard title="Donations Over Time" subtitle="Monthly donation growth" icon={UtensilsCrossed}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={donationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1B4332" />
                  <stop offset="100%" stopColor="#2D6A4F" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" opacity={0.4} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8A7E6E' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8A7E6E' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} cursor={{ stroke: '#1B4332', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line type="monotone" dataKey="donations" stroke="url(#lineGrad)" strokeWidth={3} dot={{ r: 4, fill: '#1B4332' }} activeDot={{ r: 6, fill: '#1B4332', stroke: '#fff', strokeWidth: 2 }} animationDuration={1800} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Volunteer Growth — Bar chart */}
        <ChartCard title="Volunteer Growth" subtitle="Monthly active volunteers" icon={Users} delay={0.1}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={volunteerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D6A4F" />
                  <stop offset="100%" stopColor="#74A57F" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" opacity={0.4} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8A7E6E' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8A7E6E' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} cursor={{ fill: 'rgba(45,106,79,0.08)' }} />
              <Bar dataKey="volunteers" fill="url(#barGrad)" radius={[8, 8, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Food Waste Prevented — Area chart */}
        <ChartCard title="Food Waste Prevented" subtitle="Kilograms of food saved each month" icon={Recycle} delay={0.15}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={wasteData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A66B" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#C9A66B" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" opacity={0.4} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8A7E6E' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#8A7E6E' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} cursor={{ stroke: '#C9A66B', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="kg" stroke="#C9A66B" strokeWidth={2.5} fill="url(#areaGrad)" animationDuration={1800} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Families Supported — Counter + sparkline */}
        <ChartCard title="Families Supported" subtitle="Cumulative families receiving meals" icon={Heart} delay={0.2}>
          <div className="flex flex-col items-center justify-center h-[240px]">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-accent-200/30 blur-2xl" />
              <p className="relative font-stat text-5xl font-bold gradient-text">
                <Counter value={38900} suffix="+" />
              </p>
            </div>
            <p className="text-sm text-ink-soft dark:text-cream/60 mt-2">families across 28 cities</p>
            <div className="mt-6 w-full max-w-xs">
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={familiesData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="famGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5E3C" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#8B5E3C" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="families" stroke="#8B5E3C" strokeWidth={2} fill="url(#famGrad)" animationDuration={1500} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Overall Platform Impact — Doughnut chart (full width) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, delay: 0.2 }}
        whileHover={{ y: -4 }}
        className="bg-white dark:bg-secondary-900 rounded-3xl p-8 shadow-soft border border-linen/60 dark:border-secondary-800/60 mt-6 transition-shadow hover:shadow-premium"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-white flex items-center justify-center shadow-lg">
            <BarChart3 className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-ink dark:text-cream">Overall Platform Impact</h3>
            <p className="text-xs text-ink-soft dark:text-cream/50">Distribution across all metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mt-6">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={doughnutData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                animationDuration={1500}
                stroke="none"
              >
                {doughnutData.map((d) => (
                  <Cell key={d.name} fill={d.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={tooltipItemStyle}
                formatter={(v: number) => v.toLocaleString()}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-4">
            {doughnutData.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <span className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink dark:text-cream">{d.name}</p>
                  <p className="font-stat text-xl font-bold" style={{ color: d.fill }}>{d.value.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
            <div className="pt-4 border-t border-linen dark:border-secondary-800">
              <p className="text-xs text-ink-soft dark:text-cream/50">Data reflects platform activity from January to December 2025.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
