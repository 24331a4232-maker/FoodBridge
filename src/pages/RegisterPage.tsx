import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building2, Eye, EyeOff, UserPlus, ArrowRight, Hotel, HeartHandshake, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { UserRole } from '@/types';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';

const roles: { value: UserRole; label: string; icon: typeof Hotel; desc: string }[] = [
  { value: 'donor', label: 'Hotel / Restaurant', icon: Hotel, desc: 'I want to donate surplus food' },
  { value: 'volunteer', label: 'Volunteer', icon: HeartHandshake, desc: 'I want to deliver food' },
  { value: 'admin', label: 'Admin', icon: ShieldCheck, desc: 'Manage the platform' },
  { value: 'ngo', label: 'NGO / Shelter', icon: Building2, desc: 'Receive food donations' },
];

export function RegisterPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('volunteer');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', organization: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName) e.fullName = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    if ((role === 'donor' || role === 'ngo') && !form.organization) e.organization = 'Organization name required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName, role, form.organization);
    setLoading(false);
    if (error) {
      toast(error.includes('already') ? 'Email already registered. Try logging in.' : error, 'error');
    } else {
      toast('Account created! Welcome to FoodBridge.', 'success');
      navigate('/');
    }
  };

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4 py-10 gradient-bg-soft relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl animate-blob" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-accent-300/20 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-2xl p-8 relative"
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

        <motion.form variants={staggerContainer} initial="hidden" animate="visible" onSubmit={handleSubmit} className="space-y-5">
          <motion.div variants={fadeInUp}>
            <label className="input-label">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={`input-field pl-12 ${errors.fullName ? 'border-red-400' : ''}`} placeholder="John Doe" />
            </div>
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </motion.div>

          {(role === 'donor' || role === 'ngo') && (
            <motion.div variants={fadeInUp}>
              <label className="input-label">Organization Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} className={`input-field pl-12 ${errors.organization ? 'border-red-400' : ''}`} placeholder="The Grand Hotel" />
              </div>
              {errors.organization && <p className="text-xs text-red-500 mt-1">{errors.organization}</p>}
            </motion.div>
          )}

          <motion.div variants={fadeInUp}>
            <label className="input-label">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`input-field pl-12 ${errors.email ? 'border-red-400' : ''}`} placeholder="you@example.com" />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </motion.div>

          <motion.div variants={fadeInUp}>
            <label className="input-label">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type={show ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`input-field pl-12 pr-12 ${errors.password ? 'border-red-400' : ''}`} placeholder="******" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </motion.div>

          <motion.div variants={fadeInUp}>
            <RippleButton type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <>Create Account <UserPlus className="h-4 w-4" /></>}
            </RippleButton>
          </motion.div>

          <motion.p variants={fadeInUp} className="text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-primary-600 font-semibold hover:underline flex items-center justify-center gap-1">Login here <ArrowRight className="h-3 w-3" /></Link>
          </motion.p>
        </motion.form>
      </motion.div>
    </div>
  );
}
