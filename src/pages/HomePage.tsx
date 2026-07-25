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
  Quote,
  Leaf,
  UtensilsCrossed,
  Globe2,
  ChevronDown,
  Sparkles,
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

const testimonials = [
  {
    name: 'Rajesh Mehra',
    role: 'Hotel Manager, Mumbai',
    text: 'We used to throw away trays of food after every banquet. Now a volunteer is at our door before the last guest leaves. It changed how our whole team thinks about surplus.',
  },
  {
    name: 'Ananya Krishnan',
    role: 'Student Volunteer, Bangalore',
    text: 'I signed up on a Sunday. By Tuesday I had delivered my first meal. The look on a child\'s face when you hand over warm food — that stays with you.',
  },
  {
    name: 'Sister Maria Pinto',
    role: 'Shelter Coordinator, Goa',
    text: 'Before FoodBridge we never knew if we would have dinner. Now we plan around it. Reliability is the real gift — the food is secondary.',
  },
];

const faqs = [
  { q: 'How does FoodBridge ensure food safety?', a: 'Every donor and volunteer is verified. We enforce hygiene protocols, temperature checks, and a strict 4-hour delivery window for cooked food. All pickups are tracked end-to-end.' },
  { q: 'Who can donate food?', a: 'Hotels, restaurants, event organizers, marriage halls, caterers, and corporate cafeterias. As long as the food is edible and safe, you can list it.' },
  { q: 'How do I become a volunteer?', a: 'Register as a volunteer, complete your profile, and start accepting nearby pickups. You earn reward points and can download an official certificate.' },
  { q: 'Is FoodBridge free to use?', a: 'Yes, FoodBridge is completely free for donors, volunteers, and recipient organizations. We are a non-profit initiative.' },
  { q: 'What happens to food that is not picked up?', a: 'Listings expire automatically after the pickup window. Urgent donations are prioritized and pushed to more volunteers to minimize waste.' },
];

export function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
              <Link to="/donate-food">
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

      {/* Testimonials — premium cards */}
      <section className="section bg-mist dark:bg-secondary-900">
        <SectionHeading
          badge="Voices"
          title="The people who make it real"
          subtitle="Hotel managers, volunteers, shelter coordinators. The bridge is built by them."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.12 }}
              className="card-hover p-7 flex flex-col"
            >
              <Quote className="h-8 w-8 text-primary-400 dark:text-primary-600 mb-5" strokeWidth={1.5} />
              <blockquote className="font-display text-lg leading-relaxed text-ink dark:text-cream/90 flex-1">
                {t.text}
              </blockquote>
              <figcaption className="flex items-center gap-3 mt-7 pt-6 border-t border-linen dark:border-secondary-800">
                <div className="h-11 w-11 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-display font-semibold text-lg ring-1 ring-linen dark:ring-secondary-700">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-medium text-sm text-ink dark:text-cream">{t.name}</p>
                  <p className="text-xs text-ink-soft dark:text-cream/50 mt-0.5">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* FAQ — accordion */}
      <section className="section bg-cream dark:bg-secondary-950">
        <SectionHeading
          badge="Questions"
          title="Good to know"
          subtitle="Everything you need to understand before you donate or volunteer."
        />
        <div className="mt-14 max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="flex items-center justify-between w-full p-6 font-display text-lg font-medium text-ink dark:text-cream text-left"
                >
                  {faq.q}
                  <ChevronDown className={`h-5 w-5 text-primary-500 shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 text-base text-ink-soft dark:text-cream/60 leading-relaxed">{faq.a}</div>
                </motion.div>
              </motion.div>
            );
          })}
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
              <Link to="/contact">
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
