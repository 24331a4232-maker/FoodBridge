import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  UtensilsCrossed, Users, Recycle, Heart, TrendingUp, BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { AnimatedCounter } from '@/lib/animations';

/* ---------- Data: 12 months of impact metrics ---------- */

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MetricDef {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  values: number[];
  unit: string;
  total: number;
  growth: string;
}

const metrics: MetricDef[] = [
  {
    key: 'donations',
    label: 'Donations',
    icon: UtensilsCrossed,
    color: '#1B4332',
    values: [1200, 1380, 1560, 1740, 1920, 2100, 2280, 2460, 2640, 2820, 3000, 3180],
    unit: '',
    total: 26280,
    growth: '+18%',
  },
  {
    key: 'volunteers',
    label: 'Volunteers',
    icon: Users,
    color: '#74A57F',
    values: [860, 918, 976, 1034, 1092, 1150, 1208, 1266, 1324, 1382, 1440, 1560],
    unit: '',
    total: 1560,
    growth: '+12%',
  },
  {
    key: 'waste',
    label: 'Food Waste Prevented',
    icon: Recycle,
    color: '#C9A66B',
    values: [280, 312, 344, 376, 408, 440, 472, 504, 536, 568, 600, 632],
    unit: ' kg',
    total: 5472,
    growth: '+22%',
  },
  {
    key: 'families',
    label: 'Families Helped',
    icon: Heart,
    color: '#8B5E3C',
    values: [21000, 22500, 24200, 25800, 27600, 29500, 31200, 33000, 34800, 36500, 37800, 38900],
    unit: '',
    total: 38900,
    growth: '+14%',
  },
];

function normalize(value: number, values: number[]): number {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 50;
  return ((value - min) / (max - min)) * 100;
}

const chartData = months.map((m, i) => {
  const point: Record<string, string | number> = { month: m };
  metrics.forEach((metric) => {
    point[metric.key] = metric.values[i];
    point[`${metric.key}_norm`] = normalize(metric.values[i], metric.values);
  });
  return point;
});

/* ---------- KPI card definitions ---------- */

const kpiCards = [
  { ...metrics[0], cardLabel: 'Total Donations' },
  { ...metrics[1], cardLabel: 'Active Volunteers' },
  { ...metrics[2], cardLabel: 'Food Waste Prevented' },
  { ...metrics[3], cardLabel: 'Families Supported' },
];

/* ---------- Mini Sparkline (SVG) ---------- */

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const w = 120;
  const h = 36;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 6) - 3}`);
  const linePath = `M ${pts.join(' L ')}`;
  const areaPath = `${linePath} L ${w},${h} L 0,${h} Z`;
  const lastY = h - ((data[data.length - 1] - min) / range) * (h - 6) - 3;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={areaPath} fill={color} opacity={0.1} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={lastY} r={2.5} fill={color} />
    </svg>
  );
}

/* ---------- Custom Chart Tooltip ---------- */

interface TooltipPayloadEntry {
  dataKey: string;
  value: number;
  payload: Record<string, string | number>;
  color: string;
}

function ImpactTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-4 shadow-2xl border border-linen/60 dark:border-secondary-800/60 min-w-[200px]">
      <p className="font-display font-semibold text-sm text-ink dark:text-cream mb-3">{label} 2025</p>
      <div className="space-y-2.5">
        {payload.map((p) => {
          const realKey = p.dataKey.replace('_norm', '');
          const metric = metrics.find((m) => m.key === realKey);
          if (!metric) return null;
          const realValue = p.payload[realKey] as number;
          return (
            <div key={realKey} className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: metric.color }} />
              <span className="text-xs text-ink-soft dark:text-cream/60">{metric.label}</span>
              <span className="font-stat text-sm font-bold ml-auto tabular-nums" style={{ color: metric.color }}>
                {realValue.toLocaleString()}{metric.unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Unified Impact Graph + KPI Cards ---------- */

export function UnifiedImpactGraph() {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(
    new Set(metrics.map((m) => m.key)),
  );

  const toggleMetric = (key: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const visibleMetrics = metrics.filter((m) => visibleKeys.has(m.key));

  return (
    <div>
      {/* Premium glassmorphism card containing the unified graph */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
        className="glass-card p-6 sm:p-8 shadow-premium-lg overflow-hidden"
      >
        {/* Card header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl-premium bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-glow-green">
              <BarChart3 className="h-5.5 w-5.5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-ink dark:text-cream">
                FoodBridge Impact Graph
              </h3>
              <p className="text-xs text-ink-soft dark:text-cream/50">
                12-month unified impact overview &middot; 2025
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded-full self-start sm:self-auto">
            <TrendingUp className="h-3.5 w-3.5" /> All metrics trending up
          </span>
        </div>

        {/* Legend — toggle pills at the top */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const isActive = visibleKeys.has(metric.key);
            return (
              <button
                key={metric.key}
                onClick={() => toggleMetric(metric.key)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-secondary-800 shadow-soft border border-linen/60 dark:border-secondary-700 text-ink dark:text-cream'
                    : 'bg-transparent opacity-40 hover:opacity-70 border border-linen/40 dark:border-secondary-700/50 text-ink-soft dark:text-cream/60'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0 transition-colors"
                  style={{ backgroundColor: isActive ? metric.color : '#999' }}
                />
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {metric.label}
              </button>
            );
          })}
        </div>

        {/* The unified multi-line chart */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D0" opacity={0.35} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#8A7E6E' }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#8A7E6E' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}`}
              />
              <Tooltip content={<ImpactTooltip />} cursor={{ stroke: '#1B4332', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.3 }} />
              {visibleMetrics.map((metric, i) => (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={`${metric.key}_norm`}
                  stroke={metric.color}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: metric.color }}
                  animationDuration={2000}
                  animationBegin={i * 250}
                  isAnimationActive
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <span className="absolute top-0 right-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft/50 dark:text-cream/40">
            Impact Index
          </span>
        </div>
      </motion.div>

      {/* KPI Cards — 4 across */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
        {kpiCards.map((c, i) => {
          const Icon = c.icon;
          const sparkData = c.values.slice(-8);
          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="relative glass-card p-6 overflow-hidden group transition-shadow hover:shadow-premium"
            >
              <div
                className="absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-15 blur-2xl group-hover:opacity-30 transition-opacity"
                style={{ backgroundColor: c.color }}
              />
              <div className="relative flex items-start justify-between mb-4">
                <div
                  className="h-11 w-11 rounded-2xl-premium flex items-center justify-center shadow-lg text-white"
                  style={{ backgroundColor: c.color }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" /> {c.growth}
                </span>
              </div>
              <p className="font-stat text-2xl sm:text-3xl font-bold text-ink dark:text-cream tabular-nums">
                <AnimatedCounter value={c.total} suffix={c.unit} />
              </p>
              <p className="text-sm text-ink-soft dark:text-cream/60 mt-1">{c.cardLabel}</p>
              <div className="mt-3 -mx-1">
                <MiniSparkline data={sparkData} color={c.color} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Full section wrapper (used on HomePage) ---------- */

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
          One unified view of how FoodBridge is reducing food waste and helping communities grow.
        </p>
      </motion.div>

      <UnifiedImpactGraph />
    </section>
  );
}
