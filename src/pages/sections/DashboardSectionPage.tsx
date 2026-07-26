import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Building2, ArrowRight, ShieldCheck, AtSign, Lock,
  Eye, EyeOff, LogIn, Truck,
} from 'lucide-react';
import { SectionPageHeader } from '@/components/SectionPageHeader';
import { useAuth, roleDashboardPath } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import type { UserRole } from '@/types';

const dashboards = [
  {
    title: 'Volunteer Dashboard',
    desc: 'Manage your deliveries, track your impact, earn certificates, and climb the leaderboard.',
    icon: LayoutDashboard,
    path: '/dashboard/volunteer',
    color: 'from-primary-500 to-primary-700',
    protected: true,
  },
  {
    title: 'Admin Dashboard',
    desc: 'Oversee platform operations with the Mission Control Center — users, donations, analytics, and reports.',
    icon: Building2,
    path: '/dashboard/admin',
    color: 'from-accent-500 to-accent-700',
    protected: true,
    adminOnly: true,
  },
];

const loginRoles: { value: 'volunteer' | 'admin'; label: string; icon: typeof Truck }[] = [
  { value: 'volunteer', label: 'Volunteer', icon: Truck },
  { value: 'admin', label: 'Admin', icon: ShieldCheck },
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

  const isAuthed = !authLoading && user && profile;

  return (
    <div className="pt-20 min-h-screen gradient-bg-soft">
      <SectionPageHeader
        crumbs={[{ label: 'Dashboard', icon: LayoutDashboard }]}
        eyebrow="Dashboard"
        title="Your command center"
        subtitle="Sign in to access volunteer and admin dashboards, manage deliveries, track impact, and oversee operations."
        icon={LayoutDashboard}
      />

      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto items-stretch">
          {/* Dashboard cards */}
          <div className="grid grid-cols-1 gap-6">
            {dashboards.map((d, i) => {
              const Icon = d.icon;
              return (
                <motion.div
                  key={d.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ y: -6 }}
                >
                  <Link to={d.path} className="card p-8 block h-full group">
                    <div className={`h-16 w-16 rounded-2xl-premium bg-gradient-to-br ${d.color} text-white flex items-center justify-center mb-6 shadow-lg group-hover:shadow-premium transition-shadow`}>
                      <Icon className="h-8 w-8" strokeWidth={1.75} />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-ink dark:text-cream mb-2">{d.title}</h3>
                    <p className="text-sm text-ink-soft dark:text-cream/60 leading-relaxed mb-5">{d.desc}</p>
                    {d.protected && (
                      <span className="inline-flex items-center gap-1 text-xs text-ink-soft dark:text-cream/50 mb-4">
                        <ShieldCheck className="h-3.5 w-3.5" /> {d.adminOnly ? 'Admin access required' : 'Sign in required'}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all">
                      Open dashboard <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Inline login panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-8 self-start"
          >
            {isAuthed ? (
              <div className="text-center py-6">
                <div className="h-16 w-16 mx-auto rounded-2xl-premium bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center mb-5 shadow-lg">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h2 className="font-display text-xl font-semibold text-ink dark:text-cream mb-1">You're signed in</h2>
                <p className="text-sm text-ink-soft dark:text-cream/60 mb-6">
                  Signed in as <span className="font-semibold">{profile?.username}</span> ({profile?.role}).
                </p>
                <RippleButton variant="primary" fullWidth onClick={() => navigate(roleDashboardPath[profile!.role], { replace: true })}>
                  Go to my dashboard <ArrowRight className="h-4 w-4 ml-1 inline" />
                </RippleButton>
                <p className="text-xs text-ink-soft dark:text-cream/50 mt-4">
                  Want a different account? Sign out from your profile, then return here.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="h-14 w-14 mx-auto rounded-2xl-premium bg-gradient-to-br from-primary-600 to-primary-500 text-white flex items-center justify-center mb-4 shadow-lg">
                    <LogIn className="h-7 w-7" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-ink dark:text-cream">Sign in to continue</h2>
                  <p className="text-sm text-ink-soft dark:text-cream/60 mt-1">Choose your role and enter your credentials</p>
                </div>

                {/* Role tabs */}
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
                          ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30'
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
                      <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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
              </>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
