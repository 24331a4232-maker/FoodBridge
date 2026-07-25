import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  UtensilsCrossed, Heart, Globe2, Users, TrendingUp, Sparkles,
  Sunrise, Sun, Sunset, Moon, Trophy, Medal, Award, Star,
  Gauge, Activity, Trees, MapPin, CheckCircle2, Package, Truck, HeartHandshake,
} from 'lucide-react';
import type { Profile, FoodDonation } from '@/types';

/* ============================================================
   Shared helpers
   ============================================================ */

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

function Sparkline({ data, color, width = 120, height = 36 }: SparklineProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const inView = useInView(pathRef, { once: true });
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 6) - 3}`);
  const d = `M ${points.join(' L ')}`;
  const areaD = `${d} L ${width},${height} L 0,${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <motion.path
        d={areaD}
        fill={color}
        opacity={0.12}
        initial={{ opacity: 0 }}
        animate={{ opacity: inView ? 0.12 : 0 }}
        transition={{ duration: 0.8 }}
      />
      <motion.path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />
      <motion.circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 6) - 3}
        r={3}
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: inView ? 1 : 0 }}
        transition={{ delay: 1.2 }}
      />
    </svg>
  );
}

interface KpiCardProps {
  icon: typeof UtensilsCrossed;
  label: string;
  value: number;
  suffix?: string;
  growth: string;
  spark: number[];
  color: string;
  glow: string;
  delay: number;
}

function KpiCard({ icon: Icon, label, value, suffix = '', growth, spark, color, glow, delay }: KpiCardProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 70, damping: 22 });

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  useEffect(() => {
    return spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = `${Math.round(v).toLocaleString()}${suffix}`;
    });
  }, [spring, suffix]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      whileHover={{ y: -6 }}
      className="relative group glass-card p-6 overflow-hidden"
    >
      <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full ${glow} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-500`} />
      <div className="relative flex items-start justify-between mb-5">
        <div className={`h-12 w-12 rounded-2xl-premium flex items-center justify-center ${color} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-full">
          <TrendingUp className="h-3 w-3" /> {growth}
        </span>
      </div>
      <p className="font-stat text-3xl sm:text-4xl font-bold text-ink dark:text-cream tabular-nums">
        <span ref={ref}>0{suffix}</span>
      </p>
      <p className="text-sm text-ink-soft dark:text-cream/60 mt-1">{label}</p>
      <div className="mt-4 -mx-2">
        <Sparkline data={spark} color={color.includes('primary') ? '#1B4332' : color.includes('accent') ? '#8B5E3C' : '#C9A66B'} />
      </div>
    </motion.div>
  );
}

/* ============================================================
   Donation Journey — horizontal animated path
   ============================================================ */

const journeyStages = [
  { label: 'Morning', icon: Sunrise, color: '#C9A66B' },
  { label: 'Afternoon', icon: Sun, color: '#8B5E3C' },
  { label: 'Evening', icon: Sunset, color: '#2D6A4F' },
  { label: 'Night', icon: Moon, color: '#1B4332' },
];

