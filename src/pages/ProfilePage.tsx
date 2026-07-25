import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Award, Clock, Package, Settings, Edit3, Check, X, Medal, Star, TrendingUp, Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import type { Pickup } from '@/types';
import { fadeInUp, staggerContainer, AnimatedCounter } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { getLevel, getNextLevel, getLevelProgress, getEarnedAchievements, volunteerAchievements, donorAchievements, type AchievementTier } from '@/lib/achievements';

const allBadges = ['First Step', 'Hunger Hero', 'Green Guardian', 'Community Star', 'Fast Mover', 'Top Performer'];

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', city: '', bio: '' });

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name, phone: profile.phone ?? '', city: profile.city ?? '', bio: profile.bio ?? '' });
    }
    if (user) {
      supabase.from('pickups').select('*, donation:food_donations(*)').eq('volunteer_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
        setPickups((data as Pickup[]) ?? []);
      });
    }
  }, [user, profile]);

  const save = async () => {
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      phone: form.phone,
      city: form.city,
      bio: form.bio,
    }).eq('id', user?.id);
    if (error) { toast('Could not save changes', 'error'); return; }
    await refreshProfile();
    setEditing(false);
    toast('Profile updated!', 'success');
  };

  if (!profile) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
      </div>
    );
  }

  const points = profile.reward_points ?? 0;
  const currentLevel = getLevel(points);
  const nextLevel = getNextLevel(points);
  const levelProgress = getLevelProgress(points);
  const tier: AchievementTier = profile.role === 'donor' ? 'donor' : 'volunteer';
  const stats = { deliveries: profile.total_deliveries ?? 0, meals: (profile.total_deliveries ?? 0) * 5, donations: profile.role === 'donor' ? profile.total_deliveries ?? 0 : 0 };
  const earned = getEarnedAchievements(tier, stats);
  const earnedBadges = allBadges.slice(0, Math.min(profile.total_deliveries, allBadges.length));
  const completed = pickups.filter((p) => p.status === 'delivered');
  const achievementList = tier === 'donor' ? donorAchievements : volunteerAchievements;

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 blur-md opacity-50" />
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="relative h-24 w-24 rounded-full object-cover" />
              ) : (
                <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-display text-3xl font-bold">
                  {profile.full_name[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold">{profile.full_name}</h1>
              <p className="text-gray-500 flex items-center gap-1.5"><Mail className="h-4 w-4" /> {profile.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 capitalize">{profile.role}</span>
                {profile.is_verified && <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"><Check className="h-3 w-3" /> Verified</span>}
                {profile.organization && <span className="badge bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300">{profile.organization}</span>}
              </div>
            </div>
            <RippleButton onClick={() => setEditing(!editing)} variant="secondary">
              {editing ? <><X className="h-4 w-4" /> Cancel</> : <><Edit3 className="h-4 w-4" /> Edit Profile</>}
            </RippleButton>
          </div>
        </motion.div>

        {/* Level + Rank banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6 relative overflow-hidden">
          <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${currentLevel.gradient} opacity-20 blur-3xl`} />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${currentLevel.gradient} text-white flex items-center justify-center shadow-lg shrink-0`}>
              {(() => { const LevelIcon = currentLevel.icon; return <LevelIcon className="h-8 w-8" />; })()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Current Level</p>
              <h2 className="font-display text-xl font-bold">Level {currentLevel.level} — {currentLevel.name}</h2>
              <div className="mt-2 max-w-md mx-auto sm:mx-0">
                <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{points.toLocaleString()} pts</span><span>{nextLevel ? `${nextLevel.minPoints.toLocaleString()} to ${nextLevel.name}` : 'Max'}</span></div>
                <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${levelProgress}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} className={`h-full rounded-full bg-gradient-to-r ${currentLevel.gradient}`} />
                </div>
              </div>
            </div>
            <Link to="/achievements"><RippleButton variant="secondary"><Trophy className="h-4 w-4" /> View Achievements</RippleButton></Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Reward Points', value: profile.reward_points, icon: Award, color: 'from-yellow-500 to-amber-500' },
            { label: 'Deliveries', value: profile.total_deliveries, icon: Package, color: 'from-primary-500 to-primary-600' },
            { label: 'Volunteer Hours', value: Math.round(profile.total_hours), icon: Clock, color: 'from-blue-500 to-primary-500' },
            { label: 'Badges Earned', value: earnedBadges.length, icon: Medal, color: 'from-accent-500 to-red-500' },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeInUp} className="card p-5">
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-3 shadow-lg`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="font-display text-2xl font-bold"><AnimatedCounter value={s.value} /></p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Edit form or info */}
          <div className="lg:col-span-2">
            {editing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><Settings className="h-5 w-5" /> Edit Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name</label>
                    <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">City</label>
                    <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" placeholder="Bangalore" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Bio</label>
                    <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="input-field resize-none" placeholder="Tell us about yourself..." />
                  </div>
                  <RippleButton onClick={save} variant="primary"><Check className="h-4 w-4" /> Save Changes</RippleButton>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><User className="h-5 w-5 text-primary-500" /> Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</p>
                    <p className="font-medium mt-1">{profile.phone || 'Not set'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> City</p>
                    <p className="font-medium mt-1">{profile.city || 'Not set'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 sm:col-span-2">
                    <p className="text-xs text-gray-400">Bio</p>
                    <p className="font-medium mt-1">{profile.bio || 'No bio yet. Click Edit Profile to add one.'}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Donation History */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mt-6">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><Package className="h-5 w-5 text-accent-500" /> Donation History</h2>
              {completed.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No deliveries yet. Start volunteering to see your history here!</p>
              ) : (
                <div className="space-y-3">
                  {completed.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center">
                        <Package className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{p.donation?.food_name ?? 'Delivery'}</p>
                        <p className="text-xs text-gray-400">{p.donation?.organization} - {new Date(p.delivered_at ?? p.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">+{p.points_earned} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Achievements grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 h-fit">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Medal className="h-5 w-5 text-primary-500" /> Achievements ({earned.length}/{achievementList.length})</h3>
            <div className="grid grid-cols-2 gap-3">
              {achievementList.map((a) => {
                const isEarned = earned.some((e) => e.id === a.id);
                const AchIcon = a.icon;
                return (
                  <div key={a.id} className={`flex flex-col items-center text-center p-3 rounded-xl ${isEarned ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-gray-50 dark:bg-gray-800/30 opacity-50'}`}>
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${a.gradient} text-white flex items-center justify-center mb-2 ${isEarned ? '' : 'grayscale'}`}>
                      <AchIcon className="h-5 w-5" />
                    </div>
                    <p className="text-[10px] font-medium leading-tight">{a.label}</p>
                    {isEarned && <Check className="h-3 w-3 text-emerald-500 mt-1" />}
                  </div>
                );
              })}
            </div>
            <Link to="/achievements" className="block mt-4"><RippleButton variant="ghost" fullWidth className="text-xs">View All Achievements</RippleButton></Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
