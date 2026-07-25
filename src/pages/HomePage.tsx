import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  Users,
  Package,
  ShieldCheck,
  Truck,
  Award,
  ClipboardList,
  ArrowRight,
  ArrowDown,
  Leaf,
  UtensilsCrossed,
  Globe2,
  Sparkles,
  Target,
} from 'lucide-react';
import { AnimatedCounter, SectionHeading, fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { Illustration } from '@/components/Illustration';

const steps = [
  { title: 'Donate Food', desc: 'A hotel, event, or caterer lists surplus food on FoodBridge with quantity, type, and pickup window.', icon: Package, illustration: 'donation' as const },
  { title: 'Quality Check', desc: 'Temperature, hygiene, packaging, and freshness are verified against a real safety checklist.', icon: ShieldCheck, illustration: 'quality' as const },
  { title: 'Donation Listed', desc: 'Once approved, the donation appears on the live map for nearby volunteers to see and claim.', icon: ClipboardList, illustration: 'community' as const },
  { title: 'Volunteer Pickup', desc: 'The nearest available volunteer accepts the request, navigates the route, and picks up the food.', icon: HeartHandshake, illustration: 'volunteers' as const },
  { title: 'Food Delivered', desc: 'Within four hours, the food reaches a shelter, school, or community kitchen — fresh and warm.', icon: Truck, illustration: 'delivery' as const },
  { title: 'Certificate Generated', desc: 'The volunteer earns reward points and an official certificate, verifiable by QR code.', icon: Award, illustration: 'bridge' as const },
];

const impactStats = [
  { label: 'Meals Saved', value: 128450, suffix: '+', icon: UtensilsCrossed },
  { label: 'Food Waste Reduced', value: 42, suffix: ' t', icon: Globe2 },
  { label: 'Families Helped', value: 38900, suffix: '+', icon: Users },
  { label: 'Volunteers', value: 1560, suffix: '+', icon: HeartHandshake },
];

const featuredStories = [
  { name: 'The Grand Hotel, Bangalore', text: 'We used to throw away 40+ meals after every banquet. FoodBridge now redirects all of it to a nearby shelter the same night.', meals: 12400, period: '8 months' },
  { name: 'Sunrise Orphanage, Delhi', text: 'Our children get warm, fresh meals every evening from partner hotels. The quality verification gives us complete peace of mind.', meals: 8600, period: '6 months' },
  { name: 'Rahul Verma, Volunteer', text: 'I have completed 45 deliveries. The certificate I earned helped me in my college application. FoodBridge gave me purpose.', meals: 45, period: '6 months' },
];

const sdgPreview = [
  { num: '2', title: 'Zero Hunger', color: 'from-gold-500 to-yellow-500' },
  { num: '12', title: 'Responsible Consumption', color: 'from-yellow-500 to-gold-600' },
  { num: '17', title: 'Partnerships', color: 'from-secondary-500 to-primary-500' },
];

export function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);


  return (
    <div>
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-[92vh] flex items-center gradient-bg dark:bg-secondary-950 overflow-hidden pt-20">
        <div className="absolute inset-0 hero-glow pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-24 -left-10 h-80 w-80 rounded-full bg-primary-200/40 blur-3xl animate-blob" />
          <div className="absolute bottom-10 right-0 h-96 w-96 rounded-full bg-accent-200/30 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">
          <div className="text-center lg:text-left">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="eyebrow mb-7"
            >
              <Leaf className="h-3.5 w-3.5" /> Every Meal Deserves a Purpose
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="font-display text-[2.75rem] sm:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] leading-[1.02] text-ink dark:text-cream text-balance"
            >
              Every Meal<br />Deserves a Purpose.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-lg sm:text-xl text-ink-soft dark:text-cream/70 mt-8 max-w-xl mx-auto lg:mx-0 leading-relaxed text-pretty"
            >
              Connecting surplus food with people who need it most — within four hours, before it ever becomes waste.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-10"
            >
              <Link to="/services/donate-food">
                <RippleButton variant="primary" className="text-base px-7 py-3.5">
                  Donate Food <ArrowRight className="h-4 w-4" />
                </RippleButton>
              </Link>
              <Link to="/register">
                <RippleButton variant="accent" className="text-base px-7 py-3.5">
                  Become Volunteer <HeartHandshake className="h-4 w-4" />
                </RippleButton>
              </Link>
            </motion.div>
          </div>

          {/* Hero illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-100/60 via-accent-100/40 to-secondary-100/50 blur-2xl" />
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <Illustration variant="community" className="w-full h-full drop-shadow-premium" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-2 -left-2 w-28 h-28"
              >
                <Illustration variant="delivery" className="w-full h-full" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -top-2 -right-2 w-24 h-24"
              >
                <Illustration variant="donation" className="w-full h-full" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }} className="text-ink-soft/50 dark:text-cream/40">
            <ArrowDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* How FoodBridge Works — curved journey path */}
      <section className="section-wide bg-cream dark:bg-secondary-950">
        <SectionHeading
          badge="How FoodBridge Works"
          title="From a kitchen to a plate"
          subtitle="Six steps. Four hours. One meal that would have been waste, now feeding someone who was hungry."
        />
        <div className="mt-20 relative max-w-3xl mx-auto">
          {/* Curved SVG connector */}
          <svg
            className="absolute left-7 top-8 bottom-8 w-4 -z-0 pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 16 100"
          >
            <path d="M 8 0 Q 0 20 8 40 Q 16 60 8 80 Q 0 90 8 100" fill="none" stroke="currentColor" strokeWidth="2" className="text-linen dark:text-secondary-800" strokeDasharray="4 4" />
            <motion.path
              d="M 8 0 Q 0 20 8 40 Q 16 60 8 80 Q 0 90 8 100"
              fill="none"
              stroke="url(#journeyGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              pathLength={1}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
            <defs>
              <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1B4332" />
                <stop offset="60%" stopColor="#74A57F" />
                <stop offset="100%" stopColor="#8B5E3C" />
              </linearGradient>
            </defs>
          </svg>

          <div className="space-y-5">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative pl-20"
                >
                  {/* Node */}
                  <div className="absolute left-0 top-4 z-10">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative h-14 w-14 rounded-2xl-premium bg-gradient-to-br from-primary-500 to-primary-700 text-cream flex items-center justify-center shadow-glow-green ring-4 ring-cream dark:ring-secondary-950"
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.75} />
                    </motion.div>
                  </div>

                  {/* Card */}
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-display text-2xl font-semibold text-primary-300 dark:text-primary-800 leading-none">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-display text-lg font-semibold text-ink dark:text-cream tracking-[-0.02em]">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-ink-soft dark:text-cream/60 leading-relaxed">
                      {step.desc}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact — animated statistics */}
      <section className="relative overflow-hidden bg-secondary-800 dark:bg-secondary-900 py-28 px-6 text-cream">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <span className="eyebrow text-accent-300">Our Impact</span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-4 tracking-[-0.02em] text-balance">
              Measured in meals, not metrics.
            </h2>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 mt-16"
          >
            {impactStats.map((s) => {
              const StatIcon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  variants={fadeInUp}
                  className="border-t border-cream/15 pt-6"
                >
                  <StatIcon className="h-6 w-6 text-accent-300 mb-4" strokeWidth={1.5} />
                  <p className="display-num text-4xl sm:text-5xl text-cream">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-sm text-cream/60 mt-2">{s.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Featured Success Stories */}
      <section className="section bg-mist dark:bg-secondary-900">
        <SectionHeading
          badge="Featured Stories"
          title="Real deliveries, real impact"
          subtitle="Stories of food that found a second home instead of a landfill."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {featuredStories.map((s, i) => (
            <motion.figure
              key={s.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.12 }}
              className="card-hover p-7 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center font-display font-semibold text-lg">
                  {s.name[0]}
                </div>
                <div>
                  <p className="font-medium text-sm text-ink dark:text-cream">{s.name}</p>
                  <p className="text-xs text-ink-soft dark:text-cream/50">{s.period}</p>
                </div>
              </div>
              <blockquote className="text-ink-soft dark:text-cream/70 leading-relaxed flex-1">
                "{s.text}"
              </blockquote>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-linen dark:border-secondary-800">
                <span className="font-stat font-bold text-primary-600">{s.meals.toLocaleString()}</span>
                <span className="text-xs text-ink-soft dark:text-cream/50">meals saved</span>
              </div>
            </motion.figure>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/community" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:gap-2 transition-all">
            Explore more stories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* SDG Preview */}
      <section className="section bg-cream dark:bg-secondary-950">
        <SectionHeading
          badge="UN SDGs"
          title="Aligned with global goals"
          subtitle="FoodBridge directly contributes to the UN Sustainable Development Goals."
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-14 max-w-4xl mx-auto">
          {sdgPreview.map((sdg, i) => (
            <motion.div
              key={sdg.num}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="card p-6 text-center group"
            >
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${sdg.color} text-white flex items-center justify-center font-display text-xl font-bold mb-4 shadow-lg mx-auto`}>
                {sdg.num}
              </div>
              <h3 className="font-display font-semibold text-lg text-ink dark:text-cream">{sdg.title}</h3>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/global-impact" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:gap-2 transition-all">
            Explore our global impact <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section bg-mist dark:bg-secondary-900">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full bg-accent-100/60 dark:bg-accent-900/30 blur-xl" />
                <Illustration variant="bridge" className="relative w-full h-full" />
              </div>
            </div>
            <span className="eyebrow justify-center"><Sparkles className="h-3.5 w-3.5" /> Join the movement</span>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-[-0.02em] text-ink dark:text-cream text-balance leading-[1.1] mt-4">
              Tonight, somewhere near you, a kitchen will have too much.
            </h2>
            <p className="text-lg text-ink-soft dark:text-cream/60 mt-6 max-w-xl mx-auto text-pretty">
              Be the one who carries it across. It takes less time than you think.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
              <Link to="/register">
                <RippleButton variant="primary" className="text-base px-7 py-3.5">
                  Join as a volunteer <ArrowRight className="h-4 w-4" />
                </RippleButton>
              </Link>
              <Link to="/resources/contact">
                <RippleButton variant="secondary" className="text-base px-7 py-3.5">
                  Talk to us
                </RippleButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