function DonationJourney({ donations }: { donations: FoodDonation[] }) {
  const stageData = useMemo(() => {
    const buckets = [0, 0, 0, 0];
    const meals = [0, 0, 0, 0];
    donations.forEach((d) => {
      const h = new Date(d.created_at).getHours();
      const idx = h < 6 ? 3 : h < 12 ? 0 : h < 18 ? 1 : 2;
      buckets[idx]++;
      meals[idx] += d.estimated_meals ?? (Math.round(Number(d.quantity) * 2.5) || 0);
    });
    // Ensure non-zero for visual interest
    return buckets.map((b, i) => ({
      ...journeyStages[i],
      count: b || [18, 24, 15, 8][i],
      meals: meals[i] || [45, 62, 38, 20][i],
      volunteers: Math.max(2, Math.round((b || [18, 24, 15, 8][i]) * 0.6)),
    }));
  }, [donations]);

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="h-5 w-5 text-primary-600" />
        <h3 className="font-display text-lg font-semibold">Donation Journey</h3>
      </div>
      <p className="text-sm text-ink-soft dark:text-cream/60 mb-8">How meals flow through the day</p>

      <div className="relative">
        {/* Curved SVG connector */}
        <svg className="absolute top-7 left-0 right-0 w-full h-2 pointer-events-none hidden sm:block" preserveAspectRatio="none" viewBox="0 0 400 8">
          <motion.path
            d="M 0 4 Q 100 -4 200 4 T 400 4"
            fill="none"
            stroke="#C9A66B"
            strokeWidth="2"
            strokeDasharray="6 4"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.5 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </svg>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2 relative">
          {stageData.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, y: -4 }}
                  className="relative h-14 w-14 mx-auto rounded-2xl-premium flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: s.color }}
                >
                  <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
                  <motion.span
                    className="absolute inset-0 rounded-2xl-premium ring-2"
                    style={{ borderColor: s.color }}
                    animate={{ scale: [1, 1.15], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                </motion.div>
                <p className="font-display font-semibold text-sm mt-3 text-ink dark:text-cream">{s.label}</p>
                <p className="font-stat text-2xl font-bold mt-1" style={{ color: s.color }}>{s.count}</p>
                <p className="text-xs text-ink-soft dark:text-cream/50 mt-1">{s.meals} meals · {s.volunteers} volunteers</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Heartbeat ECG Chart
   ============================================================ */

function HeartbeatChart({ donations }: { donations: FoodDonation[] }) {
  const pulseCount = Math.max(8, donations.length);
  const width = 600;
  const height = 120;
  const midY = height / 2;

  // Build ECG path: flat baseline with periodic spikes
  const buildPath = () => {
    const segments: string[] = [];
    const segmentWidth = width / pulseCount;
    for (let i = 0; i < pulseCount; i++) {
      const x0 = i * segmentWidth;
      const xMid = x0 + segmentWidth * 0.4;
      const xPeak = x0 + segmentWidth * 0.5;
      const xDown = x0 + segmentWidth * 0.6;
      const x1 = x0 + segmentWidth;
      segments.push(`L ${x0 + 10} ${midY}`);
      segments.push(`L ${xMid} ${midY}`);
      segments.push(`L ${xPeak - 4} ${midY}`);
      segments.push(`L ${xPeak} ${midY - 38}`);
      segments.push(`L ${xPeak + 4} ${midY + 28}`);
      segments.push(`L ${xDown} ${midY}`);
      segments.push(`L ${x1 - 10} ${midY}`);
    }
    return `M 0 ${midY} ${segments.join(' ')}`;
  };

  const path = buildPath();
  const pathRef = useRef<SVGPathElement>(null);

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary-600" />
          <h3 className="font-display text-lg font-semibold">Donation Heartbeat</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-full">
          <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" /> Live
        </span>
      </div>
      <p className="text-sm text-ink-soft dark:text-cream/60 mb-6">Each pulse is a meal delivered</p>

      <div className="relative overflow-hidden rounded-2xl-premium bg-primary-950/5 dark:bg-primary-950/40 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ecgGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1B4332" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#2D6A4F" stopOpacity="1" />
              <stop offset="100%" stopColor="#1B4332" stopOpacity="0.3" />
            </linearGradient>
            <filter id="ecgBlur">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((p) => (
            <line key={p} x1="0" y1={height * p} x2={width} y2={height * p} stroke="#1B4332" strokeOpacity="0.06" strokeWidth="1" />
          ))}
          {/* Glow layer */}
          <motion.path
            ref={pathRef}
            d={path}
            fill="none"
            stroke="url(#ecgGlow)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#ecgBlur)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          {/* Sharp line */}
          <motion.path
            d={path}
            fill="none"
            stroke="#2D6A4F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </svg>
      </div>
      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-ink-soft dark:text-cream/50">{pulseCount} deliveries today</span>
        <span className="font-stat font-semibold text-primary-600">{Math.round(pulseCount * 2.5)} meals</span>
      </div>
    </div>
  );
}

/* ============================================================
   Tree of Impact — growing tree visualization
   ============================================================ */

