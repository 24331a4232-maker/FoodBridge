import { useState, type FormEvent } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, Lock, User, Building2, Eye, EyeOff, UserPlus, ArrowRight,
  Hotel, HeartHandshake, ShieldCheck, Phone, AtSign, Check, X, Truck,
} from 'lucide-react';
import { useAuth, roleDashboardPath } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { UserRole } from '@/types';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { PageNav } from '@/components/PageNav';

const roles: { value: UserRole; label: string; icon: typeof Hotel; desc: string }[] = [
  { value: 'restaurant', label: 'Restaurant', icon: Hotel, desc: 'I run a restaurant and want to donate surplus food' },
  { value: 'donor', label: 'Donor', icon: HeartHandshake, desc: 'I want to donate food as an individual' },
  { value: 'volunteer', label: 'Volunteer', icon: Truck, desc: 'I want to pick up and deliver food' },
  { value: 'ngo', label: 'NGO / Shelter', icon: Building2, desc: 'I receive food for people in need' },
  { value: 'admin', label: 'Admin', icon: ShieldCheck, desc: 'I manage the platform' },
];

const passwordRules = [
  { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
  { label: 'One uppercase letter (A-Z)', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter (a-z)', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'One number (0-9)', test: (pw: string) => /[0-9]/.test(pw) },
  { label: 'One special character (!@#$...)', test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
];

export function RegisterPage() {
  const { signUp, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('volunteer');
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    organization: '',
  });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  if (!authLoading && user && profile) return <Navigate to={roleDashboardPath[profile.role]} replace />;
  if (!authLoading && user && !profile) return <Navigate to="/" replace />;

  const setField = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};

    const fullName = form.fullName.trim();
    const username = form.username.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const password = form.password.trim();

    if (!fullName) e.fullName = 'Full name is required';
    if (!username) e.username = 'Username is required';
    else if (!/^[A-Za-z0-9_]+$/.test(username)) e.username = 'Only letters, numbers, and underscores allowed';
    else if (username.length < 3) e.username = 'Username must be at least 3 characters';

    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';

    if (!phone) e.phone = 'Mobile number is required';
    else if (!/^\d{10}$/.test(phone)) e.phone = 'Mobile number must contain exactly 10 digits';

    if (!password) e.password = 'Password is required';
    else {
      const failed = passwordRules.find((r) => !r.test(password));
      if (failed) e.password = failed.label;
    }

    if ((role === 'donor' || role === 'ngo') && !form.organization.trim()) e.organization = 'Organization name is required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      username: form.username,
      phone: form.phone,
      role,
      organization: form.organization,
    });
    setLoading(false);

    if (result.error) {
      if (result.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...result.fieldErrors }));
      }
      toast(result.error, 'error');
    } else {
      toast('Account created! Welcome to FoodBridge.', 'success');
      navigate(roleDashboardPath[role]);
    }
  };

  const passwordChecks = passwordRules.map((r) => r.test(form.password.trim()));

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4 py-10 gradient-bg-soft relative overflow-hidden">
      <PageNav crumbs={[{ label: 'Register', icon: UserPlus }]} />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl animate-blob" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-accent-300/20 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-2xl p-6 sm:p-8 relative my-8"
      >
        <div className="text-center mb-6">
          <motion.img src="/logo.png" alt="FoodBridge" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="h-16 w-16 mx-auto object-contain mb-3" />
          <h1 className="font-display text-2xl font-bold">Join FoodBridge</h1>
          <p className="text-sm text-gray-500 mt-1">Create your account and start making an impact</p>
        </div>

        {/* Role selector */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {roles.map((r) => (
            <motion.button
              key={r.value}
              variants={fadeInUp}
              type="button"
              onClick={() => setRole(r.value)}
              whileHover={{ y: -3 }}
              className={`p-4 rounded-2xl-premium text-center transition-all ${
                role === r.value
                  ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30'
                  : 'glass hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }`}
            >
              <r.icon className="h-6 w-6 mx-auto mb-2" />
              <p className="text-xs font-semibold">{r.label}</p>
            </motion.button>
          ))}
        </motion.div>

        <motion.p variants={fadeInUp} initial="hidden" animate="visible" className="text-sm text-gray-500 text-center mb-6">
          {roles.find((r) => r.value === role)?.desc}
        </motion.p>

        <motion.form variants={staggerContainer} initial="hidden" animate="visible" onSubmit={handleSubmit} className="space-y-4">
          <motion.div variants={fadeInUp}>
            <label className="input-label">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={form.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                className={`input-field pl-12 ${errors.fullName ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="John Doe"
              />
            </div>
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={fadeInUp}>
              <label className="input-label">Username</label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  value={form.username}
                  onChange={(e) => setField('username', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                  className={`input-field pl-12 ${errors.username ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="john_doe123"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
            </motion.div>

            <motion.div variants={fadeInUp}>
              <label className="input-label">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value.replace(/\D/g, ''))}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  className={`input-field pl-12 ${errors.phone ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="9876543210"
                  inputMode="numeric"
                  maxLength={10}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </motion.div>
          </div>

          {(role === 'donor' || role === 'ngo') && (
            <motion.div variants={fadeInUp}>
              <label className="input-label">Organization Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  value={form.organization}
                  onChange={(e) => setField('organization', e.target.value)}
                  className={`input-field pl-12 ${errors.organization ? 'border-red-400' : ''}`}
                  placeholder="The Grand Hotel"
                />
              </div>
              {errors.organization && <p className="text-xs text-red-500 mt-1">{errors.organization}</p>}
            </motion.div>
          )}

          <motion.div variants={fadeInUp}>
            <label className="input-label">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                className={`input-field pl-12 ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect="off"
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
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                className={`input-field pl-12 pr-12 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="Create a strong password"
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {/* Password strength checklist */}
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
              {passwordRules.map((r, i) => (
                <div key={r.label} className={`flex items-center gap-1.5 text-[11px] ${passwordChecks[i] ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordChecks[i] ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {r.label}
                </div>
              ))}
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </motion.div>

          <motion.div variants={fadeInUp}>
            <RippleButton type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <>Create Account <UserPlus className="h-4 w-4" /></>}
            </RippleButton>
          </motion.div>

          <motion.p variants={fadeInUp} className="text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-primary-600 font-semibold hover:underline inline-flex items-center gap-1">Login here <ArrowRight className="h-3 w-3" /></Link>
          </motion.p>
        </motion.form>
      </motion.div>
    </div>
  );
}
