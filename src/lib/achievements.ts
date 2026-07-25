import {
  Package,
  Truck,
  UtensilsCrossed,
  Trophy,
  Globe2,
  HeartHandshake,
  Star,
  Crown,
  Hotel,
  Leaf,
  Sprout,
  type LucideIcon,
} from 'lucide-react';

export type AchievementTier = 'volunteer' | 'donor';

export interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  glow: string;
  tier: AchievementTier;
  threshold: number;
  metric: 'deliveries' | 'meals' | 'donations';
}

export const volunteerAchievements: Achievement[] = [
  { id: 'first-pickup', label: 'First Donation Pickup', description: 'Complete your first food pickup', icon: Package, gradient: 'from-amber-600 to-amber-700', glow: 'shadow-amber-600/40', tier: 'volunteer', threshold: 1, metric: 'deliveries' },
  { id: 'ten-deliveries', label: '10 Successful Deliveries', description: 'Complete 10 deliveries', icon: Truck, gradient: 'from-slate-400 to-slate-500', glow: 'shadow-slate-400/40', tier: 'volunteer', threshold: 10, metric: 'deliveries' },
  { id: 'fifty-meals', label: '50 Meals Delivered', description: 'Deliver 50 meals to families', icon: UtensilsCrossed, gradient: 'from-yellow-400 to-amber-500', glow: 'shadow-yellow-400/40', tier: 'volunteer', threshold: 50, metric: 'meals' },
  { id: 'hunger-hero', label: 'Hunger Hero', description: 'Complete 25 deliveries', icon: Trophy, gradient: 'from-emerald-500 to-green-600', glow: 'shadow-emerald-500/40', tier: 'volunteer', threshold: 25, metric: 'deliveries' },
  { id: 'green-champion', label: 'Green Champion', description: 'Save 100 meals from waste', icon: Globe2, gradient: 'from-teal-500 to-cyan-600', glow: 'shadow-teal-500/40', tier: 'volunteer', threshold: 100, metric: 'meals' },
  { id: 'community-helper', label: 'Community Helper', description: 'Complete 15 deliveries', icon: HeartHandshake, gradient: 'from-rose-500 to-pink-600', glow: 'shadow-rose-500/40', tier: 'volunteer', threshold: 15, metric: 'deliveries' },
  { id: 'food-saver', label: 'Food Saver', description: 'Save 25 meals from waste', icon: Star, gradient: 'from-orange-500 to-amber-500', glow: 'shadow-orange-500/40', tier: 'volunteer', threshold: 25, metric: 'meals' },
  { id: 'fb-legend', label: 'FoodBridge Legend', description: 'Complete 100 deliveries', icon: Crown, gradient: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/40', tier: 'volunteer', threshold: 100, metric: 'deliveries' },
];

export const donorAchievements: Achievement[] = [
  { id: 'first-donation', label: 'First Donation', description: 'Make your first food donation', icon: Package, gradient: 'from-amber-600 to-amber-700', glow: 'shadow-amber-600/40', tier: 'donor', threshold: 1, metric: 'donations' },
  { id: '100-meals-donated', label: '100 Meals Donated', description: 'Donate 100 meals total', icon: UtensilsCrossed, gradient: 'from-slate-400 to-slate-500', glow: 'shadow-slate-400/40', tier: 'donor', threshold: 100, metric: 'meals' },
  { id: '500-meals-donated', label: '500 Meals Donated', description: 'Donate 500 meals total', icon: Truck, gradient: 'from-yellow-400 to-amber-500', glow: 'shadow-yellow-400/40', tier: 'donor', threshold: 500, metric: 'meals' },
  { id: 'premium-partner', label: 'Premium Partner', description: 'Complete 10 donations', icon: Hotel, gradient: 'from-emerald-500 to-green-600', glow: 'shadow-emerald-500/40', tier: 'donor', threshold: 10, metric: 'donations' },
  { id: 'zero-waste', label: 'Zero Food Waste Partner', description: 'Donate 250 meals', icon: Leaf, gradient: 'from-teal-500 to-cyan-600', glow: 'shadow-teal-500/40', tier: 'donor', threshold: 250, metric: 'meals' },
  { id: 'sustainability', label: 'Sustainability Champion', description: 'Donate 1000 meals', icon: Sprout, gradient: 'from-lime-500 to-green-600', glow: 'shadow-lime-500/40', tier: 'donor', threshold: 1000, metric: 'meals' },
];

export const allAchievements = [...volunteerAchievements, ...donorAchievements];

export function getEarnedAchievements(
  tier: AchievementTier,
  stats: { deliveries: number; meals: number; donations: number },
): Achievement[] {
  const list = tier === 'volunteer' ? volunteerAchievements : donorAchievements;
  return list.filter((a) => {
    const value = stats[a.metric];
    return value >= a.threshold;
  });
}

export interface Level {
  level: number;
  name: string;
  minPoints: number;
  gradient: string;
  icon: LucideIcon;
}

export const levels: Level[] = [
  { level: 1, name: 'Volunteer', minPoints: 0, gradient: 'from-slate-400 to-slate-500', icon: Package },
  { level: 2, name: 'Food Saver', minPoints: 250, gradient: 'from-teal-500 to-cyan-600', icon: Leaf },
  { level: 3, name: 'Community Hero', minPoints: 750, gradient: 'from-emerald-500 to-green-600', icon: HeartHandshake },
  { level: 4, name: 'Hunger Fighter', minPoints: 1500, gradient: 'from-orange-500 to-amber-500', icon: Trophy },
  { level: 5, name: 'FoodBridge Champion', minPoints: 3000, gradient: 'from-rose-500 to-pink-600', icon: Star },
  { level: 6, name: 'Legend', minPoints: 6000, gradient: 'from-violet-500 to-purple-600', icon: Crown },
];

export function getLevel(points: number): Level {
  let current = levels[0];
  for (const l of levels) {
    if (points >= l.minPoints) current = l;
  }
  return current;
}

export function getNextLevel(points: number): Level | null {
  for (const l of levels) {
    if (points < l.minPoints) return l;
  }
  return null;
}

export function getLevelProgress(points: number): number {
  const current = getLevel(points);
  const next = getNextLevel(points);
  if (!next) return 100;
  const range = next.minPoints - current.minPoints;
  const into = points - current.minPoints;
  return Math.min(100, Math.round((into / range) * 100));
}

export interface PointRule {
  action: string;
  points: number;
  icon: LucideIcon;
  color: string;
}

export const pointRules: PointRule[] = [
  { action: 'Pickup Completed', points: 50, icon: Package, color: 'text-orange-500' },
  { action: 'Delivery Completed', points: 100, icon: Truck, color: 'text-emerald-500' },
  { action: 'Food Saved', points: 25, icon: Leaf, color: 'text-teal-500' },
  { action: 'Certificate Earned', points: 75, icon: Trophy, color: 'text-yellow-500' },
  { action: 'Monthly Challenge Winner', points: 200, icon: Crown, color: 'text-violet-500' },
];

export interface MonthlyChallenge {
  id: string;
  title: string;
  goal: number;
  unit: string;
  reward: number;
  icon: LucideIcon;
  gradient: string;
}

export const monthlyChallenges: MonthlyChallenge[] = [
  { id: 'deliveries', title: 'Complete 10 Deliveries', goal: 10, unit: 'deliveries', reward: 200, icon: Truck, gradient: 'from-emerald-500 to-green-600' },
  { id: 'meals', title: 'Save 500 Meals', goal: 500, unit: 'meals', reward: 200, icon: UtensilsCrossed, gradient: 'from-orange-500 to-amber-500' },
  { id: 'hours', title: 'Volunteer 20 Hours', goal: 20, unit: 'hours', reward: 200, icon: HeartHandshake, gradient: 'from-rose-500 to-pink-600' },
];
