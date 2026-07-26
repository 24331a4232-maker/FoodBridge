import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Package, ShieldCheck, HeartHandshake, Truck, CheckCircle2,
  Award, QrCode, ArrowRight, ArrowDown, Leaf, Sparkles, Globe2,
  type LucideIcon,
} from 'lucide-react';
import { SectionHeading } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { Illustration } from '@/components/Illustration';
import { ImpactAnalyticsDashboard } from '@/components/ImpactAnalyticsDashboard';

interface JourneyStep {
  title: string;
  desc: string;
  icon: LucideIcon;
  path?: string;
}

const journey: JourneyStep[] = [
  { title: 'Donate Food', desc: 'A hotel or caterer lists surplus food with quantity and pickup window.', icon: Package, path: '/services/donate-food' },
  { title: 'Food Quality Verification', desc: 'Temperature, hygiene, and freshness are checked against a safety checklist.', icon: ShieldCheck, path: '/services/food-quality' },
  { title: 'Volunteer Assigned', desc: 'A nearby volunteer claims the pickup from the live map.', icon: HeartHandshake, path: '/services/available-food' },
  { title: 'Live Tracking', desc: 'Follow the delivery in real time from pickup to destination.', icon: Truck, path: '/services/tracking' },
  { title: 'Food Delivered', desc: 'The meal reaches a shelter or community kitchen within four hours.', icon: CheckCircle2 },
  { title: 'Certificate Generated', desc: 'The volunteer earns reward points and an official certificate.', icon: Award, path: '/services/certificates' },
  { title: 'QR Verification', desc: 'Anyone can verify the certificate instantly by QR code or ID.', icon: QrCode, path: '/services/verify-certificate' },
];

const services = [
  { title: 'Donate Food', desc: 'List surplus food for pickup.', icon: Package, color: 'from-primary-500 to-primary-700', path: '/services/donate-food' },
  { title: 'Food Quality Verification', desc: 'Verify safety and freshness.', icon: ShieldCheck, color: 'from-secondary-500 to-primary-600', path: '/services/food-quality' },
  { title: 'Live Tracking', desc: 'Track deliveries in real time.', icon: Truck, color: 'from-gold-400 to-gold-600', path: '/services/tracking' },
  { title: 'Digital Certificates', desc: 'Earn and download certificates.', icon: Award, color: 'from-accent-400 to-gold-500', path: '/services/certificates' },
  { title: 'QR Verification', desc: 'Verify any certificate instantly.', icon: QrCode, color: 'from-primary-600 to-secondary-600', path: '/services/verify-certificate' },
  { title: 'Volunteer Dashboard', desc: 'Manage deliveries and impact.', icon: HeartHandshake, color: 'from-accent-500 to-accent-700', path: '/dashboard/volunteer' },
];

const sdgPreview = [
  { num: '2', title: 'Zero Hunger', color: 'from-gold-500 to-yellow-500' },
  { num: '12', title: 'Responsible Consumption', color: 'from-yellow-500 to-gold-600' },
  { num: '17', title: 'Partnerships', color: 'from-secondary-500 to-primary-500' },
];

