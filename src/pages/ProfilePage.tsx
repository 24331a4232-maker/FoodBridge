import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Award, Clock, Package, Settings, Edit3, Check, X, Medal, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import type { Pickup } from '@/types';
import { fadeInUp, staggerContainer, AnimatedCounter } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';

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

  const earnedBadges = allBadges.slice(0, Math.min(profile.total_deliveries, allBadges.length));
  const completed = pickups.filter((p) => p.status === 'delivered');

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

          {/* Badges */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 h-fit">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Medal className="h-5 w-5 text-primary-500" /> Badges</h3>
            <div className="space-y-2">
              {allBadges.map((b, i) => {
                const earned = i < earnedBadges.length;
                return (
                  <div key={b} className={`flex items-center gap-3 p-3 rounded-xl ${earned ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-gray-50 dark:bg-gray-800/30 opacity-50'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${earned ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                      <Star className="h-4 w-4" />
                    </div>
                    <span className={`text-sm ${earned ? 'font-medium' : 'text-gray-400'}`}>{b}</span>
                    {earned && <Check className="h-4 w-4 text-primary-500 ml-auto" />}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
              <p className="text-xs text-gray-500 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Earn {profile.total_deliveries + 1 - earnedBadges.length} more deliveries to unlock the next badge!</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