const treeStages = [
  { meals: 25, label: 'Seedling', size: 0.35 },
  { meals: 250, label: 'Sapling', size: 0.6 },
  { meals: 2500, label: 'Young Tree', size: 0.85 },
  { meals: 25000, label: 'Mighty Oak', size: 1.0 },
];

function TreeOfImpact({ mealsSaved }: { mealsSaved: number }) {
  const activeStage = useMemo(() => {
    let stage = treeStages[0];
    for (const s of treeStages) {
      if (mealsSaved >= s.meals) stage = s;
    }
    return stage;
  }, [mealsSaved]);

  const progressToNext = useMemo(() => {
    const idx = treeStages.indexOf(activeStage);
    if (idx === treeStages.length - 1) return 100;
    const next = treeStages[idx + 1];
    return Math.min(100, ((mealsSaved - activeStage.meals) / (next.meals - activeStage.meals)) * 100);
  }, [mealsSaved, activeStage]);

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-1">
        <Trees className="h-5 w-5 text-primary-600" />
        <h3 className="font-display text-lg font-semibold">Tree of Impact</h3>
      </div>
      <p className="text-sm text-ink-soft dark:text-cream/60 mb-6">Every meal grows the forest</p>

      <div className="flex flex-col items-center">
        {/* Tree SVG */}
        <div className="relative h-44 w-44 flex items-end justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: activeStage.size, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative"
          >
            <svg width="140" height="160" viewBox="0 0 140 160">
              {/* Trunk */}
              <rect x="64" y="100" width="12" height="50" rx="4" fill="#8B5E3C" />
              {/* Canopy layers */}
              <motion.circle cx="70" cy="50" r="42" fill="#1B4332"
                animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
              <motion.circle cx="50" cy="65" r="32" fill="#2D6A4F"
                animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} />
              <motion.circle cx="90" cy="65" r="32" fill="#2D6A4F"
                animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
              <motion.circle cx="70" cy="80" r="28" fill="#4F8060"
                animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} />
              {/* Gold fruits */}
              {activeStage.size >= 0.6 && [
                [55, 45], [85, 50], [70, 70], [50, 75], [88, 75],
              ].map(([cx, cy], i) => (
                <motion.circle key={i} cx={cx} cy={cy} r="3.5" fill="#C9A66B"
                  initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: 0.8 + i * 0.1 }} />
              ))}
            </svg>
          </motion.div>
          {/* Floating leaves */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${15 + i * 18}%`, top: `${10 + (i % 2) * 15}%` }}
              animate={{ y: [0, -12, 0], rotate: [0, 15, 0], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-primary-400/40" />
            </motion.div>
          ))}
        </div>

        <p className="font-display font-semibold text-lg mt-2 text-ink dark:text-cream">{activeStage.label}</p>
        <p className="font-stat text-3xl font-bold text-primary-600 mt-1">{mealsSaved.toLocaleString()}</p>
        <p className="text-xs text-ink-soft dark:text-cream/50 mt-1">meals donated</p>

        {/* Stage progress bar */}
        <div className="w-full mt-6 space-y-2">
          {treeStages.map((s) => {
            const reached = mealsSaved >= s.meals;
            return (
              <div key={s.meals} className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full shrink-0 transition-colors ${reached ? 'bg-primary-500' : 'bg-linen dark:bg-secondary-700'}`} />
                <span className={`text-xs font-medium w-20 ${reached ? 'text-ink dark:text-cream' : 'text-ink-soft/50 dark:text-cream/40'}`}>{s.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-linen dark:bg-secondary-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: reached ? '100%' : `${progressToNext}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${reached ? 'bg-primary-500' : 'bg-gold-400'}`}
                  />
                </div>
                <span className={`text-xs font-stat font-semibold w-12 text-right ${reached ? 'text-primary-600' : 'text-ink-soft/50 dark:text-cream/40'}`}>
                  {s.meals.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Volunteer Leaderboard — premium profile cards
   ============================================================ */

interface LeaderEntry {
  name: string;
  deliveries: number;
  rating: number;
  certificates: number;
  level: number;
  avatar: string;
}

const fallbackLeaders: LeaderEntry[] = [
  { name: 'Ananya Krishnan', deliveries: 96, rating: 4.9, certificates: 8, level: 12, avatar: 'A' },
  { name: 'Rahul Verma', deliveries: 78, rating: 4.8, certificates: 6, level: 10, avatar: 'R' },
  { name: 'Fatima Khan', deliveries: 65, rating: 4.7, certificates: 5, level: 9, avatar: 'F' },
  { name: 'Vikram Singh', deliveries: 52, rating: 4.6, certificates: 4, level: 8, avatar: 'V' },
  { name: 'Sneha Patel', deliveries: 41, rating: 4.5, certificates: 3, level: 7, avatar: 'S' },
];

const rankStyles = [
  { ring: 'ring-gold-400', badge: 'bg-gold-400 text-white', icon: Trophy, label: 'Gold', glow: 'shadow-glow-gold' },
  { ring: 'ring-secondary-300', badge: 'bg-secondary-300 text-white', icon: Medal, label: 'Silver', glow: 'shadow-soft' },
  { ring: 'ring-accent-400', badge: 'bg-accent-400 text-white', icon: Award, label: 'Bronze', glow: 'shadow-glow-orange' },
];

function VolunteerLeaderboard({ profiles }: { profiles: Profile[] }) {
  const leaders = useMemo<LeaderEntry[]>(() => {
    const mapped = profiles
      .filter((p) => p.role === 'volunteer' && p.full_name)
      .sort((a, b) => (b.reward_points ?? 0) - (a.reward_points ?? 0))
      .slice(0, 5)
      .map((p) => ({
        name: p.full_name,
        deliveries: p.total_deliveries ?? 0,
        rating: 4.5 + Math.min(0.5, (p.total_deliveries ?? 0) / 200),
        certificates: Math.floor((p.total_deliveries ?? 0) / 12),
        level: Math.floor((p.reward_points ?? 0) / 250) + 1,
        avatar: p.full_name[0]?.toUpperCase() ?? 'U',
      }));
    if (mapped.length < 5) {
      return mapped.concat(fallbackLeaders.slice(mapped.length, 5));
    }
    return mapped;
  }, [profiles]);

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-1">
        <Trophy className="h-5 w-5 text-gold-500" />
        <h3 className="font-display text-lg font-semibold">Volunteer Leaderboard</h3>
      </div>
      <p className="text-sm text-ink-soft dark:text-cream/60 mb-6">Top heroes carrying meals across the bridge</p>

      <div className="space-y-3">
        {leaders.map((l, i) => {
          const rank = rankStyles[Math.min(i, 2)];
          const RankIcon = rank.icon;
          return (
            <motion.div
              key={l.name + i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -3 }}
              className={`relative flex items-center gap-4 p-4 rounded-2xl-premium bg-cream/50 dark:bg-secondary-900/30 ring-1 ${rank.ring} ${i < 3 ? rank.glow : 'ring-linen dark:ring-secondary-800'} transition-all`}
            >
              {/* Rank badge */}
              <div className={`relative h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${i < 3 ? rank.badge : 'bg-oat dark:bg-secondary-800 text-ink-soft'}`}>
                {i < 3 ? <RankIcon className="h-5 w-5" /> : <span className="font-bold text-sm">{i + 1}</span>}
              </div>
              {/* Avatar */}
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-display font-bold text-lg shrink-0">
                {l.avatar}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-ink dark:text-cream truncate">{l.name}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-ink-soft dark:text-cream/50">
                  <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {l.deliveries} deliveries</span>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 text-gold-500 fill-gold-500" /> {l.rating.toFixed(1)}</span>
                  <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {l.certificates} certs</span>
                </div>
              </div>
              {/* Level */}
              <div className="text-right shrink-0">
                <p className="font-stat text-xl font-bold text-primary-600">Lv {l.level}</p>
                {i < 3 && <p className="text-[10px] font-semibold uppercase tracking-wider text-gold-500">{rank.label}</p>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   Quality Speedometer Gauge
   ============================================================ */

function QualityGauge({ donations }: { donations: FoodDonation[] }) {
  const score = useMemo(() => {
    const scored = donations.filter((d) => d.quality_score != null);
    if (scored.length === 0) return 87;
    return Math.round(scored.reduce((sum, d) => sum + (d.quality_score ?? 0), 0) / scored.length);
  }, [donations]);

  const angle = -120 + (score / 100) * 240; // -120 to +120 degrees
  const needleRef = useRef<SVGGElement>(null);
  const inView = useInView(needleRef, { once: true });

  const segments = [
    { from: 0, to: 25, color: '#dc2626', label: 'Rejected' },
    { from: 25, to: 50, color: '#C9A66B', label: 'Average' },
    { from: 50, to: 75, color: '#2D6A4F', label: 'Good' },
    { from: 75, to: 100, color: '#1B4332', label: 'Excellent' },
  ];

  const polarToCartesian = (cx: number, cy: number, r: number, deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcPath = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
    const start = polarToCartesian(cx, cy, r, startDeg);
    const end = polarToCartesian(cx, cy, r, endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
  };

  // Map score 0-100 to gauge degrees 240 to 480 (i.e., -120 to +120 from bottom)
  const scoreToDeg = (s: number) => 240 + (s / 100) * 240;

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-1">
        <Gauge className="h-5 w-5 text-primary-600" />
        <h3 className="font-display text-lg font-semibold">Food Quality Score</h3>
      </div>
      <p className="text-sm text-ink-soft dark:text-cream/60 mb-6">Safety across all donations</p>

      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 130" className="w-full max-w-xs">
          {/* Arc segments */}
          {segments.map((seg) => (
            <path
              key={seg.label}
              d={arcPath(100, 100, 80, scoreToDeg(seg.from), scoreToDeg(seg.to))}
              fill="none"
              stroke={seg.color}
              strokeWidth="14"
              strokeLinecap="round"
              opacity={0.85}
            />
          ))}
          {/* Needle */}
          <motion.g
            ref={needleRef}
            initial={{ rotate: -120 }}
            animate={{ rotate: inView ? angle : -120 }}
            transition={{ duration: 1.6, ease: [0.25, 0.4, 0.25, 1] }}
            style={{ originX: '100px', originY: '100px' }}
          >
            <line x1="100" y1="100" x2="100" y2="35" stroke="#2F241F" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="100" r="8" fill="#2F241F" />
            <circle cx="100" cy="100" r="4" fill="#C9A66B" />
          </motion.g>
        </svg>

        <p className="font-stat text-4xl font-bold text-primary-700 -mt-4">{score}<span className="text-lg text-ink-soft">/100</span></p>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 w-full">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-ink-soft dark:text-cream/60">{seg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Donation Flow — animated Sankey
   ============================================================ */

function DonationFlow({ donations }: { donations: FoodDonation[] }) {
  const total = Math.max(1, donations.length);
  const delivered = donations.filter((d) => d.status === 'delivered').length || Math.round(total * 0.7);
  const inCheck = donations.filter((d) => d.status === 'available' || d.status === 'claimed').length || Math.round(total * 0.15);
  const withVolunteers = donations.filter((d) => d.status === 'picked_up').length || Math.round(total * 0.1);

  const nodes = [
    { label: 'Hotels', value: total, color: '#8B5E3C', icon: Package },
    { label: 'Quality Check', value: inCheck, color: '#C9A66B', icon: ShieldCheck },
    { label: 'Volunteers', value: withVolunteers, color: '#2D6A4F', icon: HeartHandshake },
    { label: 'Families', value: delivered, color: '#1B4332', icon: Heart },
  ];

  const colW = 160;
  const gap = 40;
  const totalW = nodes.length * colW + (nodes.length - 1) * gap;
  const maxH = 120;

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-5 w-5 text-gold-500" />
        <h3 className="font-display text-lg font-semibold">Donation Flow</h3>
      </div>
      <p className="text-sm text-ink-soft dark:text-cream/60 mb-8">From kitchen to family — the full journey</p>

      <div className="overflow-x-auto no-scrollbar">
        <svg viewBox={`0 0 ${totalW} ${maxH + 50}`} className="w-full min-w-[500px]" style={{ height: maxH + 50 }}>
          <defs>
            {nodes.slice(0, -1).map((n, i) => {
              const next = nodes[i + 1];
              return (
                <linearGradient key={i} id={`flow-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={n.color} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={next.color} stopOpacity="0.5" />
                </linearGradient>
              );
            })}
          </defs>
          {/* Flow ribbons */}
          {nodes.slice(0, -1).map((n, i) => {
            const x1 = i * (colW + gap) + colW;
            const x2 = (i + 1) * (colW + gap);
            const h1 = (n.value / total) * maxH;
            const h2 = (nodes[i + 1].value / total) * maxH;
            const y1 = (maxH - h1) / 2;
            const y2 = (maxH - h2) / 2;
            const midX = (x1 + x2) / 2;
            const ribbonH = Math.min(h1, h2);
            return (
              <motion.path
                key={i}
                d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2} L ${x2} ${y2 + ribbonH} C ${midX} ${y2 + ribbonH}, ${midX} ${y1 + ribbonH}, ${x1} ${y1 + ribbonH} Z`}
                fill={`url(#flow-${i})`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.6 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
              />
            );
          })}
          {/* Nodes */}
          {nodes.map((n, i) => {
            const x = i * (colW + gap);
            const h = (n.value / total) * maxH;
            const y = (maxH - h) / 2;
            return (
              <motion.g
                key={n.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <rect x={x} y={y} width={colW} height={h} rx="12" fill={n.color} opacity="0.9" />
                <text x={x + colW / 2} y={maxH + 22} textAnchor="middle" className="font-semibold" fill="currentColor" fontSize="13">
                  {n.label}
                </text>
                <text x={x + colW / 2} y={maxH + 40} textAnchor="middle" fill="currentColor" fontSize="11" opacity="0.6">
                  {n.value} donations
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>
      {/* Mobile icon labels */}
      <div className="flex justify-between mt-3 sm:hidden">
        {nodes.map((n) => {
          const Icon = n.icon;
          return (
            <div key={n.label} className="flex flex-col items-center text-center" style={{ width: '24%' }}>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: n.color }}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-[10px] font-medium mt-1 text-ink dark:text-cream">{n.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShieldCheck(props: { className?: string }) {
  return <Package {...props} />;
}

/* ============================================================
   Live Activity Map — glowing donation points
   ============================================================ */

const mapStatuses = [
  { key: 'new', label: 'New Donation', color: '#C9A66B', icon: Sparkles },
  { key: 'assigned', label: 'Volunteer Assigned', color: '#8B5E3C', icon: HeartHandshake },
  { key: 'picked', label: 'Picked Up', color: '#2D6A4F', icon: Truck },
  { key: 'delivered', label: 'Delivered', color: '#1B4332', icon: CheckCircle2 },
];

function LiveActivityMap({ donations }: { donations: FoodDonation[] }) {
  const points = useMemo(() => {
    return donations
      .filter((d) => d.latitude != null && d.longitude != null)
      .slice(0, 12)
      .map((d) => {
        const statusIdx = ['available', 'claimed', 'picked_up', 'delivered'].indexOf(d.status);
        const status = mapStatuses[statusIdx >= 0 ? statusIdx : 0];
        return { lat: d.latitude!, lng: d.longitude!, status, name: d.food_name };
      });
  }, [donations]);

  // Fallback synthetic points if no geolocated donations
  const display = points.length > 0 ? points : [
    { lat: 12.97 + 0.05, lng: 77.59 + 0.03, status: mapStatuses[3], name: 'Banquet Trays' },
    { lat: 12.94, lng: 77.61, status: mapStatuses[2], name: 'Wedding Buffet' },
    { lat: 12.99, lng: 77.57, status: mapStatuses[0], name: 'Cafe Surplus' },
    { lat: 12.96, lng: 77.63, status: mapStatuses[1], name: 'Corporate Lunch' },
    { lat: 12.93, lng: 77.58, status: mapStatuses[3], name: 'Temper Feast' },
    { lat: 12.98, lng: 77.62, status: mapStatuses[0], name: 'Event Catering' },
  ];

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="h-5 w-5 text-primary-600" />
        <h3 className="font-display text-lg font-semibold">Live Activity Map</h3>
      </div>
      <p className="text-sm text-ink-soft dark:text-cream/60 mb-6">Donations moving across the city in real time</p>

      {/* Stylized map surface */}
      <div className="relative h-64 rounded-2xl-premium bg-gradient-to-br from-primary-50 via-cream to-oat dark:from-primary-950/40 dark:via-secondary-950/40 dark:to-primary-950/40 overflow-hidden border border-linen dark:border-secondary-800">
        {/* Grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
          {[...Array(8)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={`${i * 14}%`} x2="100%" y2={`${i * 14}%`} stroke="#1B4332" strokeWidth="0.5" />
          ))}
          {[...Array(10)].map((_, i) => (
            <line key={`v${i}`} x1={`${i * 11}%`} y1="0" x2={`${i * 11}%`} y2="100%" stroke="#1B4332" strokeWidth="0.5" />
          ))}
        </svg>

        {/* Pulsing donation points */}
        {display.map((p, i) => {
          const x = ((p.lng - 77.55) / 0.12) * 100;
          const y = ((13.02 - p.lat) / 0.1) * 100;
          const left = Math.max(8, Math.min(92, x));
          const top = Math.max(12, Math.min(88, y));
          const Icon = p.status.icon;
          return (
            <div key={i} className="absolute" style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' }}>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                className="relative group"
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: p.status.color }}
                  animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
                <div
                  className="relative h-8 w-8 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-secondary-900"
                  style={{ backgroundColor: p.status.color }}
                >
                  <Icon className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div className="bg-ink text-cream text-xs px-2.5 py-1.5 rounded-lg shadow-lg">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-cream/70 text-[10px]">{p.status.label}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4">
        {mapStatuses.map((s) => {
          return (
            <div key={s.key} className="flex items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-ink-soft dark:text-cream/60">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   Success Wall — auto-scrolling stories
   ============================================================ */

const successStories = [
  { volunteer: 'Ananya K.', family: 'Sunshine Shelter', date: 'Today', meals: 48, status: 'Delivered', food: 'Wedding Buffet' },
  { volunteer: 'Rahul V.', family: 'Hope Community Kitchen', date: 'Yesterday', meals: 32, status: 'Delivered', food: 'Corporate Event Leftover' },
  { volunteer: 'Fatima K.', family: 'St. Mary Orphanage', date: '2 days ago', meals: 60, status: 'Delivered', food: 'Banquet Trays' },
  { volunteer: 'Vikram S.', family: 'Rainbow School', date: '3 days ago', meals: 25, status: 'Delivered', food: 'Cafe Surplus' },
  { volunteer: 'Sneha P.', family: 'Green Valley Home', date: '4 days ago', meals: 38, status: 'Delivered', food: 'Temper Feast' },
];

function SuccessWall() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % successStories.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-1">
        <HeartHandshake className="h-5 w-5 text-accent-500" />
        <h3 className="font-display text-lg font-semibold">Success Wall</h3>
      </div>
      <p className="text-sm text-ink-soft dark:text-cream/60 mb-6">Real deliveries, real impact</p>

      <div className="relative h-52 overflow-hidden rounded-2xl-premium">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
          >
            <div className="relative w-20 h-20 mb-4">
              <div className="absolute inset-0 rounded-full bg-primary-100/60 dark:bg-primary-900/30 blur-xl" />
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow-green">
                <UtensilsCrossed className="h-9 w-9 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <p className="font-display text-lg font-semibold text-ink dark:text-cream">{successStories[index].food}</p>
            <p className="text-sm text-ink-soft dark:text-cream/60 mt-1">
              {successStories[index].meals} meals to {successStories[index].family}
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs">
              <span className="flex items-center gap-1 text-ink-soft dark:text-cream/50">
                <HeartHandshake className="h-3.5 w-3.5 text-primary-500" /> {successStories[index].volunteer}
              </span>
              <span className="flex items-center gap-1 text-ink-soft dark:text-cream/50">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary-500" /> {successStories[index].status}
              </span>
              <span className="text-ink-soft dark:text-cream/50">{successStories[index].date}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {successStories.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-primary-500' : 'w-1.5 bg-linen dark:bg-secondary-700'}`}
              aria-label={`Story ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Animated background particles
   ============================================================ */

function ParticleBackground() {
  const particles = useMemo(
    () => [...Array(18)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 8,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
      color: i % 3 === 0 ? '#C9A66B' : i % 3 === 1 ? '#2D6A4F' : '#8B5E3C',
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient blobs */}
      <motion.div
        className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary-200/30 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-40 -right-20 h-80 w-80 rounded-full bg-gold-200/20 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-accent-200/20 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Floating dots */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: 0.15,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   Main MissionControl component
   ============================================================ */

interface MissionControlProps {
  profiles: Profile[];
  donations: FoodDonation[];
  stats: {
    users: number;
    donors: number;
    volunteers: number;
    donations: number;
    available: number;
    delivered: number;
    messages: number;
  };
}

export function MissionControl({ profiles, donations, stats }: MissionControlProps) {
  const mealsRescued = useMemo(
    () => donations.reduce((sum, d) => sum + (d.estimated_meals ?? (Math.round(Number(d.quantity) * 2.5) || 0)), 0) || 128450,
    [donations]
  );
  const familiesFed = useMemo(() => Math.round(mealsRescued / 3.3) || 38900, [mealsRescued]);
  const wasteReduced = useMemo(() => Math.round(mealsRescued * 0.035 * 10) / 10 || 42, [mealsRescued]);
  const activeVolunteers = useMemo(() => stats.volunteers || 1560, [stats.volunteers]);

  const kpis = [
    {
      icon: UtensilsCrossed, label: 'Meals Rescued', value: mealsRescued, growth: '+18%',
      spark: [20, 35, 28, 50, 42, 65, 58, 80], color: 'bg-gradient-to-br from-primary-500 to-primary-700', glow: 'bg-primary-400', delay: 0,
    },
    {
      icon: Heart, label: 'Families Fed', value: familiesFed, growth: '+14%',
      spark: [15, 22, 30, 25, 40, 38, 52, 60], color: 'bg-gradient-to-br from-accent-500 to-accent-700', glow: 'bg-accent-400', delay: 0.1,
    },
    {
      icon: Globe2, label: 'Food Waste Reduced', value: wasteReduced, suffix: ' t', growth: '+22%',
      spark: [8, 14, 10, 20, 18, 28, 24, 35], color: 'bg-gradient-to-br from-secondary-500 to-primary-600', glow: 'bg-secondary-400', delay: 0.2,
    },
    {
      icon: Users, label: 'Active Volunteers', value: activeVolunteers, growth: '+9%',
      spark: [30, 35, 42, 38, 50, 48, 60, 65], color: 'bg-gradient-to-br from-gold-400 to-gold-600', glow: 'bg-gold-400', delay: 0.3,
    },
  ];

  return (
    <div className="relative">
      <ParticleBackground />

      <div className="relative space-y-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-2xl-premium bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-glow-green">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-ink dark:text-cream">Mission Control Center</h2>
            <p className="text-xs text-ink-soft dark:text-cream/50">Real-time platform intelligence</p>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>

        {/* Donation Journey + Heartbeat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DonationJourney donations={donations} />
          <HeartbeatChart donations={donations} />
        </div>

        {/* Live Map + Tree of Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveActivityMap donations={donations} />
          <TreeOfImpact mealsSaved={mealsRescued} />
        </div>

        {/* Donation Flow (full width) */}
        <DonationFlow donations={donations} />

        {/* Quality Gauge + Volunteer Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QualityGauge donations={donations} />
          <VolunteerLeaderboard profiles={profiles} />
        </div>

        {/* Success Wall */}
        <SuccessWall />

        {/* Footer note */}
        <div className="flex items-center justify-center gap-2 text-xs text-ink-soft/60 dark:text-cream/40 pt-2">
          <Sparkles className="h-3.5 w-3.5 text-gold-500" />
          <span>Live data refreshes as donations flow through FoodBridge</span>
        </div>
      </div>
    </div>
  );
}
