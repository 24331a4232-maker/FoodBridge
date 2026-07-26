import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, Lock, User, Building2, Eye, EyeOff, UserPlus, ArrowRight,
  Hotel, HeartHandshake, Phone, AtSign, Check, X, Truck, MapPin,
  ShieldCheck, Loader2, KeyRound, RefreshCw, Smartphone,
} from 'lucide-react';
import { useAuth, roleDashboardPath } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { UserRole } from '@/types';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { PageNav } from '@/components/PageNav';
import { sendOtp, verifyOtp, OTP_LENGTH, RESEND_COOLDOWN_SEC } from '@/lib/otp';

const roles: { value: UserRole; label: string; icon: typeof Hotel; desc: string }[] = [
  { value: 'restaurant', label: 'Restaurant', icon: Hotel, desc: 'I run a restaurant and want to donate surplus food' },
  { value: 'donor', label: 'Donor', icon: HeartHandshake, desc: 'I want to donate food as an individual' },
  { value: 'volunteer', label: 'Volunteer', icon: Truck, desc: 'I want to pick up and deliver food' },
  { value: 'ngo', label: 'NGO / Shelter', icon: Building2, desc: 'I receive food for people in need' },
];

const passwordRules = [
  { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
  { label: 'One uppercase letter (A-Z)', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter (a-z)', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'One number (0-9)', test: (pw: string) => /[0-9]/.test(pw) },
  { label: 'One special character (!@#$...)', test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
];

type OtpStatus = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified' | 'error';

export function RegisterPage() {
  const { signUp, user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('volunteer');
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organization: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // OTP state
  const [otpStatus, setOtpStatus] = useState<OtpStatus>('idle');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [mobileChanged, setMobileChanged] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otpRequired = role !== 'admin';
  const isOtpVerified = otpStatus === 'verified';
  const canRegister = !otpRequired || isOtpVerified;

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Reset OTP state when mobile number changes after verification
  useEffect(() => {
    if (mobileChanged && otpStatus !== 'idle') {
      setOtpStatus('idle');
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setOtpError('');
      setDevOtp('');
      setMobileChanged(false);
    }
  }, [mobileChanged, otpStatus]);

  if (!authLoading && !loading && user && profile) return <Navigate to={roleDashboardPath[profile.role]} replace />;

  const setField = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
    if (key === 'phone') setMobileChanged(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const fullName = form.fullName.trim();
    const username = form.username.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const password = form.password.trim();
    const confirmPassword = form.confirmPassword.trim();

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

    if (!confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';

    if ((role === 'donor' || role === 'ngo') && !form.organization.trim()) e.organization = 'Organization name is required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendOtp = async () => {
    const phone = form.phone.trim();
    if (!phone) { setErrors((e) => ({ ...e, phone: 'Mobile number is required' })); return; }
    if (!/^\d{10}$/.test(phone)) { setErrors((e) => ({ ...e, phone: 'Mobile number must contain exactly 10 digits' })); return; }

    setOtpStatus('sending');
    setOtpError('');
    setDevOtp('');

    const result = await sendOtp(phone);
    if (!result.success) {
      setOtpStatus('error');
      setOtpError(result.error ?? 'Failed to send OTP');
      if (result.cooldownRemaining) setCooldown(result.cooldownRemaining);
      return;
    }

    setOtpStatus('sent');
    setCooldown(RESEND_COOLDOWN_SEC);
    if (result.devMode && result.otp) setDevOtp(result.otp);
    toast('OTP sent to your mobile number', 'success');
    setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setOtpStatus('sending');
    setOtpError('');
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setDevOtp('');

    const result = await sendOtp(form.phone.trim());
    if (!result.success) {
      setOtpStatus('error');
      setOtpError(result.error ?? 'Failed to resend OTP');
      if (result.cooldownRemaining) setCooldown(result.cooldownRemaining);
      return;
    }
    setOtpStatus('sent');
    setCooldown(RESEND_COOLDOWN_SEC);
    if (result.devMode && result.otp) setDevOtp(result.otp);
    toast('New OTP sent', 'success');
  };

  const handleOtpChange = (idx: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[idx] = digit;
    setOtpDigits(next);
    setOtpError('');

    if (digit && idx < OTP_LENGTH - 1) otpInputRefs.current[idx + 1]?.focus();
    if (digit && idx === OTP_LENGTH - 1 && next.every((d) => d !== '')) handleVerifyOtp(next.join(''));
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) otpInputRefs.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length > 0) {
      const next = Array(OTP_LENGTH).fill('');
      pasted.split('').forEach((d, i) => { next[i] = d; });
      setOtpDigits(next);
      if (pasted.length === OTP_LENGTH) handleVerifyOtp(pasted);
      else otpInputRefs.current[pasted.length]?.focus();
    }
  };

  const handleVerifyOtp = async (code?: string) => {
    const otp = code ?? otpDigits.join('');
    if (otp.length !== OTP_LENGTH) { setOtpError('Please enter all 6 digits'); return; }

    setOtpStatus('verifying');
    setOtpError('');
    const result = await verifyOtp(form.phone.trim(), otp);
    if (!result.success) {
      setOtpStatus('sent');
      setOtpError(result.error ?? 'Invalid OTP');
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      otpInputRefs.current[0]?.focus();
      return;
    }
    setOtpStatus('verified');
    setOtpError('');
    toast('Mobile Number Verified Successfully.', 'success');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (otpRequired && !isOtpVerified) {
      toast('Please verify your mobile number first.', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        username: form.username,
        phone: form.phone,
        role,
        organization: form.organization,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        mobileVerified: isOtpVerified,
      });

      if (result.error) {
        if (result.fieldErrors) setErrors((prev) => ({ ...prev, ...result.fieldErrors }));
        toast(result.error, 'error');
      } else {
        toast('Account created! Welcome to FoodBridge.', 'success');
        navigate(roleDashboardPath[role], { replace: true });
      }
    } catch (err) {
      console.error('[register] handleSubmit threw:', err);
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      toast(msg, 'error');
    } finally {
      setLoading(false);
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

          {/* OTP Verification Section — required for all non-admin roles */}
          {otpRequired && (
            <motion.div variants={fadeInUp} className="rounded-2xl bg-primary-50/50 dark:bg-primary-900/10 p-4 border border-primary-200/50 dark:border-primary-800/30">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="h-4 w-4 text-primary-500" />
                <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">Mobile OTP Verification</p>
                <span className="text-xs text-gray-400">Required</span>
              </div>

              {(otpStatus === 'idle' || otpStatus === 'error') && (
                <div>
                  <p className="text-xs text-gray-500 mb-3">Click below to receive a 6-digit verification code on your mobile number.</p>
                  {otpError && (
                    <div className="mb-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                      <X className="h-4 w-4 shrink-0" /> {otpError}
                    </div>
                  )}
                  <RippleButton
                    type="button"
                    onClick={handleSendOtp}
                    variant="primary"
                    disabled={otpStatus === 'sending' || form.phone.length !== 10}
                    className="text-sm"
                  >
                    {otpStatus === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    Send OTP
                  </RippleButton>
                </div>
              )}

              {(otpStatus === 'sent' || otpStatus === 'verifying' || otpStatus === 'verified') && (
                <div>
                  {otpStatus === 'verified' ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                      <div className="h-9 w-9 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                        <Check className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300">Mobile Number Verified Successfully.</p>
                        <p className="text-xs text-green-600 dark:text-green-400">You can now complete your registration.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-gray-500">Enter the 6-digit code sent to {form.phone}</p>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={cooldown > 0 || otpStatus === 'verifying'}
                          className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1"
                        >
                          {cooldown > 0 ? (
                            <span className="text-gray-400">Resend in {cooldown}s</span>
                          ) : (
                            <><RefreshCw className="h-3 w-3" /> Resend OTP</>
                          )}
                        </button>
                      </div>

                      {devOtp && (
                        <div className="mb-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 shrink-0" />
                          <span>Dev mode: Your OTP is <span className="font-mono font-bold tracking-widest">{devOtp}</span></span>
                        </div>
                      )}

                      <div className="flex gap-2 justify-center mb-3" onPaste={handleOtpPaste}>
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => { otpInputRefs.current[idx] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            disabled={otpStatus === 'verifying'}
                            className={`w-11 h-12 text-center text-lg font-bold rounded-xl border-2 transition-all focus:outline-none ${
                              otpError
                                ? 'border-red-400 focus:border-red-500'
                                : 'border-gray-200 dark:border-gray-700 focus:border-primary-500'
                            } bg-white dark:bg-gray-800`}
                          />
                        ))}
                      </div>

                      {otpError && (
                        <div className="mb-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                          <X className="h-4 w-4 shrink-0" /> {otpError}
                        </div>
                      )}

                      <RippleButton
                        type="button"
                        onClick={() => handleVerifyOtp()}
                        variant="primary"
                        disabled={otpStatus === 'verifying' || otpDigits.some((d) => !d)}
                        className="text-sm"
                      >
                        {otpStatus === 'verifying' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        Verify OTP
                      </RippleButton>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}

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
            <label className="input-label">Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                className="input-field pl-12"
                placeholder="123 Main Street"
              />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div variants={fadeInUp}>
              <label className="input-label">City</label>
              <input
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
                className="input-field"
                placeholder="Hyderabad"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <label className="input-label">State</label>
              <input
                value={form.state}
                onChange={(e) => setField('state', e.target.value)}
                className="input-field"
                placeholder="Telangana"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <label className="input-label">Pincode</label>
              <input
                value={form.pincode}
                onChange={(e) => setField('pincode', e.target.value.replace(/\D/g, ''))}
                className="input-field"
                placeholder="500001"
                inputMode="numeric"
                maxLength={6}
              />
            </motion.div>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="mt-2 grid grid-cols-1 gap-1">
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
              <label className="input-label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={show ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setField('confirmPassword', e.target.value)}
                  className={`input-field pl-12 ${errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="Re-enter your password"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </motion.div>
          </div>

          <motion.div variants={fadeInUp}>
            <RippleButton type="submit" variant="primary" fullWidth disabled={loading || !canRegister}>
              {loading ? (
                <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : !canRegister ? (
                <><Lock className="h-4 w-4" /> Verify Mobile to Register</>
              ) : (
                <>Create Account <UserPlus className="h-4 w-4" /></>
              )}
            </RippleButton>
            {!canRegister && (
              <p className="text-xs text-center text-gray-400 mt-2">The Register button is locked until your mobile number is verified.</p>
            )}
          </motion.div>

          <motion.p variants={fadeInUp} className="text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-primary-600 font-semibold hover:underline inline-flex items-center gap-1">Login here <ArrowRight className="h-3 w-3" /></Link>
          </motion.p>
        </motion.form>
      </motion.div>
    </div>
  );
}
