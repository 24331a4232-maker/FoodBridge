import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';

import { PageNav } from '@/components/PageNav';
export function LoginPage() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast(error.includes('Invalid login') ? 'Invalid email or password' : error, 'error');
    } else {
      toast('Welcome back to FoodBridge!', 'success');
      navigate(from);
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
          <h1 className="font-display text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Login to continue making a difference</p>
        </div>

        <motion.form variants={staggerContainer} initial="hidden" animate="visible" onSubmit={handleSubmit} className="space-y-5">
          <motion.div variants={fadeInUp}>
            <label className="input-label">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`input-field pl-12 ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </motion.div>

          <motion.div variants={fadeInUp}>
            <label className="input-label">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`input-field pl-12 pr-12 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="******"
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </motion.div>

          <motion.div variants={fadeInUp} className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500" />
              <span className="text-gray-600 dark:text-gray-400">Remember me</span>
            </label>
            <button type="button" onClick={() => toast('Password reset is not available in this demo. Contact support@foodbridge.org.', 'info')} className="text-primary-600 hover:underline">
              Forgot password?
            </button>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <RippleButton type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <>Login <LogIn className="h-4 w-4" /></>}
            </RippleButton>
          </motion.div>

          <motion.div variants={fadeInUp} className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-ivory dark:bg-gray-900 px-3 text-gray-400">or</span></div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <button
              type="button"
              onClick={() => toast('Google login requires backend setup. Please use email/password.', 'info')}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium text-sm"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </motion.div>

          <motion.p variants={fadeInUp} className="text-center text-sm text-gray-500">
            New to FoodBridge? <Link to="/register" className="text-primary-600 font-semibold hover:underline flex items-center justify-center gap-1">Register here <ArrowRight className="h-3 w-3" /></Link>
          </motion.p>
        </motion.form>
      </motion.div>
    </div>
  );
}
