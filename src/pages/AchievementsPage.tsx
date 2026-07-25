import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Crown, Lock, Trophy, Medal, ArrowRight, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { SectionHeading, AnimatedCounter, fadeInUp, scaleIn, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { Confetti } from '@/components/Confetti';
import {
  volunteerAchievements,
  donorAchievements,
  getEarnedAchievements,
  getLevel,
  getNextLevel,
  getLevelProgress,
  levels,
  pointRules,
  monthlyChallenges,
  type Achievement,
  type AchievementTier,
} from '@/lib/achievements';
import type { Profile } from '@/types';

type LeaderboardEntry = {
  name: string;
  city: string;
  points: number;
  deliveries: number;
  meals: number;
  avatar: string;
  role: string;
  isMe?: boolean;
};

const fallbackVolunteers: LeaderboardEntry[] = [
  { name: 'Ananya Krishnan', city: 'Bangalore', points: 2840, deliveries: 96, meals: 480, avatar: 'A', role: 'volunteer' },
  { name: 'Rahul Verma', city: 'Mumbai', points: 2310, deliveries: 78, meals: 390, avatar: 'R', role: 'volunteer' },
  { name: 'Fatima Khan', city: 'Hyderabad', points: 1980, deliveries: 65, meals: 325, avatar: 'F', role: 'volunteer' },
  { name: 'Vikram Singh', city: 'Delhi', points: 1640, deliveries: 52, meals: 260, avatar: 'V', role: 'volunteer' },
  { name: 'Sneha Patel', city: 'Ahmedabad', points: 1320, deliveries: 41, meals: 205, avatar: 'S', role: 'volunteer' },
];

const fallbackHotels: LeaderboardEntry[] = [
  { name: 'Royal Grand Hotel', city: 'Mumbai', points: 4200, deliveries: 0, meals: 1200, avatar: 'R', role: 'donor' },
  { name: 'Taj Palace', city: 'Delhi', points: 3800, deliveries: 0, meals: 980, avatar: 'T', role: 'donor' },
  { name: 'The Leela', city: 'Bangalore', points: 3100, deliveries: 0, meals: 760, avatar: 'L', role: 'donor' },
  { name: 'ITC Royal Gardenia', city: 'Bangalore', points: 2600, deliveries: 0, meals: 640, avatar: 'I', role: 'donor' },
  { name: 'Hyatt Regency', city: 'Pune', points: 2100, deliveries: 0, meals: 520, avatar: 'H', role: 'donor' },
];

const fallbackNgos: LeaderboardEntry[] = [
  { name: 'Feeding India Foundation', city: 'Mumbai', points: 3600, deliveries: 0, meals: 1100, avatar: 'F', role: 'ngo' },
  { name: 'Hope Kitchen Trust', city: 'Chennai', points: 2900, deliveries: 0, meals: 850, avatar: 'H', role: 'ngo' },
  { name: 'Annapurna Seva', city: 'Kolkata', points: 2400, deliveries: 0, meals: 720, avatar: 'A', role: 'ngo' },
  { name: 'Smile Together NGO', city: 'Pune', points: 1900, deliveries: 0, meals: 560, avatar: 'S', role: 'ngo' },
  { name: 'Green Plate Initiative', city: 'Hyderabad', points: 1500, deliveries: 0, meals: 430, avatar: 'G', role: 'ngo' },
];

const fallbackEvents: LeaderboardEntry[] = [
  { name: 'Celebration Events', city: 'Bangalore', points: 2800, deliveries: 0, meals: 820, avatar: 'C', role: 'donor' },
  { name: 'Wedding Palace Banquet', city: 'Delhi', points: 2300, deliveries: 0, meals: 690, avatar: 'W', role: 'donor' },
  { name: 'Paradise Catering', city: 'Hyderabad', points: 1800, deliveries: 0, meals: 540, avatar: 'P', role: 'donor' },
  { name: 'Royal Feast Caterers', city: 'Chennai', points: 1400, deliveries: 0, meals: 410, avatar: 'R', role: 'donor' },
  { name: 'Sunrise Event Co.', city: 'Pune', points: 1100, deliveries: 0, meals: 320, avatar: 'S', role: 'donor' },
];

const tabs = [
  { id: 'volunteers', label: 'Top Volunteers', data: fallbackVolunteers },
  { id: 'hotels', label: 'Top Hotels', data: fallbackHotels },
  { id: 'ngos', label: 'Top NGOs', data: fallbackNgos },
  { id: 'events', label: 'Top Event Organizers', data: fallbackEvents },
];

function AchievementCard({ a, earned, index }: { a: Achievement; earned: boolean; index: number }) {
  const Icon = a.icon;
  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: -8, rotateY: 8, rotateX: 8 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      className={`relative group rounded-[20px] p-[1.5px] overflow-hidden ${
        earned
          ? `bg-gradient-to-br ${a.gradient}`
          : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <div className="relative rounded-[19px] p-5 h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        {earned && (
          <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${a.gradient} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />
        )}
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
            className={`relative h-16 w-16 rounded-2xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-white shadow-lg ${a.glow} ${
              earned ? '' : 'opacity-40 grayscale'
            } group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-8 w-8" />
            {earned ? (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                <Check className="h-3 w-3" />
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gray-400 text-white flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                <Lock className="h-2.5 w-2.5" />
              </span>
            )}
          </motion.div>
          <p className="font-display font-bold text-sm mt-3">{a.label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{a.description}</p>
          <span className={`text-[10px] mt-2 px-2 py-0.5 rounded-full ${earned ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
            {earned ? 'Unlocked' : `${a.threshold} ${a.metric}`}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function LeaderboardCard({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const medal = rank === 1 ? { bg: 'bg-gradient-to-br from-yellow-400 to-amber-500', ring: 'ring-yellow-300', label: 'Gold' } : rank === 2 ? { bg: 'bg-gradient-to-br from-slate-300 to-slate-400', ring: 'ring-slate-200', label: 'Silver' } : rank === 3 ? { bg: 'bg-gradient-to-br from-amber-600 to-orange-700', ring: 'ring-amber-400', label: 'Bronze' } : { bg: 'bg-gray-100 dark:bg-gray-800', ring: 'ring-gray-200 dark:ring-gray-700', label: '' };
  const isPodium = rank <= 3;
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4 }}
      className={`relative rounded-[20px] p-5 flex items-center gap-4 ${
        isPodium ? 'glass-card' : 'card'
      } ${entry.isMe ? 'ring-2 ring-primary-400' : ''}`}
    >
      <div className={`flex-shrink-0 h-12 w-12 rounded-2xl ${medal.bg} text-white flex items-center justify-center font-display font-bold text-lg shadow-lg ring-4 ${medal.ring}`}>
        {rank <= 3 ? <Medal className="h-6 w-6" /> : rank}
      </div>
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
        {entry.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-display font-bold truncate">{entry.name}</p>
          {rank === 1 && <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
        </div>
        <p className="text-xs text-gray-500">{entry.city}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-display font-bold text-lg gradient-text">
          <AnimatedCounter value={entry.points} />
        </p>
        <p className="text-[10px] text-gray-400">{entry.deliveries > 0 ? `${entry.deliveries} deliveries` : `${entry.meals} meals`}</p>
      </div>
    </motion.div>
  );
}

export function AchievementsPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('volunteers');
  const [volunteerStats, setVolunteerStats] = useState({ deliveries: 0, meals: 0, donations: 0 });
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({
    volunteers: fallbackVolunteers,
    hotels: fallbackHotels,
    ngos: fallbackNgos,
    events: fallbackEvents,
  });
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('full_name, city, reward_points, total_deliveries, role, organization')
        .order('reward_points', { ascending: false })
        .limit(30);

      if (profiles && profiles.length > 0) {
        const byRole = (role: string) =>
          (profiles as Pick<Profile, 'full_name' | 'city' | 'reward_points' | 'total_deliveries' | 'role' | 'organization'>[])
            .filter((p) => p.role === role)
            .map((p) => ({
              name: p.full_name || p.organization || 'Unknown',
              city: p.city ?? '',
              points: p.reward_points ?? 0,
              deliveries: p.total_deliveries ?? 0,
              meals: (p.total_deliveries ?? 0) * 5,
              avatar: (p.full_name?.[0] ?? 'U').toUpperCase(),
              role: p.role,
              isMe: p.full_name === profile?.full_name,
            }))
            .slice(0, 5);

        setLeaderboards((prev) => ({
          ...prev,
          volunteers: byRole('volunteer').length >= 3 ? byRole('volunteer') : prev.volunteers,
          ngos: byRole('ngo').length >= 3 ? byRole('ngo') : prev.ngos,
          hotels: byRole('donor').length >= 3 ? byRole('donor').filter((_, i) => i < 5) : prev.hotels,
          events: prev.events,
        }));
      }

      if (user && profile) {
        const stats = {
          deliveries: profile.total_deliveries ?? 0,
          meals: (profile.total_deliveries ?? 0) * 5,
          donations: profile.role === 'donor' ? profile.total_deliveries ?? 0 : 0,
        };
        setVolunteerStats(stats);
      }
    };
    load();
  }, [user, profile]);

  const points = profile?.reward_points ?? 0;
  const currentLevel = getLevel(points);
  const nextLevel = getNextLevel(points);
  const levelProgress = getLevelProgress(points);
  const tier: AchievementTier = profile?.role === 'donor' ? 'donor' : 'volunteer';
  const earned = getEarnedAchievements(tier, volunteerStats);
  const earnedIds = new Set(earned.map((a) => a.id));
  const achievementList = tier === 'donor' ? donorAchievements : volunteerAchievements;

  const claimChallenge = (title: string) => {
    setConfetti(true);
    toast(`Challenge "${title}" completed! +200 points earned.`, 'success');
    setTimeout(() => setConfetti(false), 100);
  };

  const currentBoard = leaderboards[activeTab];
  const CurrentLevelIcon = currentLevel.icon;

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <Confetti trigger={confetti} />
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionHeading badge="Rewards & Recognition" title="Community Impact & Achievements" subtitle="Recognizing every volunteer, donor, hotel, and NGO making a difference." />

        {/* Level + Points */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12"
        >
          {/* Level card */}
          <motion.div variants={fadeInUp} className="lg:col-span-2 glass-card p-6 sm:p-8 relative overflow-hidden">
            <div className={`absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br ${currentLevel.gradient} opacity-20 blur-3xl`} />
            <div className="relative flex items-center gap-4 mb-6">
              <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${currentLevel.gradient} text-white flex items-center justify-center shadow-lg`}>
                <CurrentLevelIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Current Level</p>
                <h3 className="font-display text-2xl font-bold">Level {currentLevel.level} — {currentLevel.name}</h3>
              </div>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">{points.toLocaleString()} pts</span>
                <span className="text-gray-500">{nextLevel ? `${nextLevel.minPoints.toLocaleString()} pts to ${nextLevel.name}` : 'Max level reached'}</span>
              </div>
              <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${levelProgress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${currentLevel.gradient}`}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-right">{levelProgress}% to next level</p>
            </div>
            <div className="relative grid grid-cols-3 sm:grid-cols-6 gap-2 mt-6">
              {levels.map((l) => {
                const reached = points >= l.minPoints;
                const LevelIcon = l.icon;
                return (
                  <div key={l.level} className={`text-center p-2 rounded-xl ${reached ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-gray-50 dark:bg-gray-800/30 opacity-50'}`}>
                    <LevelIcon className={`h-5 w-5 mx-auto ${reached ? 'text-primary-600' : 'text-gray-400'}`} />
                    <p className="text-[10px] mt-1 font-medium">L{l.level}</p>
                    <p className="text-[9px] text-gray-400 truncate">{l.name}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Points breakdown */}
          <motion.div variants={fadeInUp} className="glass-card p-6">
            <h3 className="font-display font-bold mb-4 flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-500" /> Points System</h3>
            <div className="space-y-3">
              {pointRules.map((r) => {
                const RuleIcon = r.icon;
                return (
                  <div key={r.action} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <RuleIcon className={`h-5 w-5 ${r.color}`} />
                    <span className="text-sm flex-1">{r.action}</span>
                    <span className="font-bold text-sm text-primary-600">+{r.points}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* Achievements */}
        <div className="mt-16">
          <motion.h3 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display text-2xl font-bold mb-2">
            {tier === 'donor' ? 'Donor Achievements' : 'Volunteer Achievements'}
          </motion.h3>
          <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-gray-500 mb-8">
            {earned.length} of {achievementList.length} badges unlocked. Keep going to earn them all!
          </motion.p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {achievementList.map((a, i) => (
              <AchievementCard key={a.id} a={a} earned={earnedIds.has(a.id)} index={i} />
            ))}
          </motion.div>
        </div>

        {/* Monthly Challenges */}
        <div className="mt-16">
          <motion.h3 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display text-2xl font-bold mb-8 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-orange-500" /> Monthly Challenges
          </motion.h3>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {monthlyChallenges.map((c) => {
              const value = c.id === 'deliveries' ? volunteerStats.deliveries : c.id === 'meals' ? volunteerStats.meals : Math.round((profile?.total_hours ?? 0));
              const progress = Math.min(100, Math.round((value / c.goal) * 100));
              const complete = progress >= 100;
              const ChallengeIcon = c.icon;
              return (
                <motion.div key={c.id} variants={fadeInUp} whileHover={{ y: -6 }} className="glass-card p-6">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${c.gradient} text-white flex items-center justify-center mb-4 shadow-lg`}>
                    <ChallengeIcon className="h-6 w-6" />
                  </div>
                  <p className="font-display font-bold">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-1">Reward: +{c.reward} points</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                      <span>{value} / {c.goal} {c.unit}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${progress}%` }} viewport={{ once: true }} transition={{ duration: 1 }} className={`h-full rounded-full bg-gradient-to-r ${c.gradient}`} />
                    </div>
                  </div>
                  <RippleButton onClick={() => claimChallenge(c.title)} variant={complete ? 'primary' : 'ghost'} fullWidth className="mt-4 text-sm" disabled={!complete}>
                    {complete ? 'Claim Reward' : `${100 - progress}% to go`}
                  </RippleButton>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Leaderboard */}
        <div className="mt-16">
          <motion.h3 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display text-2xl font-bold mb-2">
            Top Contributors
          </motion.h3>
          <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-gray-500 mb-6">
            The leaders driving FoodBridge's mission forward.
          </motion.p>

          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={isActive
                    ? 'px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-primary-600 to-green-600 text-white shadow-lg'
                    : 'px-4 py-2 rounded-full text-sm font-medium glass text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <motion.div
            key={activeTab}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {currentBoard.map((entry, i) => (
              <LeaderboardCard key={entry.name + i} entry={entry} rank={i + 1} />
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-600 via-green-600 to-green-700 p-8 sm:p-12 text-center text-white"
        >
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-orange-400/20 blur-3xl" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 relative z-10">Climb the Leaderboard</h2>
          <p className="text-white/90 max-w-lg mx-auto mb-8 relative z-10">Every delivery earns points, unlocks badges, and moves you up the ranks.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link to="/volunteer"><RippleButton className="bg-white text-green-700 hover:bg-gray-50">Go to Dashboard <ArrowRight className="h-4 w-4" /></RippleButton></Link>
            <Link to="/profile"><RippleButton variant="ghost" className="text-white hover:bg-white/10">View Profile</RippleButton></Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
