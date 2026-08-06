import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Package, ShieldCheck, Truck, Award, ArrowRight, Leaf,
  Users, Heart, Recycle, Quote, Sparkles, Clock, MapPin, CheckCircle2,
  Globe2, type LucideIcon,
} from 'lucide-react';
import { AnimatedCounter, fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';

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
  { value: 4, suffix: ' kg', label: 'CO₂ Saved', icon: Recycle },
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

const trustPills = [
  { icon: CheckCircle2, label: 'Quality Verified' },
  { icon: ShieldCheck, label: 'Hygiene Checked' },
  { icon: Clock, label: '4-Hour Pickup' },
];

const heroStats = [
  { value: '10', label: 'Meals Delivered' },
  { value: '3', label: 'Active Volunteers' },
  { value: '2', label: 'Partner Hotels' },
  { value: '4 kg', label: 'CO₂ Saved' },
];

const aboutCards = [
  { icon: Leaf, title: 'Eco', desc: 'Surplus, not waste', color: 'primary' },
  { icon: Heart, title: 'Care', desc: 'Meals with dignity', color: 'accent' },
  { icon: Clock, title: 'Fast', desc: 'Within four hours', color: 'secondary' },
  { icon: ShieldCheck, title: 'Safe', desc: 'Quality verified', color: 'primary' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.08, ease: [0.25, 0.4, 0.25, 1] as const } }),
};

