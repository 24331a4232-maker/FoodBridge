import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Package, ShieldCheck, Truck, Award, ArrowRight, Leaf, Globe2,
  Users, Heart, Recycle, Quote, Sparkles, Clock, MapPin, CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { AnimatedCounter } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';

/* Brown & Beige palette */
const C = {
  primary: '#6F4E37',
  dark: '#4A3428',
  coffee: '#8B5E3C',
  beige: '#F5F1E8',
  cream: '#FAF7F2',
  sand: '#E8DCCB',
  card: '#FFFDF9',
  text: '#2F2A24',
  sub: '#6B7280',
  accent: '#B08968',
};

interface Step { title: string; desc: string; icon: LucideIcon; path?: string; }
const steps: Step[] = [
  { title: 'Donate Food', desc: 'A hotel or caterer lists surplus food with quantity and pickup window.', icon: Package, path: '/services/donate-food' },
  { title: 'Verify Quality', desc: 'Temperature, hygiene, and freshness are checked against a safety checklist.', icon: ShieldCheck, path: '/services/food-quality' },
  { title: 'Volunteer Delivers', desc: 'A nearby volunteer claims the pickup and delivers it in real time.', icon: Truck, path: '/services/tracking' },
  { title: 'Certificate Earned', desc: 'The volunteer earns reward points and a verifiable certificate.', icon: Award, path: '/services/certificates' },
];

const services = [
  { title: 'Donate Food', desc: 'List surplus food for pickup.', icon: Package, path: '/services/donate-food' },
  { title: 'Food Quality', desc: 'Verify safety and freshness.', icon: ShieldCheck, path: '/services/food-quality' },
  { title: 'Live Tracking', desc: 'Track deliveries in real time.', icon: Truck, path: '/services/tracking' },
  { title: 'Certificates', desc: 'Earn and download certificates.', icon: Award, path: '/services/certificates' },
  { title: 'QR Verification', desc: 'Verify any certificate instantly.', icon: ShieldCheck, path: '/services/verify-certificate' },
  { title: 'Volunteer Dashboard', desc: 'Manage deliveries and impact.', icon: Package, path: '/dashboard/volunteer' },
];

const stats = [
  { value: 10, suffix: '', label: 'Meals Delivered', icon: Heart },
  { value: 3, suffix: '', label: 'Active Volunteers', icon: Users },
  { value: 2, suffix: '', label: 'Partner Hotels', icon: Globe2 },
  { value: 4, suffix: ' kg', label: 'CO2 Saved', icon: Recycle },
];

const features = [
  { title: 'Quality First', desc: 'Every donation passes a hygiene and freshness checklist before it reaches a plate.', icon: ShieldCheck },
  { title: 'Real-Time Tracking', desc: 'Follow each delivery live, from kitchen to community, with full transparency.', icon: Truck },
  { title: 'Verifiable Impact', desc: 'Earn certificates backed by QR codes that anyone can verify in seconds.', icon: Award },
  { title: 'Community Powered', desc: 'A growing network of volunteers, hotels, and NGOs working as one bridge.', icon: Users },
];

const testimonials = [
  { quote: 'FoodBridge turned our nightly surplus into a purpose. Pickup was seamless and the team handled everything with care.', name: 'Anita Rao', role: 'Head Chef, The Fern Kitchen', initials: 'AR' },
  { quote: 'Every pickup I complete feels meaningful. The live tracking and certificates make each delivery feel valued.', name: 'Daniel Mathew', role: 'Volunteer Coordinator', initials: 'DM' },
  { quote: 'Our shelter receives fresh, verified food within hours. It has changed how we plan our evening meals.', name: 'Sister Clara', role: 'Hope Shelter NGO', initials: 'SC' },
];

const sdgs = [
  { num: '2', title: 'Zero Hunger' },
  { num: '12', title: 'Responsible Consumption' },
  { num: '13', title: 'Climate Action' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.08, ease: [0.25, 0.4, 0.25, 1] as const } }),
};

