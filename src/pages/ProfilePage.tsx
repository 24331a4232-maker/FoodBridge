import { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Award, Clock, Package, Settings, Edit3, Check, X,
  Medal, Trophy, Camera, ShieldCheck, Bell, Lock, Eye, Palette, Globe, Trash2,
  UtensilsCrossed, HeartHandshake, Hotel, Activity, KeyRound, Monitor, Sun, Moon,
  ChevronRight, FileText, Download, ExternalLink, Sparkles, LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationContext';
import { supabase } from '@/lib/supabase';
import type { Pickup, FoodDonation, Certificate, NotificationSettings, PrivacySettings, Preferences } from '@/types';
import { fadeInUp, staggerContainer, AnimatedCounter } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import {
  getLevel, getNextLevel, getLevelProgress, getEarnedAchievements,
  volunteerAchievements, donorAchievements, type AchievementTier,
} from '@/lib/achievements';

type Tab = 'profile' | 'account' | 'notifications' | 'privacy' | 'appearance' | 'language';

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'language', label: 'Language', icon: Globe },
];

const languages: { value: Preferences['language']; label: string; native: string }[] = [
  { value: 'en', label: 'English', native: 'English' },
  { value: 'te', label: 'Telugu', native: 'తెలుగు' },
  { value: 'hi', label: 'Hindi', native: 'हिन्दी' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md ${checked ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  );
}

function SectionCard({ icon: Icon, title, children, accent = 'primary' }: { icon: typeof User; title: string; children: ReactNode; accent?: string }) {
  return (
    <motion.div variants={fadeInUp} className="glass-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${accent === 'primary' ? 'from-primary-500 to-primary-600' : 'from-accent-500 to-orange-600'} text-white flex items-center justify-center shadow-md`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <h3 className="font-display text-lg font-bold">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

export function ProfilePage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { toast } = useToast();
  const { pushToast } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [editing, setEditing] = useState(false);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', bio: '',
  });
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    email: true, push: true, donations: true, certificates: true, volunteer: true, quality: true,
  });
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisible: true, locationOnPickup: true, hidePhone: false,
  });
  const [prefs, setPrefs] = useState<Preferences>({ theme: 'system', language: 'en' });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone ?? '',
        address: profile.address ?? '',
        city: profile.city ?? '',
        state: profile.state ?? '',
        pincode: profile.pincode ?? '',
        bio: profile.bio ?? '',
      });
      if (profile.notification_settings) setNotifSettings(profile.notification_settings);
      if (profile.privacy_settings) setPrivacySettings(profile.privacy_settings);
      if (profile.preferences) setPrefs(profile.preferences);
    }
    if (user) {
      supabase.from('pickups').select('*, donation:food_donations(*)').eq('volunteer_id', user.id)
        .order('created_at', { ascending: false }).then(({ data }) => setPickups((data as Pickup[]) ?? []));
      supabase.from('food_donations').select('*').eq('donor_id', user.id)
        .order('created_at', { ascending: false }).then(({ data }) => setDonations((data as FoodDonation[]) ?? []));
      supabase.from('certificates').select('*').eq('volunteer_id', user.id)
        .order('created_at', { ascending: false }).then(({ data }) => setCerts((data as Certificate[]) ?? []));
    }
  }, [user, profile]);

  const saveProfile = async () => {
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name, email: form.email, phone: form.phone,
      address: form.address, city: form.city, state: form.state, pincode: form.pincode, bio: form.bio,
    }).eq('id', user?.id);
    if (error) { toast('Could not save changes', 'error'); return; }
    await refreshProfile();
    setEditing(false);
    pushToast('Profile updated successfully', 'success');
  };

  const saveNotifSettings = async (next: NotificationSettings) => {
    setNotifSettings(next);
    await supabase.from('profiles').update({ notification_settings: next }).eq('id', user?.id);
    pushToast('Notification preferences saved', 'success');
  };

  const savePrivacySettings = async (next: PrivacySettings) => {
    setPrivacySettings(next);
    await supabase.from('profiles').update({ privacy_settings: next }).eq('id', user?.id);
    pushToast('Privacy settings saved', 'success');
  };

  const savePrefs = async (next: Preferences) => {
    setPrefs(next);
    await supabase.from('profiles').update({ preferences: next }).eq('id', user?.id);
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `avatars/${user.id}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      await supabase.from('profiles').update({ avatar_url: pub.publicUrl }).eq('id', user.id);
      await refreshProfile();
      pushToast('Profile photo updated', 'success');
    } catch {
      toast('Could not upload photo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const changePassword = async () => {
    if (pwForm.next !== pwForm.confirm) { toast('Passwords do not match', 'error'); return; }
    if (pwForm.next.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    if (error) { toast(error.message, 'error'); return; }
    setPwForm({ current: '', next: '', confirm: '' });
    pushToast('Password changed successfully', 'success');
  };

  const applyTheme = (t: Preferences['theme']) => {
    const next = { ...prefs, theme: t };
    savePrefs(next);
    if (t === 'light' && theme === 'dark') toggleTheme();
    if (t === 'dark' && theme === 'light') toggleTheme();
    pushToast('Theme updated', 'success');
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
  const mealsDelivered = (profile.total_deliveries ?? 0) * 5;
  const mealsDonated = donations.reduce((sum, d) => sum + (parseInt(d.quantity, 10) || 0), 0);
  const stats = { deliveries: profile.total_deliveries ?? 0, meals: mealsDelivered, donations: donations.length };
  const earned = getEarnedAchievements(tier, stats);
  const achievementList = tier === 'donor' ? donorAchievements : volunteerAchievements;
  const completed = pickups.filter((p) => p.status === 'delivered');
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });

  const activityStats = [
    { label: 'Meals Donated', value: mealsDonated, icon: UtensilsCrossed, gradient: 'from-emerald-500 to-green-600' },
    { label: 'Meals Delivered', value: mealsDelivered, icon: HeartHandshake, gradient: 'from-teal-500 to-cyan-600' },
    { label: 'Certificates Earned', value: certs.length, icon: Award, gradient: 'from-amber-500 to-orange-500' },
    { label: 'Volunteer Hours', value: Math.round(profile.total_hours), icon: Clock, gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Partner Hotels', value: donations.length, icon: Hotel, gradient: 'from-lime-500 to-green-600' },
    { label: 'Impact Score', value: points, icon: Activity, gradient: 'from-rose-500 to-pink-600' },
  ];

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary-400/20 to-accent-400/20 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 blur-md opacity-50" />
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="relative h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-gray-900" />
              ) : (
                <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-display text-3xl font-bold ring-4 ring-white dark:ring-gray-900">
                  {profile.full_name[0]?.toUpperCase()}
                </div>
              )}
              <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                {uploading ? (
                  <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
              </label>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl font-bold">{profile.full_name}</h1>
                {profile.is_verified && (
                  <span className="inline-flex items-center gap-1 badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-gray-500 flex items-center gap-1.5 mt-1"><Mail className="h-4 w-4" /> {profile.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 capitalize">{profile.role}</span>
                {profile.organization && <span className="badge bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300">{profile.organization}</span>}
                <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Member since {memberSince}</span>
              </div>
            </div>
            <RippleButton onClick={() => setEditing(!editing)} variant="secondary">
              {editing ? <><X className="h-4 w-4" /> Cancel</> : <><Edit3 className="h-4 w-4" /> Edit Profile</>}
            </RippleButton>
          </div>
        </motion.div>

        {/* Level banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6 relative overflow-hidden">
          <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${currentLevel.gradient} opacity-20 blur-3xl`} />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${currentLevel.gradient} text-white flex items-center justify-center shadow-lg shrink-0`}>
              {(() => { const LI = currentLevel.icon; return <LI className="h-8 w-8" />; })()}
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
            <Link to="/achievements"><RippleButton variant="secondary"><Trophy className="h-4 w-4" /> Achievements</RippleButton></Link>
          </div>
        </motion.div>

        {/* Activity stats */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {activityStats.map((s) => (
            <motion.div key={s.label} variants={fadeInUp} whileHover={{ y: -4 }} className="glass-card p-5 relative overflow-hidden group">
              <div className={`absolute -top-8 -right-8 h-20 w-20 rounded-full bg-gradient-to-br ${s.gradient} opacity-10 blur-2xl group-hover:opacity-25 transition-opacity`} />
              <div className={`inline-flex h-11 w-11 rounded-xl bg-gradient-to-br ${s.gradient} text-white items-center justify-center mb-3 shadow-lg`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="font-display text-2xl font-bold gradient-text"><AnimatedCounter value={s.value} /></p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="glass-card p-2 mb-6 flex gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const TI = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === t.id ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                <TI className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {activeTab === 'profile' && (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
                <SectionCard icon={User} title="Personal Information">
                  {editing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name"><input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-field" /></Field>
                        <Field label="Email"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" /></Field>
                        <Field label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+91 98765 43210" /></Field>
                        <Field label="Address"><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" /></Field>
                        <Field label="City"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" /></Field>
                        <Field label="State"><input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field" /></Field>
                        <Field label="Pincode"><input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="input-field" /></Field>
                      </div>
                      <Field label="Bio"><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="input-field resize-none" placeholder="Tell us about yourself..." /></Field>
                      <RippleButton onClick={saveProfile} variant="primary"><Check className="h-4 w-4" /> Save Changes</RippleButton>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InfoTile icon={Phone} label="Phone" value={profile.phone} />
                      <InfoTile icon={Mail} label="Email" value={profile.email} />
                      <InfoTile icon={MapPin} label="Address" value={profile.address} />
                      <InfoTile icon={MapPin} label="City" value={profile.city} />
                      <InfoTile icon={MapPin} label="State" value={profile.state} />
                      <InfoTile icon={MapPin} label="Pincode" value={profile.pincode} />
                      <div className="sm:col-span-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-xs text-gray-400">Bio</p>
                        <p className="font-medium mt-1">{profile.bio || 'No bio yet. Click Edit Profile to add one.'}</p>
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* My Donations */}
                <SectionCard icon={Package} title="My Donations" accent="accent">
                  {donations.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No donations yet. <Link to="/donate-food" className="text-primary-500 underline">Donate food</Link> to get started.</p>
                  ) : (
                    <div className="overflow-x-auto -mx-2">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-gray-400 border-b border-gray-100 dark:border-gray-800">
                            <th className="py-2 px-2 font-medium">Donation ID</th>
                            <th className="py-2 px-2 font-medium">Food Type</th>
                            <th className="py-2 px-2 font-medium">Quantity</th>
                            <th className="py-2 px-2 font-medium">Date</th>
                            <th className="py-2 px-2 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donations.map((d) => (
                            <tr key={d.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                              <td className="py-3 px-2 font-mono text-xs">{d.id.slice(0, 8)}</td>
                              <td className="py-3 px-2">{d.food_name}</td>
                              <td className="py-3 px-2">{d.quantity} {d.quantity_unit}</td>
                              <td className="py-3 px-2 text-gray-500">{new Date(d.created_at).toLocaleDateString()}</td>
                              <td className="py-3 px-2"><span className="badge capitalize bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">{d.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </SectionCard>

                {/* My Certificates */}
                <SectionCard icon={Award} title="My Certificates" accent="accent">
                  {certs.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No certificates yet. Keep volunteering to earn your first certificate!</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {certs.map((c) => (
                        <div key={c.id} className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/40">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md">
                              <Award className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{c.certificate_number}</p>
                              <p className="text-xs text-gray-500">{c.deliveries_count} deliveries - {c.hours_served}h</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link to="/certificate" className="flex-1"><RippleButton variant="ghost" fullWidth className="text-xs"><FileText className="h-3.5 w-3.5" /> View</RippleButton></Link>
                            <Link to="/certificate" className="flex-1"><RippleButton variant="ghost" fullWidth className="text-xs"><Download className="h-3.5 w-3.5" /> PDF</RippleButton></Link>
                            <Link to="/verify-certificate" className="flex-1"><RippleButton variant="ghost" fullWidth className="text-xs"><ExternalLink className="h-3.5 w-3.5" /> Verify</RippleButton></Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                {/* My Achievements */}
                <SectionCard icon={Medal} title="My Achievements">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {achievementList.map((a) => {
                      const isEarned = earned.some((e) => e.id === a.id);
                      const AI = a.icon;
                      return (
                        <motion.div key={a.id} whileHover={{ y: -3 }} className={`flex flex-col items-center text-center p-3 rounded-xl ${isEarned ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-gray-50 dark:bg-gray-800/30 opacity-50'}`}>
                          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${a.gradient} text-white flex items-center justify-center mb-2 ${isEarned ? '' : 'grayscale'}`}>
                            <AI className="h-5 w-5" />
                          </div>
                          <p className="text-[10px] font-medium leading-tight">{a.label}</p>
                          {isEarned && <Check className="h-3 w-3 text-emerald-500 mt-1" />}
                        </motion.div>
                      );
                    })}
                  </div>
                  <Link to="/achievements" className="block mt-4"><RippleButton variant="ghost" fullWidth className="text-xs">View All Achievements</RippleButton></Link>
                </SectionCard>
              </motion.div>
            )}

            {activeTab === 'account' && (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
                <SectionCard icon={KeyRound} title="Change Password">
                  <div className="space-y-4 max-w-md">
                    <Field label="Current Password"><input type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} className="input-field" placeholder="••••••••" /></Field>
                    <Field label="New Password"><input type="password" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} className="input-field" placeholder="••••••••" /></Field>
                    <Field label="Confirm New Password"><input type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} className="input-field" placeholder="••••••••" /></Field>
                    <RippleButton onClick={changePassword} variant="primary"><Check className="h-4 w-4" /> Update Password</RippleButton>
                  </div>
                </SectionCard>

                <SectionCard icon={Mail} title="Update Email">
                  <div className="space-y-4 max-w-md">
                    <Field label="New Email"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" /></Field>
                    <RippleButton onClick={saveProfile} variant="primary"><Check className="h-4 w-4" /> Save Email</RippleButton>
                  </div>
                </SectionCard>

                <SectionCard icon={ShieldCheck} title="Two-Step Verification">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <p className="font-medium text-sm">Enable 2FA</p>
                      <p className="text-xs text-gray-400">Add an extra layer of security to your account</p>
                    </div>
                    <Toggle checked={false} onChange={() => pushToast('Two-step verification setup coming soon', 'info')} />
                  </div>
                </SectionCard>

                <SectionCard icon={Monitor} title="Login Sessions">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-primary-500" />
                        <div>
                          <p className="font-medium text-sm">Current Session</p>
                          <p className="text-xs text-gray-400">This device - Active now</p>
                        </div>
                      </div>
                      <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">Active</span>
                    </div>
                  </div>
                  <RippleButton onClick={() => pushToast('All other sessions signed out', 'success')} variant="ghost" className="mt-3 text-xs">Sign out of all other sessions</RippleButton>
                </SectionCard>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                <SectionCard icon={Bell} title="Notification Settings">
                  <div className="space-y-1">
                    {[
                      { key: 'email' as const, label: 'Email Notifications', desc: 'Receive updates via email', icon: Mail },
                      { key: 'push' as const, label: 'Push Notifications', desc: 'Get push alerts on your device', icon: Bell },
                      { key: 'donations' as const, label: 'Donation Updates', desc: 'When your donations are accepted', icon: Package },
                      { key: 'certificates' as const, label: 'Certificate Notifications', desc: 'When you earn a new certificate', icon: Award },
                      { key: 'volunteer' as const, label: 'Volunteer Requests', desc: 'New pickup requests near you', icon: HeartHandshake },
                      { key: 'quality' as const, label: 'Food Quality Alerts', desc: 'Warnings about food freshness', icon: ShieldCheck },
                    ].map((row) => {
                      const RI = row.icon;
                      return (
                        <div key={row.key} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center"><RI className="h-4.5 w-4.5" /></div>
                            <div>
                              <p className="font-medium text-sm">{row.label}</p>
                              <p className="text-xs text-gray-400">{row.desc}</p>
                            </div>
                          </div>
                          <Toggle checked={notifSettings[row.key]} onChange={(v) => saveNotifSettings({ ...notifSettings, [row.key]: v })} />
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                <SectionCard icon={Lock} title="Privacy Settings">
                  <div className="space-y-1">
                    {[
                      { key: 'profileVisible' as const, label: 'Show Profile to Volunteers', desc: 'Let volunteers see your profile info', icon: Eye },
                      { key: 'locationOnPickup' as const, label: 'Share Location Only During Pickup', desc: 'Location shared only during active pickups', icon: MapPin },
                      { key: 'hidePhone' as const, label: 'Hide Phone Number', desc: 'Keep your phone number private', icon: Phone },
                    ].map((row) => {
                      const RI = row.icon;
                      return (
                        <div key={row.key} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-accent-100 dark:bg-accent-900/30 text-accent-600 flex items-center justify-center"><RI className="h-4.5 w-4.5" /></div>
                            <div>
                              <p className="font-medium text-sm">{row.label}</p>
                              <p className="text-xs text-gray-400">{row.desc}</p>
                            </div>
                          </div>
                          <Toggle checked={privacySettings[row.key]} onChange={(v) => savePrivacySettings({ ...privacySettings, [row.key]: v })} />
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
                <SectionCard icon={Trash2} title="Danger Zone" accent="accent">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
                    <div>
                      <p className="font-medium text-sm text-red-700 dark:text-red-300">Delete Account</p>
                      <p className="text-xs text-red-500/70">Permanently delete your account and all data. This cannot be undone.</p>
                    </div>
                    <RippleButton onClick={() => setShowDelete(true)} variant="ghost" className="text-red-600 border border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"><Trash2 className="h-4 w-4" /> Delete Account</RippleButton>
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                <SectionCard icon={Palette} title="Theme Selection">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { value: 'light' as const, label: 'Light Mode', icon: Sun, gradient: 'from-amber-300 to-yellow-400' },
                      { value: 'dark' as const, label: 'Dark Mode', icon: Moon, gradient: 'from-slate-700 to-gray-900' },
                      { value: 'system' as const, label: 'System Theme', icon: Monitor, gradient: 'from-blue-400 to-indigo-500' },
                    ].map((opt) => {
                      const OI = opt.icon;
                      const active = prefs.theme === opt.value;
                      return (
                        <motion.button
                          key={opt.value}
                          whileHover={{ y: -4 }}
                          onClick={() => applyTheme(opt.value)}
                          className={`p-5 rounded-2xl border-2 transition-all text-center ${active ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}
                        >
                          <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${opt.gradient} text-white flex items-center justify-center mx-auto mb-3 shadow-lg ${active ? 'ring-4 ring-primary-200 dark:ring-primary-800' : ''}`}>
                            <OI className="h-7 w-7" />
                          </div>
                          <p className="font-medium text-sm">{opt.label}</p>
                          {active && <p className="text-xs text-primary-500 mt-1 flex items-center justify-center gap-1"><Check className="h-3 w-3" /> Active</p>}
                        </motion.button>
                      );
                    })}
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {activeTab === 'language' && (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                <SectionCard icon={Globe} title="Language Preference">
                  <div className="space-y-2">
                    {languages.map((lang) => {
                      const active = prefs.language === lang.value;
                      return (
                        <button
                          key={lang.value}
                          onClick={() => { savePrefs({ ...prefs, language: lang.value }); pushToast('Language preference saved', 'success'); }}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${active ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}
                        >
                          <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-primary-500" />
                            <div className="text-left">
                              <p className="font-medium text-sm">{lang.label}</p>
                              <p className="text-xs text-gray-400">{lang.native}</p>
                            </div>
                          </div>
                          {active && <Check className="h-5 w-5 text-primary-500" />}
                        </button>
                      );
                    })}
                  </div>
                </SectionCard>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Sign out */}
        <div className="mt-6 text-center">
          <RippleButton onClick={signOut} variant="ghost" className="text-gray-500"><LogOut className="h-4 w-4" /> Sign Out</RippleButton>
        </div>
      </section>

      {/* Delete account modal */}
      <AnimatePresence>
        {showDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDelete(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 max-w-sm w-full text-center">
              <div className="h-14 w-14 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Delete Account?</h3>
              <p className="text-sm text-gray-500 mb-5">This will permanently delete your account and all associated data. This action cannot be undone.</p>
              <div className="flex gap-3">
                <RippleButton onClick={() => setShowDelete(false)} variant="ghost" fullWidth>Cancel</RippleButton>
                <RippleButton onClick={() => { pushToast('Account deletion requires admin verification', 'warning'); setShowDelete(false); }} variant="primary" fullWidth className="bg-red-500 hover:bg-red-600">Delete</RippleButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string | null }) {
  return (
    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
      <p className="text-xs text-gray-400 flex items-center gap-1"><Icon className="h-3 w-3" /> {label}</p>
      <p className="font-medium mt-1">{value || 'Not set'}</p>
    </div>
  );
}
