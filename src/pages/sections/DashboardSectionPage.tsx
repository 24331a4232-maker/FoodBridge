import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { type MouseEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  Truck,
  QrCode,
  Award,
  Leaf,
  Users,
  BarChart3,
  FileText,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Premium vector illustrations                                       */
/* ------------------------------------------------------------------ */

function VolunteerIllustration() {
  return (
    <svg viewBox="0 0 320 240" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* soft glow */}
      <circle cx="160" cy="120" r="100" fill="url(#volGlow)" opacity="0.35" />
      {/* dashed route */}
      <path d="M70 170 Q160 80 250 150" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" />
      {/* delivery box */}
      <motion.g
        initial={{ y: 0 }}
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="120" y="120" width="80" height="62" rx="10" fill="rgba(255,255,255,0.95)" />
        <rect x="120" y="120" width="80" height="20" rx="10" fill="rgba(255,255,255,0.6)" />
        <path d="M120 140h80" stroke="#1B4332" strokeWidth="1.5" opacity="0.15" />
        <rect x="132" y="150" width="26" height="22" rx="4" fill="#74A57F" opacity="0.5" />
        <rect x="164" y="150" width="26" height="22" rx="4" fill="#A8C5B0" opacity="0.5" />
        <path d="M120 138 L160 118 L200 138" stroke="#1B4332" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
      </motion.g>
      {/* volunteer pin */}
      <motion.g
        initial={{ y: 0 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <path d="M250 90c0-11 9-20 20-20s20 9 20 20c0 15-20 32-20 32s-20-17-20-32Z" fill="#1B4332" />
        <circle cx="270" cy="89" r="7" fill="#FFF9F3" />
      </motion.g>
      {/* leaf accent */}
      <motion.path
        d="M80 120c0-14 11-25 25-25 0 14-11 25-25 25Z"
        fill="rgba(255,255,255,0.45)"
        initial={{ rotate: -10, scale: 1 }}
        animate={{ rotate: [ -10, 5, -10 ], scale: [1, 1.08, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '80px 120px' }}
      />
      <defs>
        <radialGradient id="volGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#A8C5B0" />
          <stop offset="100%" stopColor="#1B4332" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function AdminIllustration() {
  return (
    <svg viewBox="0 0 320 240" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="160" cy="120" r="100" fill="url(#admGlow)" opacity="0.35" />
      {/* dashboard panel */}
      <rect x="96" y="74" width="128" height="92" rx="14" fill="rgba(255,255,255,0.95)" />
      <rect x="110" y="88" width="40" height="6" rx="3" fill="#8B5E3C" opacity="0.25" />
      <rect x="110" y="100" width="24" height="4" rx="2" fill="#8B5E3C" opacity="0.15" />
      {/* bar chart */}
      <motion.g
        initial={{ scaleY: 1 }}
        animate={{ scaleY: [1, 1.12, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '160px 150px' }}
      >
        <rect x="112" y="126" width="14" height="26" rx="3" fill="#1B4332" opacity="0.75" />
        <rect x="134" y="114" width="14" height="38" rx="3" fill="#74A57F" />
        <rect x="156" y="120" width="14" height="32" rx="3" fill="#8B5E3C" opacity="0.7" />
        <rect x="178" y="108" width="14" height="44" rx="3" fill="#C9A66B" />
        <rect x="200" y="132" width="14" height="20" rx="3" fill="#1B4332" opacity="0.5" />
      </motion.g>
      {/* trend line */}
      <motion.path
        d="M112 130 L134 118 L156 122 L178 104 L200 128"
        stroke="#1B4332"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      />
      {/* floating stat chips */}
      <motion.g
        initial={{ y: 0 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="214" y="56" width="34" height="20" rx="6" fill="#1B4332" />
        <circle cx="224" cy="66" r="3" fill="#A8C5B0" />
        <rect x="231" y="63" width="12" height="6" rx="2" fill="rgba(255,255,255,0.7)" />
      </motion.g>
      <motion.g
        initial={{ y: 0 }}
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >
        <rect x="72" y="150" width="34" height="20" rx="6" fill="#8B5E3C" />
        <circle cx="82" cy="160" r="3" fill="#EBD9CC" />
        <rect x="89" y="157" width="12" height="6" rx="2" fill="rgba(255,255,255,0.7)" />
      </motion.g>
      <defs>
        <radialGradient id="admGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#D6B399" />
          <stop offset="100%" stopColor="#1B4332" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Tilt card wrapper                                                  */
/* ------------------------------------------------------------------ */

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

function TiltCard({ children, className = '' }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 18 });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Ripple button                                                      */
/* ------------------------------------------------------------------ */

interface RippleBtnProps {
  children: React.ReactNode;
  onClick: () => void;
  className: string;
}

function RippleBtn({ children, onClick, className }: RippleBtnProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.style.position = 'absolute';
    circle.style.borderRadius = '50%';
    circle.style.background = 'rgba(255,255,255,0.45)';
    circle.style.transform = 'scale(0)';
    circle.style.animation = 'ripple 0.6s linear';
    circle.style.pointerEvents = 'none';
    button.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
    onClick();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating background particles                                      */
/* ------------------------------------------------------------------ */

const particles = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  size: 6 + Math.random() * 14,
  left: `${Math.random() * 100}%`,
  delay: Math.random() * 4,
  duration: 6 + Math.random() * 6,
  color: i % 2 === 0 ? 'bg-primary-400/30' : 'bg-accent-400/30',
}));

/* ------------------------------------------------------------------ */
/*  Dashboard card data                                                */
/* ------------------------------------------------------------------ */

const volunteerFeatures = [
  { icon: Truck, label: 'Assigned Donations' },
  { icon: Truck, label: 'Live Tracking' },
  { icon: QrCode, label: 'QR Verification' },
  { icon: Award, label: 'Certificates' },
  { icon: Leaf, label: 'Food Quality Updates' },
];

const adminFeatures = [
  { icon: Users, label: 'User Management' },
  { icon: Truck, label: 'Donation Monitoring' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Leaf, label: 'Food Quality' },
  { icon: FileText, label: 'Reports' },
  { icon: QrCode, label: 'QR Verification' },
];

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export function DashboardSectionPage() {
  const navigate = useNavigate();

  return (
    <div className="relative pt-24 lg:pt-28 min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cream via-oat to-primary-50 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-800" />
      <div
        className="absolute inset-0 -z-10 opacity-60 dark:opacity-30"
        style={{
          background:
            'radial-gradient(60% 60% at 20% 20%, rgba(116,165,127,0.25), transparent), radial-gradient(50% 50% at 85% 30%, rgba(214,179,153,0.22), transparent), radial-gradient(55% 55% at 60% 90%, rgba(168,197,176,0.20), transparent)',
          backgroundSize: '200% 200%',
          animation: 'gradient 12s ease infinite',
        }}
      />

      {/* Floating blurred circles */}
      <motion.div
        className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-primary-300/30 dark:bg-primary-700/20 blur-3xl -z-10"
        animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-16 h-80 w-80 rounded-full bg-accent-300/25 dark:bg-accent-700/20 blur-3xl -z-10"
        animate={{ x: [0, -25, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-gold-300/20 dark:bg-gold-700/15 blur-3xl -z-10"
        animate={{ x: [0, 20, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className={`absolute rounded-full ${p.color} -z-10 hidden md:block`}
          style={{ width: p.size, height: p.size, left: p.left, top: `${10 + p.id * 8}%` }}
          animate={{ y: [0, -28, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center pt-6 pb-12 lg:pb-16">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-secondary-800/70 backdrop-blur-md border border-linen/60 dark:border-secondary-700/60 text-xs font-semibold uppercase tracking-[0.14em] text-primary-700 dark:text-primary-300 shadow-soft"
        >
          <Sparkles className="h-3.5 w-3.5" /> Dashboard Hub
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ink dark:text-cream leading-[1.1] text-balance"
        >
          Choose Your Workspace
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 text-base sm:text-lg text-ink-soft dark:text-cream/60 leading-relaxed max-w-2xl mx-auto text-balance"
        >
          Access your dedicated workspace to manage food donations, deliveries, volunteers, and platform operations.
        </motion.p>
      </section>

      {/* Dashboard cards */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Volunteer card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <TiltCard className="group relative rounded-3xl-premium p-[1.5px] bg-gradient-to-br from-primary-400 via-primary-600 to-primary-800 shadow-premium-lg transition-shadow duration-500 hover:shadow-glow-green">
              {/* glow border on hover */}
              <div className="absolute inset-0 rounded-3xl-premium opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary-300/50 to-primary-700/50 blur-md -z-10" />
              <div className="relative h-full rounded-3xl-premium bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl p-7 sm:p-9 flex flex-col overflow-hidden">
                {/* gradient header strip */}
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-primary-500/15 to-primary-700/5 dark:from-primary-600/20 dark:to-transparent" />

                {/* illustration */}
                <div className="relative h-36 sm:h-40 mb-6">
                  <VolunteerIllustration />
                </div>

                {/* title */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-cream flex items-center justify-center shadow-lg shrink-0">
                    <Truck className="h-5.5 w-5.5" strokeWidth={1.75} />
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-ink dark:text-cream">
                    Volunteer Dashboard
                  </h3>
                </div>

                {/* description */}
                <p className="text-sm text-ink-soft dark:text-cream/60 leading-relaxed mb-6">
                  Manage assigned donations, pickup schedules, live tracking, certificates, and delivery history.
                </p>

                {/* features */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 mb-7">
                  {volunteerFeatures.map((f) => {
                    const Icon = f.icon;
                    return (
                      <li key={f.label} className="flex items-center gap-2.5 text-sm text-ink dark:text-cream/85">
                        <span className="h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <Icon className="h-4 w-4 text-primary-500 dark:text-primary-400 opacity-70 shrink-0" />
                        <span>{f.label}</span>
                      </li>
                    );
                  })}
                </ul>

                {/* button */}
                <RippleBtn
                  onClick={() => navigate('/dashboard/volunteer')}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl-premium font-semibold text-sm text-cream bg-gradient-to-r from-primary-600 to-primary-800 hover:from-primary-700 hover:to-primary-900 shadow-lg shadow-primary-700/30 transition-colors"
                >
                  Open Volunteer Dashboard
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </RippleBtn>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-soft dark:text-cream/45">
                  <ShieldCheck className="h-3.5 w-3.5" /> Sign in required
                </p>
              </div>
            </TiltCard>
          </motion.div>

          {/* Admin card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <TiltCard className="group relative rounded-3xl-premium p-[1.5px] bg-gradient-to-br from-accent-500 via-accent-700 to-secondary-700 shadow-premium-lg transition-shadow duration-500 hover:shadow-glow-orange">
              <div className="absolute inset-0 rounded-3xl-premium opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-accent-400/50 to-secondary-600/50 blur-md -z-10" />
              <div className="relative h-full rounded-3xl-premium bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl p-7 sm:p-9 flex flex-col overflow-hidden">
                {/* gradient header strip — brown + emerald */}
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-accent-500/15 to-secondary-600/10 dark:from-accent-600/20 dark:to-secondary-700/10" />

                {/* illustration */}
                <div className="relative h-36 sm:h-40 mb-6">
                  <AdminIllustration />
                </div>

                {/* title */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-11 w-11 rounded-2xl bg-gradient-to-br from-accent-500 to-secondary-700 text-cream flex items-center justify-center shadow-lg shrink-0">
                    <LayoutDashboard className="h-5.5 w-5.5" strokeWidth={1.75} />
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-ink dark:text-cream">
                    Admin Dashboard
                  </h3>
                </div>

                {/* description */}
                <p className="text-sm text-ink-soft dark:text-cream/60 leading-relaxed mb-6">
                  Monitor platform activity, users, donations, analytics, reports, volunteers, and food quality.
                </p>

                {/* features */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 mb-7">
                  {adminFeatures.map((f) => {
                    const Icon = f.icon;
                    return (
                      <li key={f.label} className="flex items-center gap-2.5 text-sm text-ink dark:text-cream/85">
                        <span className="h-5 w-5 rounded-full bg-accent-100 dark:bg-accent-900/50 text-accent-600 dark:text-accent-300 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <Icon className="h-4 w-4 text-accent-500 dark:text-accent-400 opacity-70 shrink-0" />
                        <span>{f.label}</span>
                      </li>
                    );
                  })}
                </ul>

                {/* button */}
                <RippleBtn
                  onClick={() => navigate('/dashboard/admin')}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl-premium font-semibold text-sm text-cream bg-gradient-to-r from-accent-600 to-secondary-700 hover:from-accent-700 hover:to-secondary-800 shadow-lg shadow-accent-700/30 transition-colors"
                >
                  Open Admin Dashboard
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </RippleBtn>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-soft dark:text-cream/45">
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin access required
                </p>
              </div>
            </TiltCard>
          </motion.div>
        </div>

        {/* footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12 text-center text-sm text-ink-soft dark:text-cream/45"
        >
          Each workspace is tailored to your role — your access is determined when you sign in.
        </motion.p>
      </section>
    </div>
  );
}