export function HomePage() {
  return (
    <div style={{ backgroundColor: C.cream, color: C.text }} className="overflow-x-hidden">
      {/* ---------- HERO ---------- */}
      <section className="relative w-full min-h-screen flex flex-col overflow-hidden">

        {/* Full-bleed photo */}
        <div className="absolute inset-0">
          <img
            src="/images/ChatGPT_Image_Jul_27,_2026,_05_33_56_PM.png"
            alt="FoodBridge volunteers distributing surplus meals to a family during golden hour"
            className="w-full h-full object-cover object-center"
            style={{ filter: 'brightness(0.88) saturate(1.08)' }}
          />
          {/* Cinematic left-to-right dark brown gradient for text legibility */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(
                100deg,
                rgba(20,10,4,1.0) 0%,
                rgba(20,10,4,1.0) 22%,
                rgba(30,16,8,0.88) 42%,
                rgba(30,16,6,0.35) 62%,
                rgba(0,0,0,0.05) 100%
              )`,
            }}
          />
          {/* Subtle vertical vignette bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(20,12,6,0.55) 0%, transparent 100%)' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1">

          {/* ── Navbar ── */}
          <header className="w-full px-6 lg:px-10 pt-6 pb-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-3"
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: C.primary }}
                >
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="font-display text-xl font-bold tracking-tight text-white">FoodBridge</span>
                  <p className="text-[10px] text-white/50 -mt-0.5 tracking-widest uppercase">Share Food. Share Hope.</p>
                </div>
              </motion.div>

              {/* Nav links */}
              <motion.nav
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="hidden lg:flex items-center gap-8"
              >
                {['Home','About','Services','Impact','Community','Contact'].map((item) => (
                  <Link
                    key={item}
                    to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200 relative group"
                  >
                    {item}
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-300" style={{ backgroundColor: C.accent }} />
                  </Link>
                ))}
              </motion.nav>

              {/* Auth buttons */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="hidden lg:flex items-center gap-3"
              >
                <Link to="/login">
                  <span className="text-sm font-semibold text-white/80 hover:text-white px-4 py-2 rounded-xl transition-colors duration-200">
                    Login
                  </span>
                </Link>
                <Link to="/register">
                  <span
                    className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-px"
                    style={{ backgroundColor: C.primary, color: '#fff', boxShadow: `0 4px 18px -4px ${C.primary}99` }}
                  >
                    Register
                  </span>
                </Link>
              </motion.div>
            </div>
          </header>

          {/* ── Hero text ── */}
          <div className="flex-1 flex items-center">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full py-16 lg:py-24">
              <div className="max-w-[640px]">

                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
                  style={{
                    backgroundColor: 'rgba(111,78,55,0.35)',
                    border: '1px solid rgba(176,137,104,0.55)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Leaf className="h-3.5 w-3.5" style={{ color: C.sand }} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: C.sand }}>
                    Food Surplus Redistribution Platform
                  </span>
                </motion.div>

                {/* Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.48, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display font-bold leading-[1.0] tracking-[-0.04em] mb-7"
                  style={{ fontSize: 'clamp(3rem, 7.5vw, 5.5rem)', color: '#FFFFFF' }}
                >
                  Where Every<br />
                  Surplus Finds<br />
                  <span style={{ color: C.sand }}>a Purpose.</span>
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.7 }}
                  className="text-base sm:text-lg leading-[1.75] max-w-md mb-10"
                  style={{ color: 'rgba(250,247,240,0.82)' }}
                >
                  FoodBridge connects food donors, volunteers, and communities to rescue surplus food before it goes to waste, ensuring every meal reaches someone who truly needs it with dignity, safety, and care.
                </motion.p>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.78, duration: 0.6 }}
                  className="flex flex-wrap items-center gap-4"
                >
                  <Link to="/register">
                    <RippleButton
                      className="inline-flex items-center gap-2 text-base font-semibold px-8 py-4 rounded-2xl text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                      style={{
                        backgroundColor: C.primary,
                        boxShadow: `0 12px 36px -10px ${C.dark}99`,
                      }}
                    >
                      Get Started <ArrowRight className="h-4.5 w-4.5" />
                    </RippleButton>
                  </Link>
                  <Link to="/about">
                    <span
                      className="inline-flex items-center gap-2 text-base font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: '#FFFFFF',
                        border: '1.5px solid rgba(255,255,255,0.35)',
                        backdropFilter: 'blur(14px)',
                      }}
                    >
                      Learn How It Works
                    </span>
                  </Link>
                </motion.div>

                {/* Trust pills */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.95 }}
                  className="flex flex-wrap items-center gap-3 mt-10"
                >
                  {[
                    { icon: CheckCircle2, label: 'Quality Verified' },
                    { icon: ShieldCheck,  label: 'Hygiene Checked' },
                    { icon: Clock,        label: '4-Hour Pickup' },
                  ].map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded-full"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        color: 'rgba(250,247,240,0.75)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: C.sand }} />
                      {label}
                    </span>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>

          {/* ── Bottom stat strip ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.7 }}
            className="w-full"
            style={{ backgroundColor: 'rgba(20,10,4,0.6)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-white/10">
              {[
                { value: '10', label: 'Meals Delivered' },
                { value: '3', label: 'Active Volunteers' },
                { value: '2',  label: 'Partner Hotels' },
                { value: '4 kg', label: 'CO₂ Saved' },
              ].map((s) => (
                <div key={s.label} className="text-center pl-4 first:pl-0 sm:pl-6 sm:first:pl-0">
                  <p className="font-display text-2xl font-bold text-white tabular-nums">{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(250,247,240,0.55)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- ABOUT ---------- */}
      <section className="py-20 sm:py-28 px-6" style={{ backgroundColor: C.cream }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="relative"
          >
            <div className="relative rounded-[2rem] p-10 shadow-xl" style={{ backgroundColor: C.card, border: `1px solid ${C.sand}` }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="rounded-2xl p-6" style={{ backgroundColor: C.beige }}>
                    <Leaf className="h-7 w-7 mb-3" style={{ color: C.coffee }} />
                    <p className="font-display text-2xl font-bold" style={{ color: C.dark }}>Eco</p>
                    <p className="text-sm" style={{ color: C.sub }}>Surplus, not waste</p>
                  </div>
                  <div className="rounded-2xl p-6" style={{ backgroundColor: C.sand }}>
                    <Heart className="h-7 w-7 mb-3" style={{ color: C.primary }} />
                    <p className="font-display text-2xl font-bold" style={{ color: C.dark }}>Care</p>
                    <p className="text-sm" style={{ color: C.sub }}>Meals with dignity</p>
                  </div>
                </div>
                <div className="space-y-6 pt-10">
                  <div className="rounded-2xl p-6" style={{ backgroundColor: C.sand }}>
                    <Clock className="h-7 w-7 mb-3" style={{ color: C.coffee }} />
                    <p className="font-display text-2xl font-bold" style={{ color: C.dark }}>Fast</p>
                    <p className="text-sm" style={{ color: C.sub }}>Within four hours</p>
                  </div>
                  <div className="rounded-2xl p-6" style={{ backgroundColor: C.beige }}>
                    <ShieldCheck className="h-7 w-7 mb-3" style={{ color: C.primary }} />
                    <p className="font-display text-2xl font-bold" style={{ color: C.dark }}>Safe</p>
                    <p className="text-sm" style={{ color: C.sub }}>Quality verified</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div>
            <motion.span
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] mb-4 px-3.5 py-1.5 rounded-full"
              style={{ color: C.coffee, backgroundColor: `${C.accent}1A`, border: `1px solid ${C.accent}40` }}
            >
              <Sparkles className="h-3.5 w-3.5" /> About FoodBridge
            </motion.span>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.1] mb-6"
              style={{ color: C.dark }}
            >
              A warm bridge between surplus and need
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-lg leading-relaxed mb-5"
              style={{ color: C.sub }}
            >
              FoodBridge is a community-driven platform that redirects surplus food from hotels, caterers, and events to shelters and families — before it ever becomes waste.
            </motion.p>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-base leading-relaxed mb-8"
              style={{ color: C.sub }}
            >
              Every donation is quality-checked, every delivery tracked, and every contribution certified. We believe food is too precious to waste and too important to hoard.
            </motion.p>
            <Link to="/about">
              <span
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-0.5"
                style={{ backgroundColor: C.primary, color: '#FFFFFF', boxShadow: `0 10px 30px -10px ${C.primary}55` }}
              >
                Learn more about us <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="py-20 sm:py-28 px-6" style={{ backgroundColor: C.beige }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] mb-4 px-3.5 py-1.5 rounded-full"
              style={{ color: C.coffee, backgroundColor: `${C.card}`, border: `1px solid ${C.accent}40` }}
            >
              How It Works
            </motion.span>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.1]"
              style={{ color: C.dark }}
            >
              Four steps from surplus to served
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-lg mt-5 max-w-xl mx-auto leading-relaxed"
              style={{ color: C.sub }}
            >
              A guided journey that takes food from a kitchen to someone who needs it.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  className="relative rounded-2xl p-7 text-center transition-all duration-300"
                  style={{ backgroundColor: C.card, border: `1px solid ${C.sand}`, boxShadow: `0 4px 20px -8px ${C.dark}15` }}
                >
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ backgroundColor: C.primary, color: '#FFFFFF', boxShadow: `0 8px 20px -6px ${C.primary}55` }}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <span className="font-display text-xs font-semibold tracking-widest" style={{ color: C.coffee }}>
                    STEP {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-lg font-semibold mt-2 mb-2" style={{ color: C.dark }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.sub }}>{step.desc}</p>
                  {step.path && (
                    <Link to={step.path} className="inline-flex items-center gap-1 mt-3 text-xs font-medium hover:gap-2 transition-all" style={{ color: C.primary }}>
                      Open <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="py-20 sm:py-28 px-6" style={{ backgroundColor: C.cream }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] mb-4 px-3.5 py-1.5 rounded-full"
              style={{ color: C.coffee, backgroundColor: `${C.beige}`, border: `1px solid ${C.accent}40` }}
            >
              Features
            </motion.span>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.1]"
              style={{ color: C.dark }}
            >
              Crafted with care, built for trust
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  className="rounded-2xl p-7 transition-all duration-300"
                  style={{ backgroundColor: C.card, border: `1px solid ${C.sand}`, boxShadow: `0 4px 20px -8px ${C.dark}15` }}
                >
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: C.beige, color: C.coffee }}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2" style={{ color: C.dark }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.sub }}>{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- SERVICES PREVIEW ---------- */}
      <section className="py-20 sm:py-28 px-6" style={{ backgroundColor: C.beige }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <motion.span
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] mb-4 px-3.5 py-1.5 rounded-full"
              style={{ color: C.coffee, backgroundColor: C.card, border: `1px solid ${C.accent}40` }}
            >
              Services
            </motion.span>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.1]"
              style={{ color: C.dark }}
            >
              Tools that power the journey
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  className="rounded-2xl p-6 group transition-all duration-300"
                  style={{ backgroundColor: C.card, border: `1px solid ${C.sand}`, boxShadow: `0 4px 20px -8px ${C.dark}15` }}
                >
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: C.primary, color: '#FFFFFF' }}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-base font-semibold mb-1" style={{ color: C.dark }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: C.sub }}>{s.desc}</p>
                  <Link to={s.path} className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: C.primary }}>
                    Open <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link to="/services" className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all" style={{ color: C.primary }}>
              View all services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- STATISTICS ---------- */}
      <section className="py-20 sm:py-28 px-6" style={{ backgroundColor: C.dark, color: C.cream }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] mb-4 px-3.5 py-1.5 rounded-full"
              style={{ color: C.sand, backgroundColor: `${C.cream}10`, border: `1px solid ${C.accent}55` }}
            >
              Global Impact
            </motion.span>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.1]"
              style={{ color: C.cream }}
            >
              A movement measured in meals
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-lg mt-5 max-w-2xl mx-auto leading-relaxed"
              style={{ color: `${C.cream}aa` }}
            >
              FoodBridge contributes to the UN Sustainable Development Goals by reducing food waste and feeding those who need it most.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  className="text-center rounded-2xl p-8"
                  style={{ backgroundColor: `${C.cream}0a`, border: `1px solid ${C.accent}33` }}
                >
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: C.coffee, color: C.cream }}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <p className="font-display text-3xl sm:text-4xl font-bold tabular-nums" style={{ color: C.cream }}>
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-sm mt-2" style={{ color: `${C.cream}aa` }}>{s.label}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
            {sdgs.map((sdg) => (
              <span
                key={sdg.num}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${C.cream}10`, color: C.sand, border: `1px solid ${C.accent}44` }}
              >
                <span
                  className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: C.accent, color: C.dark }}
                >
                  {sdg.num}
                </span>
                {sdg.title}
              </span>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/global-impact" className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all" style={{ color: C.sand }}>
              Explore global impact <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="py-20 sm:py-28 px-6" style={{ backgroundColor: C.cream }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] mb-4 px-3.5 py-1.5 rounded-full"
              style={{ color: C.coffee, backgroundColor: C.beige, border: `1px solid ${C.accent}40` }}
            >
              Testimonials
            </motion.span>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.1]"
              style={{ color: C.dark }}
            >
              Trusted by kitchens, volunteers, and shelters
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="rounded-2xl p-8 transition-all duration-300 relative"
                style={{ backgroundColor: C.card, border: `1px solid ${C.sand}`, boxShadow: `0 4px 20px -8px ${C.dark}15` }}
              >
                <Quote className="h-9 w-9 mb-4" style={{ color: C.accent, opacity: 0.5 }} />
                <p className="text-base leading-relaxed mb-6" style={{ color: C.text }}>{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div
                    className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: C.primary, color: C.cream }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: C.dark }}>{t.name}</p>
                    <p className="text-xs" style={{ color: C.sub }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CALL TO ACTION ---------- */}
      <section className="py-20 sm:py-28 px-6" style={{ backgroundColor: C.beige }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="max-w-4xl mx-auto rounded-[2rem] px-6 py-10 sm:px-16 sm:py-20 text-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.coffee} 100%)`, boxShadow: `0 20px 60px -20px ${C.dark}55` }}
        >
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full blur-3xl" style={{ backgroundColor: `${C.accent}33` }} />
          <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: `${C.cream}14` }} />
          <div className="relative z-10">
            <Leaf className="h-8 w-8 mx-auto mb-5" style={{ color: C.sand }} />
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] leading-[1.1] mb-5" style={{ color: C.cream }}>
              Be the bridge between surplus and a meal
            </h2>
            <p className="text-lg max-w-xl mx-auto leading-relaxed mb-10" style={{ color: `${C.cream}cc` }}>
              Join hotels, volunteers, and NGOs building a warmer, zero-waste future — one meal at a time.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <span
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-0.5"
                  style={{ backgroundColor: C.cream, color: C.primary, boxShadow: `0 10px 30px -10px ${C.dark}44` }}
                >
                  Get Started <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link to="/resources/contact">
                <span
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-0.5"
                  style={{ backgroundColor: 'transparent', color: C.cream, border: `1.5px solid ${C.sand}` }}
                >
                  <MapPin className="h-4 w-4" /> Contact Us
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