export function HomePage() {
  return (
    <div className="overflow-x-hidden bg-cream dark:bg-secondary-950 text-ink dark:text-cream">
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
          {/* Cinematic left-to-right gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/20 dark:from-black/95 dark:via-black/80 dark:to-black/20" />
          {/* Bottom vignette */}
          <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-t from-ink/60 to-transparent dark:from-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1 pt-20">
          {/* Hero text */}
          <div className="flex-1 flex items-center">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full py-16 lg:py-24">
              <div className="max-w-[640px]">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 glass border border-cream/20"
                >
                  <Leaf className="h-3.5 w-3.5 text-accent-400" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cream/80">
                    Food Surplus Redistribution Platform
                  </span>
                </motion.div>

                {/* Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.48, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display font-bold leading-[1.0] tracking-[-0.04em] mb-7 text-white"
                  style={{ fontSize: 'clamp(3rem, 7.5vw, 5.5rem)' }}
                >
                  Where Every<br />
                  Surplus Finds<br />
                  <span className="text-accent-400">a Purpose.</span>
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.7 }}
                  className="text-base sm:text-lg leading-[1.75] max-w-md mb-10 text-cream/80"
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
                      className="inline-flex items-center gap-2 text-base font-semibold px-8 py-4 rounded-2xl text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl bg-gradient-to-r from-primary-600 to-primary-500 shadow-xl shadow-primary-600/30"
                    >
                      Get Started <ArrowRight className="h-4.5 w-4.5" />
                    </RippleButton>
                  </Link>
                  <Link to="/about">
                    <span className="inline-flex items-center gap-2 text-base font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 glass text-cream border border-cream/30">
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
                  {trustPills.map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded-full glass border border-cream/15 text-cream/75"
                    >
                      <Icon className="h-3.5 w-3.5 text-accent-400" />
                      {label}
                    </span>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Bottom stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.7 }}
            className="w-full glass border-t border-cream/10"
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-cream/10">
              {heroStats.map((s) => (
                <div key={s.label} className="text-center pl-4 first:pl-0 sm:pl-6 sm:first:pl-0">
                  <p className="font-display text-2xl font-bold text-white tabular-nums">{s.value}</p>
                  <p className="text-xs mt-0.5 text-cream/55">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- ABOUT ---------- */}
      <section className="py-20 sm:py-28 px-6 bg-cream dark:bg-secondary-950">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="relative"
          >
            <div className="relative rounded-[2rem] p-10 shadow-premium-lg bg-white dark:bg-secondary-900 border border-linen dark:border-secondary-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {aboutCards.slice(0, 2).map((card) => (
                    <div key={card.title} className="rounded-2xl p-6 bg-oat dark:bg-secondary-800/60 transition-transform hover:scale-[1.03]">
                      <card.icon className="h-7 w-7 mb-3 text-primary-600 dark:text-primary-400" />
                      <p className="font-display text-2xl font-bold text-ink dark:text-cream">{card.title}</p>
                      <p className="text-sm text-ink-soft dark:text-cream/60">{card.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-6 pt-10">
                  {aboutCards.slice(2).map((card) => (
                    <div key={card.title} className="rounded-2xl p-6 bg-oat dark:bg-secondary-800/60 transition-transform hover:scale-[1.03]">
                      <card.icon className="h-7 w-7 mb-3 text-primary-600 dark:text-primary-400" />
                      <p className="font-display text-2xl font-bold text-ink dark:text-cream">{card.title}</p>
                      <p className="text-sm text-ink-soft dark:text-cream/60">{card.desc}</p>
                    </div>
                  ))}
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
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] mb-4 px-3.5 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/50"
            >
              <Sparkles className="h-3.5 w-3.5" /> About FoodBridge
            </motion.span>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.1] mb-6 text-ink dark:text-cream"
            >
              A warm bridge between surplus and need
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-lg leading-relaxed mb-5 text-ink-soft dark:text-cream/70"
            >
              FoodBridge is a community-driven platform that redirects surplus food from hotels, caterers, and events to shelters and families — before it ever becomes waste.
            </motion.p>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-base leading-relaxed mb-8 text-ink-soft dark:text-cream/70"
            >
              Every donation is quality-checked, every delivery tracked, and every contribution certified. We believe food is too precious to waste and too important to hoard.
            </motion.p>
            <Link to="/about">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30">
                Learn more about us <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="py-20 sm:py-28 px-6 bg-oat dark:bg-secondary-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] mb-4 px-3.5 py-1.5 rounded-full bg-white dark:bg-secondary-800 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/50"
            >
              How It Works
            </motion.span>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.1] text-ink dark:text-cream"
            >
              Four steps from surplus to served
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-lg mt-5 max-w-xl mx-auto leading-relaxed text-ink-soft dark:text-cream/70"
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
                  className="relative rounded-2xl p-7 text-center transition-all duration-300 bg-white dark:bg-secondary-800 border border-linen dark:border-secondary-700 shadow-soft"
                >
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <span className="font-display text-xs font-semibold tracking-widest text-primary-600 dark:text-primary-400">
                    STEP {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-lg font-semibold mt-2 mb-2 text-ink dark:text-cream">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft dark:text-cream/60">{step.desc}</p>
                  {step.path && (
                    <Link to={step.path} className="inline-flex items-center gap-1 mt-3 text-xs font-medium hover:gap-2 transition-all text-primary-600 dark:text-primary-400">
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
      <section className="py-20 sm:py-28 px-6 bg-cream dark:bg-secondary-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] mb-4 px-3.5 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/50"
            >
              Features
            </motion.span>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.1] text-ink dark:text-cream"
            >
              Crafted with care, built for trust
            </motion.h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeInUp}
                  whileHover={{ y: -6 }}
                  className="rounded-2xl p-7 transition-all duration-300 bg-white dark:bg-secondary-900 border border-linen dark:border-secondary-800 shadow-soft"
                >
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2 text-ink dark:text-cream">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft dark:text-cream/60">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ---------- SERVICES PREVIEW ---------- */}
      <section className="py-20 sm:py-28 px-6 bg-oat dark:bg-secondary-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <motion.span
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] mb-4 px-3.5 py-1.5 rounded-full bg-white dark:bg-secondary-800 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/50"
            >
              Services
            </motion.span>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.1] text-ink dark:text-cream"
            >
              Tools that power the journey
            </motion.h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  variants={fadeInUp}
                  whileHover={{ y: -6 }}
                  className="rounded-2xl p-6 group transition-all duration-300 bg-white dark:bg-secondary-900 border border-linen dark:border-secondary-800 shadow-soft"
                >
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-primary-600 to-primary-500 text-white">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-base font-semibold mb-1 text-ink dark:text-cream">{s.title}</h3>
                  <p className="text-sm leading-relaxed mb-4 text-ink-soft dark:text-cream/60">{s.desc}</p>
                  <Link to={s.path} className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all text-primary-600 dark:text-primary-400">
                    Open <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
          <div className="text-center mt-10">
            <Link to="/services" className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all text-primary-600 dark:text-primary-400">
              View all services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- STATISTICS ---------- */}
      <section className="py-20 sm:py-28 px-6 bg-secondary-900 dark:bg-secondary-950 text-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] mb-4 px-3.5 py-1.5 rounded-full bg-cream/10 text-accent-400 border border-accent-500/40"
            >
              Global Impact
            </motion.span>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.1] text-cream"
            >
              A movement measured in meals
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-lg mt-5 max-w-2xl mx-auto leading-relaxed text-cream/70"
            >
              FoodBridge contributes to the UN Sustainable Development Goals by reducing food waste and feeding those who need it most.
            </motion.p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  variants={fadeInUp}
                  className="text-center rounded-2xl p-8 bg-cream/5 border border-accent-500/20"
                >
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-accent-600 text-cream">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <p className="font-display text-3xl sm:text-4xl font-bold tabular-nums text-cream">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-sm mt-2 text-cream/70">{s.label}</p>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
            {sdgs.map((sdg) => (
              <span
                key={sdg.num}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-cream/10 text-accent-400 border border-accent-500/30"
              >
                <span className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold bg-accent-500 text-secondary-900">
                  {sdg.num}
                </span>
                {sdg.title}
              </span>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/global-impact" className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all text-accent-400">
              Explore global impact <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="py-20 sm:py-28 px-6 bg-cream dark:bg-secondary-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] mb-4 px-3.5 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/50"
            >
              Testimonials
            </motion.span>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.1] text-ink dark:text-cream"
            >
              Trusted by kitchens, volunteers, and shelters
            </motion.h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeInUp}
                whileHover={{ y: -6 }}
                className="rounded-2xl p-8 transition-all duration-300 relative bg-white dark:bg-secondary-900 border border-linen dark:border-secondary-800 shadow-soft"
              >
                <Quote className="h-9 w-9 mb-4 text-accent-500/50" />
                <p className="text-base leading-relaxed mb-6 text-ink dark:text-cream/90">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-primary-600 to-primary-500 text-white">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-ink dark:text-cream">{t.name}</p>
                    <p className="text-xs text-ink-soft dark:text-cream/50">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------- CALL TO ACTION ---------- */}
      <section className="py-20 sm:py-28 px-6 bg-oat dark:bg-secondary-900/40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="max-w-4xl mx-auto rounded-[2rem] px-6 py-10 sm:px-16 sm:py-20 text-center relative overflow-hidden bg-gradient-to-br from-primary-700 to-primary-600 shadow-premium-lg"
        >
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full blur-3xl bg-accent-500/20" />
          <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full blur-3xl bg-cream/10" />
          <div className="relative z-10">
            <Leaf className="h-8 w-8 mx-auto mb-5 text-accent-400" />
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] leading-[1.1] mb-5 text-cream">
              Be the bridge between surplus and a meal
            </h2>
            <p className="text-lg max-w-xl mx-auto leading-relaxed mb-10 text-cream/80">
              Join hotels, volunteers, and NGOs building a warmer, zero-waste future — one meal at a time.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <span className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-0.5 bg-cream text-primary-700 shadow-lg">
                  Get Started <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link to="/resources/contact">
                <span className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-0.5 bg-transparent text-cream border border-cream/40">
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
