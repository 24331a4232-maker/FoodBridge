import { motion } from 'framer-motion';
import {
  Users, Package, Clock, CheckCircle2, Truck, Hotel, Building2, ScrollText,
  QrCode, Recycle, Heart, Star, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import { Sparkline } from './Sparkline';
import { AnimatedCounter } from '@/lib/animations';
import type { OverviewStat } from '@/lib/adminData';

const iconMap: Record<string, typeof Users> = {
  users: Users,
  package: Package,
  clock: Clock,
  check: CheckCircle2,
  truck: Truck,
  hotel: Hotel,
  building: Building2,
  scroll: ScrollText,
  qr: QrCode,
  recycle: Recycle,
  heart: Heart,
  star: Star,
};

const colorMap: Record<string, { bg: string; text: string; spark: string }> = {
  users: { bg: 'from-secondary-500 to-primary-500', text: 'text-secondary-600', spark: '#4F8060' },
  package: { bg: 'from-primary-500 to-primary-600', text: 'text-primary-600', spark: '#1B4332' },
  clock: { bg: 'from-amber-500 to-orange-500', text: 'text-amber-600', spark: '#F59E0B' },
  check: { bg: 'from-green-500 to-emerald-500', text: 'text-green-600', spark: '#10B981' },
  truck: { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-600', spark: '#3B82F6' },
  hotel: { bg: 'from-rose-500 to-pink-500', text: 'text-rose-600', spark: '#F43F5E' },
  building: { bg: 'from-teal-500 to-green-500', text: 'text-teal-600', spark: '#14B8A6' },
  scroll: { bg: 'from-indigo-500 to-blue-500', text: 'text-indigo-600', spark: '#6366F1' },
  qr: { bg: 'from-purple-500 to-violet-500', text: 'text-purple-600', spark: '#8B5CF6' },
  recycle: { bg: 'from-lime-500 to-green-500', text: 'text-lime-600', spark: '#84CC16' },
  heart: { bg: 'from-red-500 to-rose-500', text: 'text-red-600', spark: '#EF4444' },
  star: { bg: 'from-yellow-500 to-amber-500', text: 'text-yellow-600', spark: '#EAB308' },
};

export function StatCard({ stat, index }: { stat: OverviewStat; index: number }) {
  const Icon = iconMap[stat.icon] ?? Users;
  const colors = colorMap[stat.icon] ?? colorMap.users;
  const TrendIcon = stat.status === 'up' ? TrendingUp : stat.status === 'down' ? TrendingDown : Minus;
  const trendColor = stat.status === 'up' ? 'text-green-600' : stat.status === 'down' ? 'text-red-500' : 'text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="glass-card p-4 sm:p-5 group hover:shadow-premium-lg transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br ${colors.bg} text-white flex items-center justify-center shadow-lg shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1">
          <Sparkline data={stat.sparkline} color={colors.spark} width={60} height={24} className="hidden sm:block" />
        </div>
      </div>
      <p className="font-display text-xl sm:text-2xl font-bold tabular-nums">
        <AnimatedCounter value={stat.value} suffix={stat.suffix ?? ''} />
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{stat.label}</p>
      <div className="flex items-center gap-3 mt-2.5 text-[10px]">
        <span className={`flex items-center gap-0.5 font-semibold ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          {stat.todayIncrease > 0 ? `+${stat.todayIncrease}` : '0'} today
        </span>
        <span className="text-gray-400">W: {stat.weeklyTrend > 0 ? '+' : ''}{stat.weeklyTrend}%</span>
        <span className="text-gray-400">M: {stat.monthlyTrend > 0 ? '+' : ''}{stat.monthlyTrend}%</span>
      </div>
    </motion.div>
  );
}
