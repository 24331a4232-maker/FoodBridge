import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  HeartHandshake,
  Search,
  Hotel,
  Users,
  Package,
  Clock,
  ShieldCheck,
  MapPin,
  Leaf,
  Award,
  ArrowRight,
  ArrowDown,
  Quote,
  Building2,
  Globe2,
  Truck,
  Heart,
  Thermometer,
  ClipboardCheck,
  Mail,
  Phone,
  ChevronDown,
} from 'lucide-react';
import { AnimatedCounter, SectionHeading, fadeInUp, fadeIn, scaleIn, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { Illustration } from '@/components/Illustration';

const steps = [
  { title: 'A kitchen has extra', desc: 'A wedding ends. A banquet finishes. A hotel breakfast service closes. There is food — fresh, untouched, perfectly good — that has nowhere to go.', illustration: 'donation' as const },
  { title: 'We verify it', desc: 'Temperature, hygiene, packaging, freshness. Every donation is checked against a real safety checklist before it is approved for pickup.', illustration: 'quality' as const },
  { title: 'A neighbour steps up', desc: 'The nearest available volunteer receives the request. They accept, they ride, they carry. They are the bridge.', illustration: 'volunteers' as const },
  { title: 'It reaches a plate', desc: 'Within four hours, the food arrives at a shelter, a school, a community kitchen. Surplus becomes a meal. Waste becomes dignity.', illustration: 'delivery' as const },
];

const impactStats = [
  { label: 'Meals rescued', value: 128450, suffix: '+', icon: UtensilsCrossed },
  { label: 'Families served', value: 38900, suffix: '+', icon: Users },
  { label: 'Partner kitchens', value: 340, suffix: '+', icon: Hotel },
  { label: 'Active volunteers', value: 1560, suffix: '+', icon: HeartHandshake },
  { label: 'Shelters reached', value: 185, suffix: '+', icon: Building2 },
  { label: 'Food waste prevented', value: 42, suffix: ' t', icon: Globe2 },
];

const qualitySteps = [
  { icon: Thermometer, title: 'Temperature', desc: 'Cooked food is verified to be within a safe holding range before it leaves the kitchen.' },
  { icon: ClipboardCheck, title: 'Hygiene', desc: 'Packaging, handling and storage conditions are inspected by the volunteer on arrival.' },
  { icon: ShieldCheck, title: 'Freshness', desc: 'Each donation receives a freshness score. Anything below threshold is politely declined.' },
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

const partners = [
  { name: 'Taj Hotels', type: 'Hotel' },
  { name: 'The Leela', type: 'Hotel' },
  { name: 'ITC Group', type: 'Hotel' },
  { name: 'Hyatt', type: 'Hotel' },
  { name: 'Marriott', type: 'Hotel' },
  { name: 'Oberoi', type: 'Hotel' },
  { name: 'Hope Foundation', type: 'NGO' },
  { name: 'Feeding India', type: 'NGO' },
  { name: 'Annapurna Trust', type: 'NGO' },
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

  return (
    <div>
      {/* Hero — editorial, quiet, emotional */}
      <section ref={heroRef} className="relative min-h-[92vh] flex items-center bg-cream dark:bg-secondary-950 overflow-hidden pt-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-24 -left-10 h-80 w-80 rounded-full bg-primary-200/40 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-96 w-96 rounded-full bg-accent-200/30 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">
          <div className="text-center lg:text-left">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="eyebrow mb-7"
            >
              <Leaf className="h-3.5 w-3.5" /> A community against food waste
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="font-display text-[2.75rem] sm:text-6xl lg:text-7xl font-medium tracking-[-0.03em] leading-[1.02] text-ink dark:text-cream text-balance"
            >
              No plate<br />left empty.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-lg sm:text-xl text-ink-soft dark:text-cream/70 mt-8 max-w-xl mx-auto lg:mx-0 leading-relaxed text-pretty"
            >
              FoodBridge redirects surplus food from weddings, hotels and events to the people who need it most — within four hours, before it ever becomes waste.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-10"
            >
              <Link to="/donate-food">
                <RippleButton variant="primary" className="text-base px-7 py-3.5">
                  Donate food <ArrowRight className="h-4 w-4" />
                </RippleButton>
              </Link>
              <Link to="/register">
                <RippleButton variant="secondary" className="text-base px-7 py-3.5">
                  Become a volunteer
                </RippleButton>
              </Link>
            </motion.div>
          </div>

          {/* Premium hero illustration — community & donation */}
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

      {/* The story — a single sentence, large, breathing room */}
      <section className="bg-oat dark:bg-secondary-900 py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            className="font-display text-2xl sm:text-3xl lg:text-[2.25rem] font-medium leading-[1.3] tracking-[-0.02em] text-ink dark:text-cream text-balance"
          >
            Every year, India wastes enough food to feed a small country — while one in three families goes to bed hungry. The food exists. The will exists. What is missing is the{' '}
            <span className="text-primary-600 dark:text-primary-400 italic">bridge</span>.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-base text-ink-soft dark:text-cream/60 mt-8 max-w-xl"
          >
            We are that bridge. A network of kitchens, volunteers and shelters, connected in real time, so surplus food reaches a plate before the night ends.
          </motion.p>
        </div>
      </section>

      {/* How it works — alternating editorial rows */}
      <section className="py-28 px-6 bg-cream dark:bg-secondary-950">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            badge="How it works"
            title="From a kitchen to a plate"
            subtitle="Four steps. Four hours. One meal that would have been waste, now feeding someone who was hungry."
            center
          />
          <div className="mt-20 space-y-20">
            {steps.map((step, i) => {
              const reverse = i % 2 === 1;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7 }}
                  className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center ${reverse ? 'md:[&>*:first-child]:order-2' : ''}`}
                >
                  <div>
                    <span className="font-display text-6xl font-semibold text-primary-300 dark:text-primary-800 leading-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-semibold mt-4 text-ink dark:text-cream tracking-[-0.02em]">
                      {step.title}
                    </h3>
                    <p className="text-lg text-ink-soft dark:text-cream/60 mt-4 leading-relaxed max-w-md">
                      {step.desc}
                    </p>
                  </div>
                  <div className="flex justify-center md:justify-start">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-primary-100 dark:bg-primary-900/30 blur-2xl scale-150" />
                      <div className="relative h-40 w-40">
                        <Illustration variant={step.illustration} className="w-full h-full drop-shadow-soft" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact — big numbers, quiet presentation */}
      <section className="bg-secondary-700 dark:bg-secondary-800 py-28 px-6 text-cream">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <span className="eyebrow text-accent-300">Our impact</span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-4 tracking-[-0.02em] text-balance">
              Measured in meals, not metrics.
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12 mt-16">
            {impactStats.map((s, i) => {
              const StatIcon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="border-t border-cream/15 pt-6"
                >
                  <StatIcon className="h-5 w-5 text-accent-300 mb-3" strokeWidth={1.5} />
                  <p className="display-num text-4xl sm:text-5xl text-cream">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-sm text-cream/60 mt-2">{s.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Food quality — calm, reassuring */}
      <section className="py-28 px-6 bg-cream dark:bg-secondary-950">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            badge="Food safety"
            title="Verified, every time"
            subtitle="No shortcuts. Every donation passes through a real, physical check before it is approved for pickup."
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
            {qualitySteps.map((q, i) => {
              const QI = q.icon;
              return (
                <motion.div
                  key={q.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center md:text-left"
                >
                  <div className="inline-flex h-14 w-14 rounded-2xl-premium bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 items-center justify-center mb-5">
                    <QI className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-ink dark:text-cream">{q.title}</h3>
                  <p className="text-base text-ink-soft dark:text-cream/60 mt-3 leading-relaxed">{q.desc}</p>
                </motion.div>
              );
            })}
          </div>
          <div className="text-center mt-12">
            <Link to="/food-quality">
              <RippleButton variant="secondary">
                Read the full safety standard <ArrowRight className="h-4 w-4" />
              </RippleButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials — editorial pull-quotes */}
      <section className="bg-oat dark:bg-secondary-900 py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            badge="Voices"
            title="The people who make it real"
            subtitle="Hotel managers, volunteers, shelter coordinators. The bridge is built by them."
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {testimonials.map((t, i) => (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.12 }}
                className="flex flex-col"
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
        </div>
      </section>

      {/* Partners — quiet trust strip */}
      <section className="py-20 px-6 bg-cream dark:bg-secondary-950">
        <div className="max-w-4xl mx-auto text-center">
          <p className="eyebrow justify-center">Trusted by</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 mt-8">
            {partners.map((p) => (
              <span key={p.name} className="font-display text-lg font-medium text-ink-soft/70 dark:text-cream/40">
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — clean accordion */}
      <section className="bg-oat dark:bg-secondary-900 py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            badge="Questions"
            title="Good to know"
            subtitle="Everything you need to understand before you donate or volunteer."
            center
          />
          <div className="mt-14 space-y-3">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="card p-0 overflow-hidden group"
              >
                <summary className="flex items-center justify-between cursor-pointer p-6 font-display text-lg font-medium text-ink dark:text-cream list-none">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 text-primary-500 group-open:rotate-180 transition-transform shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-6 text-base text-ink-soft dark:text-cream/60 leading-relaxed">{faq.a}</div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA — warm, single, sincere */}
      <section className="py-28 px-6 bg-cream dark:bg-secondary-950">
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
            <h2 className="font-display text-3xl sm:text-5xl font-medium tracking-[-0.02em] text-ink dark:text-cream text-balance leading-[1.1]">
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
