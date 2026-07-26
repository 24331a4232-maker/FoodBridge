import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  UtensilsCrossed, Users, Heart, Recycle, BarChart3, TrendingUp, TrendingDown,
  type LucideIcon,
} from 'lucide-react';
import { AnimatedCounter } from '@/lib/animations';

/* ---------- 12 months of impact data ---------- */

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MetricDef {
  key: string;
  label: string;
  emoji: string;
  icon: LucideIcon;
  color: string;
  glow: string;
  values: number[];
  unit: string;
  total: number;
  growth: number;
  cardLabel: string;
}

const metrics: MetricDef[] = [
  {
    key: 'donations',
    label: 'Donations',
    emoji: '🍱',
    icon: UtensilsCrossed,
    color: '#2D6A4F', // Pine Green
    glow: 'rgba(45, 106, 79, 0.45)',
    values: [1200, 1380, 1560, 1740, 1920, 2100, 2280, 2460, 2640, 2820, 3000, 3180],
    unit: '',
    total: 26280,
    growth: 18,
    cardLabel: 'Donations',
  },
  {
    key: 'volunteers',
    label: 'Volunteers',
    emoji: '🙋',
    icon: Users,
    color: '#52796F', // Forest Green
    glow: 'rgba(82, 121, 111, 0.45)',
    values: [860, 918, 976, 1034, 1092, 1150, 1208, 1266, 1324, 1382, 1440, 1560],
    unit: '',
    total: 1560,
    growth: 12,
    cardLabel: 'Volunteers',
  },
  {
    key: 'families',
    label: 'Families Helped',
    emoji: '❤️',
    icon: Heart,
    color: '#8B5E3C', // Mocha Brown
    glow: 'rgba(139, 94, 60, 0.45)',
    values: [21000, 22500, 24200, 25800, 27600, 29500, 31200, 33000, 34800, 36500, 37800, 38900],
    unit: '',
    total: 38900,
    growth: 14,
    cardLabel: 'Families Helped',
  },
  {
    key: 'waste',
    label: 'Food Waste Prevented',
    emoji: '♻️',
    icon: Recycle,
    color: '#C9A66B', // Gold
    glow: 'rgba(201, 166, 107, 0.5)',
    values: [280, 312, 344, 376, 408, 440, 472, 504, 536, 568, 600, 632],
    unit: ' kg',
    total: 5472,
    growth: 22,
    cardLabel: 'Food Waste Prevented',
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

/* ---------- Mini sparkline (SVG) ---------- */

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const w = 120;
  const h = 38;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 8) - 4}`);
  const linePath = `M ${pts.join(' L ')}`;
  const areaPath = `${linePath} L ${w},${h} L 0,${h} Z`;
  const lastY = h - ((data[data.length - 1] - min) / range) * (h - 8) - 4;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={areaPath} fill={color} opacity={0.12} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={lastY} r={2.8} fill={color} />
      <circle cx={w} cy={lastY} r={5} fill={color} opacity={0.25} />
    </svg>
  );
}

/* ---------- Custom tooltip with vertical guideline ---------- */

interface TooltipPayloadEntry {
  dataKey: string;
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
    <div className="glass-card p-4 shadow-2xl border border-linen/60 dark:border-secondary-800/60 min-w-[220px]">
      <p className="font-display font-semibold text-sm text-ink dark:text-cream mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary-500" />
        {label} 2025
      </p>
      <div className="space-y-2.5">
        {metrics.map((metric) => {
          const realValue = payload[0]?.payload[metric.key] as number | undefined;
          if (realValue === undefined) return null;
          return (
            <div key={metric.key} className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0 ring-2 ring-white/40"
                style={{ backgroundColor: metric.color, boxShadow: `0 0 8px ${metric.glow}` }}
              />
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

/* ---------- Unified Interactive Impact Timeline ---------- */

export function UnifiedImpactGraph() {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(
    new Set(metrics.map((m) => m.key)),
  );
  const [hovered, setHovered] = useState(false);

  const toggleMetric = (key: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const visibleMetrics = metrics.filter((m) => visibleKeys.has(m.key));
  const primaryMetric = metrics[0]; // donations gets the gradient area

  return (
    <div>
      {/* ===== Premium glassmorphism analytics card ===== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
        className="relative rounded-[24px] bg-white/70 dark:bg-secondary-900/60 backdrop-blur-xl border border-linen/50 dark:border-secondary-700/50 shadow-premium-lg overflow-hidden"
      >
        {/* warm cream background tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-cream/60 via-oat/30 to-gold-50/20 dark:from-secondary-950/40 dark:via-secondary-900/20 dark:to-transparent pointer-events-none" />

        {/* Card content */}
        <div className="relative p-6 sm:p-8 lg:p-10">
          {/* ===== Header above the graph ===== */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded-full">
                  <BarChart3 className="h-3.5 w-3.5" /> Live Dashboard
                </span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-ink dark:text-cream text-balance">
                📈 FoodBridge Impact Overview
              </h3>
              <p className="text-base text-ink-soft dark:text-cream/60 mt-2 max-w-xl text-pretty">
                Tracking our journey towards reducing food waste and feeding communities.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3.5 py-2 rounded-full self-start sm:self-end">
              <TrendingUp className="h-3.5 w-3.5" /> All metrics trending up
            </span>
          </div>

          {/* ===== Interactive legend (toggle pills) ===== */}
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const isActive = visibleKeys.has(metric.key);
              return (
                <button
                  key={metric.key}
                  onClick={() => toggleMetric(metric.key)}
                  className={`group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-white dark:bg-secondary-800 shadow-soft border border-linen/60 dark:border-secondary-700 text-ink dark:text-cream'
                      : 'bg-transparent opacity-40 hover:opacity-70 border border-linen/40 dark:border-secondary-700/50 text-ink-soft dark:text-cream/60'
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor: isActive ? metric.color : '#999',
                      boxShadow: isActive ? `0 0 10px ${metric.glow}` : 'none',
                    }}
                  />
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  {metric.label}
                </button>
              );
            })}
          </div>

          {/* ===== The unified interactive chart ===== */}
          <motion.div
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            animate={{ scale: hovered ? 1.01 : 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative"
          >
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={chartData} margin={{ top: 12, right: 16, left: -14, bottom: 4 }}>
                <defs>
                  <linearGradient id="donationAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={primaryMetric.color} stopOpacity={0.35} />
                    <stop offset="60%" stopColor={primaryMetric.color} stopOpacity={0.12} />
                    <stop offset="100%" stopColor={primaryMetric.color} stopOpacity={0} />
                  </linearGradient>
                  {metrics.map((m) => (
                    <filter key={m.key} id={`glow-${m.key}`} x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  ))}
                </defs>

                {/* soft grid lines */}
                <CartesianGrid strokeDasharray="4 4" stroke="#D4C9B8" opacity={0.25} vertical={false} />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#8A7E6E', fontFamily: 'Inter, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#8A7E6E', fontFamily: 'Inter, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}`}
                />

                {/* vertical guideline following cursor */}
                <Tooltip
                  content={<ImpactTooltip />}
                  cursor={{
                    stroke: '#2D6A4F',
                    strokeWidth: 1.5,
                    strokeDasharray: '5 5',
                    opacity: 0.4,
                  }}
                />

                {/* gradient area under the primary (donations) line */}
                {visibleKeys.has(primaryMetric.key) && (
                  <Area
                    type="monotone"
                    dataKey={`${primaryMetric.key}_norm`}
                    stroke="none"
                    fill="url(#donationAreaGradient)"
                    animationDuration={2000}
                    animationBegin={200}
                    isAnimationActive
                  />
                )}

                {/* animated curved lines for each visible metric */}
                {visibleMetrics.map((metric, i) => (
                  <Line
                    key={metric.key}
                    type="monotone"
                    dataKey={`${metric.key}_norm`}
                    stroke={metric.color}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{
                      r: 7,
                      strokeWidth: 2.5,
                      stroke: '#fff',
                      fill: metric.color,
                      style: { filter: `url(#glow-${metric.key})` },
                    }}
                    animationDuration={2200}
                    animationBegin={i * 300}
                    isAnimationActive
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
            <span className="absolute top-0 right-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft/40 dark:text-cream/30">
              Impact Index
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== Four premium KPI cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
        {metrics.map((c, i) => {
          const Icon = c.icon;
          const sparkData = c.values.slice(-8);
          const isPositive = c.growth >= 0;
          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="relative rounded-[24px] bg-white/70 dark:bg-secondary-900/60 backdrop-blur-xl border border-linen/50 dark:border-secondary-700/50 p-6 overflow-hidden group transition-shadow hover:shadow-premium"
            >
              {/* colored glow blob */}
              <div
                className="absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-15 blur-2xl group-hover:opacity-30 transition-opacity duration-500"
                style={{ backgroundColor: c.color }}
              />
              <div className="relative flex items-start justify-between mb-5">
                <div
                  className="h-12 w-12 rounded-2xl-premium flex items-center justify-center shadow-lg text-white"
                  style={{ backgroundColor: c.color, boxShadow: `0 8px 24px ${c.glow}` }}
                >
                  <Icon className="h-5.5 w-5.5" strokeWidth={1.75} />
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isPositive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                      : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
                  }`}
                >
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isPositive ? '+' : ''}{c.growth}%
                </span>
              </div>
              <p className="font-stat text-2xl sm:text-3xl font-bold text-ink dark:text-cream tabular-nums">
                <AnimatedCounter value={c.total} suffix={c.unit} />
              </p>
              <p className="text-sm text-ink-soft dark:text-cream/60 mt-1.5 flex items-center gap-1.5">
                <span>{c.emoji}</span> {c.cardLabel}
              </p>
              <div className="mt-4 -mx-1">
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
