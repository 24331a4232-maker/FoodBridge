import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, LogIn, ArrowRight, AtSign, ShieldCheck } from 'lucide-react';
import { useAuth, roleDashboardPath } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { PageNav } from '@/components/PageNav';

export function LoginPage() {
  const { signIn, signOut, user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/';
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

  // Only redirect if we're NOT in the middle of a login attempt.
  if (!authLoading && !loading && user && profile) return <Navigate to={roleDashboardPath[profile.role]} replace />;

  const validate = () => {
    const e: typeof errors = {};
    if (!identifier.trim()) e.identifier = adminMode ? 'Admin username is required' : 'Email or username is required';
    if (!password.trim()) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toggleAdminMode = () => {
    setAdminMode((v) => !v);
    setIdentifier('');
    setPassword('');
    setErrors({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { error, role } = await signIn(identifier, password);
      if (error) {
        toast(error, 'error');
      } else if (adminMode && role !== 'admin') {
        toast('These credentials do not belong to an administrator account.', 'error');
        await signOut();
      } else if (!adminMode && role === 'admin') {
        toast('Please use the admin login option for administrator accounts.', 'error');
        await signOut();
      } else {
        toast('Welcome back to FoodBridge!', 'success');
        const dest = role ? roleDashboardPath[role] : from;
        navigate(dest, { replace: true });
      }
    } catch (err) {
      console.error('[login] handleSubmit threw:', err);
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4 py-10 gradient-bg-soft relative overflow-hidden">
      <PageNav crumbs={[{ label: 'Login', icon: LogIn }]} />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-accent-300/20 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8 relative"
      >
        <div className="text-center mb-8">
          <motion.img
            src="/logo.png"
            alt="FoodBridge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="h-16 w-16 mx-auto object-contain mb-3"
          />
          <h1 className="font-display text-2xl font-bold">{adminMode ? 'Admin Login' : 'Welcome Back'}</h1>
          <p className="text-sm text-gray-500 mt-1">{adminMode ? 'Secure access for platform administrators' : 'Login to continue making a difference'}</p>
        </div>

        <motion.div variants={fadeInUp} className="mb-5">
          <button
            type="button"
            onClick={toggleAdminMode}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl-premium py-2.5 text-sm font-semibold transition-all ${
              adminMode
                ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30'
                : 'glass hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-700 dark:text-gray-300'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            {adminMode ? 'Admin mode active — switch to user login' : 'Login as Administrator'}
          </button>
        </motion.div>

        <motion.form variants={staggerContainer} initial="hidden" animate="visible" onSubmit={handleSubmit} className="space-y-5">
          <motion.div variants={fadeInUp}>
            <label className="input-label">{adminMode ? 'Admin Username' : 'Email or Username'}</label>
            <div className="relative">
              {adminMode ? (
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-500" />
              ) : (
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              )}
              <input
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setErrors((er) => ({ ...er, identifier: undefined })); }}
                className={`input-field pl-12 ${errors.identifier ? 'border-red-400 focus:ring-red-400' : ''} ${adminMode ? 'border-primary-300 focus:ring-primary-500' : ''}`}
                placeholder={adminMode ? 'Foodbridge29' : 'you@example.com or john_doe'}
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>
            {errors.identifier && <p className="text-xs text-red-500 mt-1">{errors.identifier}</p>}
          </motion.div>

          <motion.div variants={fadeInUp}>
            <label className="input-label">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((er) => ({ ...er, password: undefined })); }}
                className={`input-field pl-12 pr-12 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="******"
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </motion.div>

          {!adminMode && (
            <motion.div variants={fadeInUp} className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500" />
                <span className="text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <button type="button" onClick={() => toast('Please use the password reset link sent to your email, or contact support@foodbridge.org.', 'info')} className="text-primary-600 hover:underline">
                Forgot password?
              </button>
            </motion.div>
          )}

          <motion.div variants={fadeInUp}>
            <RippleButton type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <>{adminMode ? <>Admin Login <ShieldCheck className="h-4 w-4" /></> : <>Login <LogIn className="h-4 w-4" /></>}</>}
            </RippleButton>
          </motion.div>

          {!adminMode && (
            <motion.p variants={fadeInUp} className="text-center text-sm text-gray-500">
              New to FoodBridge? <Link to="/register" className="text-primary-600 font-semibold hover:underline flex items-center justify-center gap-1">Register here <ArrowRight className="h-3 w-3" /></Link>
            </motion.p>
          )}
        </motion.form>
      </motion.div>
    </div>
  );
}
