import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ArrowRight, ShieldCheck, AtSign, Lock, Eye, EyeOff, LogIn,
  Truck, MapPin, Phone, Building2, Award, Zap, Package, Clock, Star, Sparkles,
  TrendingUp, ChevronRight, UserCircle, Fingerprint, Activity,
} from 'lucide-react';
import { SectionPageHeader } from '@/components/SectionPageHeader';
import { useAuth, roleDashboardPath } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { fadeInUp, staggerContainer, AnimatedCounter } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import type { UserRole, Profile } from '@/types';

const loginRoles: { value: 'volunteer' | 'admin'; label: string; icon: typeof Truck; accent: string; glow: string }[] = [
  { value: 'volunteer', label: 'Volunteer', icon: Truck, accent: 'from-primary-500 to-primary-700', glow: 'shadow-glow-green' },
  { value: 'admin', label: 'Admin', icon: ShieldCheck, accent: 'from-accent-500 to-accent-700', glow: 'shadow-glow-orange' },
];

export function DashboardSectionPage() {
  const { signIn, user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<'volunteer' | 'admin'>('volunteer');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAuthed = !authLoading && user && profile;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      toast('Please enter your email/username and password.', 'error');
      return;
    }
    setLoading(true);
    try {
      const { error, role: signedRole } = await signIn(identifier, password);
      if (error) {
        toast(error, 'error');
      } else {
        const dest = signedRole ? roleDashboardPath[signedRole as UserRole] : roleDashboardPath[role];
        toast(`Welcome back to your ${role} dashboard!`, 'success');
        navigate(dest, { replace: true });
      }
    } catch (err) {
      console.error('[dashboard-login] threw:', err);
      toast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen gradient-bg-soft relative overflow-hidden">
      <SectionPageHeader
        crumbs={[{ label: 'Dashboard', icon: LayoutDashboard }]}
        eyebrow="Dashboard"
        title="Your command center"
        subtitle="Sign in to access your personalized dashboard and manage your activity on FoodBridge."
        icon={LayoutDashboard}
      />

      <section className="relative px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-20">
        {isAuthed ? (
          <SignedInHero profile={profile!} onNavigate={() => navigate(roleDashboardPath[profile!.role], { replace: true })} />
        ) : (
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-8 relative overflow-hidden"
            >
              <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-gradient-to-br from-primary-400/20 to-accent-400/20 blur-3xl animate-blob" />
              <div className="relative">
                <div className="text-center mb-6">
                  <div className="h-14 w-14 mx-auto rounded-2xl-premium bg-gradient-to-br from-primary-600 to-primary-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-primary-600/30">
                    <LogIn className="h-7 w-7" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-ink dark:text-cream">Sign in to continue</h2>
                  <p className="text-sm text-ink-soft dark:text-cream/60 mt-1">Choose your role and enter your credentials</p>
                </div>

                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 mb-6">
                  {loginRoles.map((r) => (
                    <motion.button
                      key={r.value}
                      variants={fadeInUp}
                      type="button"
                      onClick={() => setRole(r.value)}
                      whileHover={{ y: -3 }}
                      className={`p-3 rounded-2xl-premium text-center transition-all ${
                        role === r.value
                          ? `bg-gradient-to-br ${r.accent} text-white shadow-lg ${r.glow}`
                          : 'glass hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }`}
                    >
                      <r.icon className="h-5 w-5 mx-auto mb-1" />
                      <p className="text-xs font-semibold">{r.label}</p>
                    </motion.button>
                  ))}
                </motion.div>

                <motion.form variants={staggerContainer} initial="hidden" animate="visible" onSubmit={handleSubmit} className="space-y-4">
                  <motion.div variants={fadeInUp}>
                    <label className="input-label">Email or Username</label>
                    <div className="relative">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="input-field pl-12"
                        placeholder="you@example.com or john_doe"
                        autoCapitalize="none"
                        autoCorrect="off"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <label className="input-label">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={show ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field pl-12 pr-12"
                        placeholder="******"
                      />
                      <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <RippleButton type="submit" variant="primary" fullWidth disabled={loading || authLoading}>
                      {loading ? (
                        <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                      ) : (
                        <>Sign in as {role} <LogIn className="h-4 w-4 ml-1 inline" /></>
                      )}
                    </RippleButton>
                  </motion.div>

                  <motion.p variants={fadeInUp} className="text-center text-sm text-ink-soft dark:text-cream/60">
                    No account yet?{' '}
                    <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline inline-flex items-center gap-1">
                      Register here <ArrowRight className="h-3 w-3" />
                    </Link>
                  </motion.p>
                </motion.form>
              </div>
            </motion.div>
          </div>
        )}
      </section>
    </div>
  );
}

function SignedInHero({ profile, onNavigate }: { profile: Profile; onNavigate: () => void }) {
  const initials = (profile.full_name || profile.username || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const stats = [
    { label: 'Reward Points', value: profile.reward_points ?? 0, icon: Zap, color: 'from-yellow-500 to-gold-500', spark: '#C9A66B' },
    { label: 'Deliveries', value: profile.total_deliveries ?? 0, icon: Package, color: 'from-primary-500 to-primary-600', spark: '#4F8060' },
    { label: 'Hours Served', value: profile.total_hours ?? 0, icon: Clock, color: 'from-secondary-500 to-primary-500', spark: '#74A57F' },
    { label: 'Rating', value: profile.rating ?? 0, icon: Star, color: 'from-accent-500 to-accent-600', spark: '#8B5E3C' },
  ];

  const infoFields = [
    { icon: AtSign, label: 'Username', value: profile.username },
    { icon: MapPin, label: 'Location', value: [profile.city, profile.state].filter(Boolean).join(', ') || null },
    { icon: Phone, label: 'Phone', value: profile.phone },
    { icon: Building2, label: 'Organization', value: profile.organization },
  ].filter((f): f is { icon: typeof AtSign; label: string; value: string } => Boolean(f.value));

  const roleAccent = profile.role === 'admin' ? 'from-accent-500 to-accent-700' : 'from-primary-500 to-primary-700';
  const roleGlow = profile.role === 'admin' ? 'shadow-glow-orange' : 'shadow-glow-green';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-5 gap-6"
    >
      {/* Profile showcase card */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="lg:col-span-2 glass-card p-8 relative overflow-hidden group"
      >
        {/* Decorative gradient backdrop */}
        <div className={`absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br ${roleAccent} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-gold-400/10 blur-3xl" />

        <div className="relative">
          {/* Avatar + identity */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`relative h-20 w-20 rounded-2xl-premium bg-gradient-to-br ${roleAccent} text-white flex items-center justify-center text-2xl font-bold shadow-lg ${roleGlow} shrink-0`}>
              {initials}
              {profile.is_verified && (
                <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-gold-500 text-white flex items-center justify-center border-2 border-cream dark:border-secondary-900 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold text-ink dark:text-cream truncate">{profile.full_name}</h2>
              <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-primary-600 dark:text-primary-400 capitalize">
                <ShieldCheck className="h-3.5 w-3.5" /> {profile.role}
              </span>
            </div>
          </div>

          {/* Info rows */}
          {infoFields.length > 0 ? (
            <div className="space-y-3">
              {infoFields.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-3 text-sm p-2.5 rounded-xl hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors"
                >
                  <div className="h-9 w-9 rounded-xl glass flex items-center justify-center shrink-0">
                    <f.icon className="h-4 w-4 text-ink-soft dark:text-cream/60" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-ink-soft dark:text-cream/50 uppercase tracking-wide">{f.label}</p>
                    <p className="font-medium text-ink dark:text-cream truncate">{f.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <UserCircle className="h-10 w-10 mx-auto text-ink-soft/40 dark:text-cream/30 mb-2" />
              <p className="text-sm text-ink-soft dark:text-cream/60">No additional profile details yet.</p>
              <Link to="/profile" className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline mt-2 inline-flex items-center gap-1">
                Complete your profile <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Badges */}
          {profile.badges && profile.badges.length > 0 && (
            <div className="mt-6 pt-5 border-t border-linen/60 dark:border-secondary-800/50">
              <p className="text-[11px] text-ink-soft dark:text-cream/50 uppercase tracking-wide mb-2.5">Badges Earned</p>
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((b) => (
                  <span key={b} className="badge bg-gold-100/80 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300 text-[10px]">
                    <Award className="h-3 w-3" /> {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats + entry */}
      <div className="lg:col-span-3 space-y-6">
        {/* Stats grid */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeInUp} whileHover={{ y: -4 }} className="glass-card p-5 relative overflow-hidden group">
              <div className={`absolute -top-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-br ${s.color} opacity-10 blur-2xl group-hover:opacity-25 transition-opacity duration-500`} />
              <div className="relative">
                <div className={`h-11 w-11 rounded-2xl-premium bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-3 shadow-lg`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="font-stat text-2xl font-bold">
                  <AnimatedCounter value={s.value} />
                </p>
                <p className="text-xs text-ink-soft dark:text-cream/60 mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Dashboard entry card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8 relative overflow-hidden"
        >
          <div className={`absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-gradient-to-br ${roleAccent} opacity-10 blur-3xl`} />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <span className="eyebrow">Your dashboard</span>
              <h3 className="font-display text-xl font-bold text-ink dark:text-cream mt-2 capitalize flex items-center gap-2">
                {profile.role} Dashboard
                <Fingerprint className="h-5 w-5 text-primary-500" />
              </h3>
              <p className="text-sm text-ink-soft dark:text-cream/60 mt-1">
                You're signed in and ready to go.
              </p>
            </div>
            <RippleButton variant="primary" onClick={onNavigate} className="shrink-0">
              Open dashboard <ChevronRight className="h-4 w-4 ml-1 inline" />
            </RippleButton>
          </div>
        </motion.div>

        {/* Encouragement banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 flex items-center gap-4 group hover:shadow-premium transition-shadow duration-300"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary-500 to-primary-500 text-white flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-ink dark:text-cream text-sm">Keep up the great work</p>
            <p className="text-xs text-ink-soft dark:text-cream/60">
              Every delivery makes a difference. Visit your dashboard to see available tasks.
            </p>
          </div>
          <Activity className="h-5 w-5 text-primary-500 animate-pulse-soft shrink-0" />
        </motion.div>
      </div>
    </motion.div>
  );
}