const reviews = [
  { name: 'The Grand Hotel, Bangalore', text: 'We used to throw away 40+ meals after every banquet. FoodBridge now redirects all of it to a nearby shelter the same night.', meals: 12400, period: '8 months' },
  { name: 'Sunrise Orphanage, Delhi', text: 'Our children get warm, fresh meals every evening from partner hotels. The quality verification gives us complete peace of mind.', meals: 8600, period: '6 months' },
  { name: 'Rahul Verma, Volunteer', text: 'I have completed 45 deliveries. The certificate I earned helped me in my college application. FoodBridge gave me purpose.', meals: 45, period: '6 months' },
];

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center gradient-bg dark:bg-secondary-950 overflow-hidden pt-20">
        <div className="absolute inset-0 hero-glow pointer-events-none" />
        <div className="absolute top-24 -left-10 h-80 w-80 rounded-full bg-primary-200/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 h-96 w-96 rounded-full bg-accent-200/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
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
              transition={{ delay: 0.25, duration: 0.7 }}
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

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-100/60 via-accent-100/40 to-secondary-100/50 blur-2xl" />
              <Illustration variant="community" className="relative w-full h-full drop-shadow-premium" />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-ink-soft/50 dark:text-cream/40"
        >
          <ArrowDown className="h-5 w-5" />
        </motion.div>
      </section>

      {/* How It Works — progress timeline */}
      <section className="section bg-cream dark:bg-secondary-950">
        <SectionHeading
          badge="How It Works"
          title="A simple seven-step journey"
          subtitle="From a kitchen with too much to a plate that needs it — every step guided, tracked, and rewarded."
        />
        <div className="mt-16 max-w-3xl mx-auto">
          {/* Vertical progress line */}
          <div className="relative">
            <div className="absolute left-7 top-4 bottom-4 w-px bg-linen dark:bg-secondary-800" />
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              style={{ originY: 0 }}
              className="absolute left-7 top-4 bottom-4 w-px bg-gradient-to-b from-primary-500 via-secondary-500 to-gold-500"
            />

            <div className="space-y-8">
              {journey.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="relative pl-20"
                  >
                    <div className="absolute left-0 top-0 z-10">
                      <div className="h-14 w-14 rounded-2xl-premium bg-gradient-to-br from-primary-500 to-primary-700 text-cream flex items-center justify-center shadow-glow-green ring-4 ring-cream dark:ring-secondary-950">
                        <Icon className="h-6 w-6" strokeWidth={1.75} />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="font-display text-sm font-semibold text-primary-400 dark:text-primary-700">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-display text-lg font-semibold text-ink dark:text-cream tracking-[-0.02em]">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-ink-soft dark:text-cream/60 leading-relaxed">
                      {step.desc}
                    </p>
                    {step.path && (
                      <Link to={step.path} className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:gap-2 transition-all">
                        Open <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* One Analytics Graph */}
      <ImpactAnalyticsDashboard />

      {/* Services Preview */}
      <section className="section bg-cream dark:bg-secondary-950">
        <SectionHeading
          badge="Services"
          title="Tools that power the journey"
          subtitle="Six connected tools — open any one to dive in."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14 max-w-6xl mx-auto">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="card p-6 group"
              >
                <div className={`h-12 w-12 rounded-2xl-premium bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-base font-semibold text-ink dark:text-cream mb-1">{s.title}</h3>
                <p className="text-sm text-ink-soft dark:text-cream/60 leading-relaxed mb-4">{s.desc}</p>
                <Link to={s.path} className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all">
                  Open <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            );
          })}
        </div>
        <div className="text-center mt-10">
          <Link to="/services" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:gap-2 transition-all">
            View the full workflow <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Global Impact Preview */}
      <section className="section bg-mist dark:bg-secondary-900">
        <SectionHeading
          badge="Global Impact"
          title="Aligned with global goals"
          subtitle="FoodBridge directly contributes to the UN Sustainable Development Goals."
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          {sdgPreview.map((sdg, i) => (
            <motion.div
              key={sdg.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -5 }}
              className="card p-6 text-center"
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
            Explore our global impact <Globe2 className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Reviews Preview */}
      <section className="section bg-cream dark:bg-secondary-950">
        <SectionHeading
          badge="Reviews"
          title="Real deliveries, real impact"
          subtitle="Stories of food that found a second home instead of a landfill."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          {reviews.map((s, i) => (
            <motion.figure
              key={s.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center font-display font-semibold">
                  {s.name[0]}
                </div>
                <div>
                  <p className="font-medium text-sm text-ink dark:text-cream">{s.name}</p>
                  <p className="text-xs text-ink-soft dark:text-cream/50">{s.period}</p>
                </div>
              </div>
              <blockquote className="text-sm text-ink-soft dark:text-cream/70 leading-relaxed flex-1">
                "{s.text}"
              </blockquote>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-linen dark:border-secondary-800">
                <span className="font-stat font-bold text-primary-600">{s.meals.toLocaleString()}</span>
                <span className="text-xs text-ink-soft dark:text-cream/50">meals saved</span>
              </div>
            </motion.figure>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/community" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:gap-2 transition-all">
            Read more stories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section bg-mist dark:bg-secondary-900">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20">
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
