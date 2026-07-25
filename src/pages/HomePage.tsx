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
  Star,
  Quote,
  ChevronDown,
  Building2,
  Globe2,
  Truck,
  Heart,
  Thermometer,
  ClipboardCheck,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react';
import { AnimatedCounter, SectionHeading, fadeInUp, fadeIn, scaleIn, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';

const steps = [
  { icon: Hotel, title: 'Food Donation', desc: 'Hotels, restaurants, and event organizers donate surplus food through FoodBridge.' },
  { icon: ShieldCheck, title: 'Quality Verification', desc: 'Food is checked for freshness, hygiene, packaging, and safety before approval.' },
  { icon: HeartHandshake, title: 'Volunteer Assignment', desc: 'The nearest available volunteer receives the pickup request.' },
  { icon: Truck, title: 'Pickup & Delivery', desc: 'The volunteer collects the food and delivers it safely to the assigned NGO.' },
  { icon: Heart, title: 'Community Impact', desc: 'Meals reach people in need, reducing food waste and fighting hunger.' },
];

const impactStats = [
  { label: 'Meals Rescued', value: 128450, suffix: '+', icon: UtensilsCrossed, gradient: 'from-primary-600 to-primary-500', glow: 'shadow-glow-green' },
  { label: 'Families Served', value: 38900, suffix: '+', icon: Users, gradient: 'from-accent-500 to-orange-500', glow: 'shadow-glow-orange' },
  { label: 'Partner Hotels', value: 340, suffix: '+', icon: Hotel, gradient: 'from-teal-500 to-cyan-600', glow: 'shadow-teal-500/30' },
  { label: 'NGOs Connected', value: 185, suffix: '+', icon: Building2, gradient: 'from-rose-500 to-pink-600', glow: 'shadow-rose-500/30' },
  { label: 'Active Volunteers', value: 1560, suffix: '+', icon: HeartHandshake, gradient: 'from-lime-500 to-green-600', glow: 'shadow-lime-500/30' },
  { label: 'Food Waste Reduced', value: 42, suffix: ' tons', icon: Globe2, gradient: 'from-emerald-600 to-teal-600', glow: 'shadow-emerald-600/30' },
];

const qualitySteps = [
  { icon: Thermometer, title: 'Temperature Check', desc: 'Cooked food is verified to be within safe temperature ranges.' },
  { icon: ClipboardCheck, title: 'Hygiene Inspection', desc: 'Packaging, handling, and storage conditions are inspected.' },
  { icon: ShieldCheck, title: 'Freshness Scoring', desc: 'Each donation receives a freshness score before approval.' },
];

const testimonials = [
  {
    name: 'Rajesh Mehra',
    role: 'Hotel Manager',
    city: 'Mumbai',
    rating: 5,
    text: 'Our hotel has reduced food waste significantly while helping hundreds of people through FoodBridge. The pickup process is seamless and professional.',
    photo: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Ananya Krishnan',
    role: 'Student Volunteer',
    city: 'Bangalore',
    rating: 5,
    text: 'Volunteering with FoodBridge has been one of the most meaningful experiences of my life. Every delivery reminds me why small actions create big change.',
    photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Sister Maria Pinto',
    role: 'NGO Partner',
    city: 'Goa',
    rating: 5,
    text: 'Our NGO now receives food on time, every single week. FoodBridge has become a lifeline for the children and elderly we care for.',
    photo: 'https://images.pexels.com/photos/5905786/pexels-photo-5905786.jpeg?auto=compress&cs=tinysrgb&w=400',
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
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="gradient-bg-soft">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-primary-300/30 blur-3xl animate-blob" />
          <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-accent-300/20 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-primary-400/20 blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
          <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="badge bg-white/70 dark:bg-gray-800/60 text-primary-700 dark:text-primary-300 mb-6 backdrop-blur-md border border-primary-200/60 dark:border-primary-800/50 shadow-soft"
          >
            <Sparkles className="h-3.5 w-3.5" /> FoodBridge Initiative
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.05]"
          >
            Bridging <span className="gradient-text">Surplus Food</span><br className="hidden sm:block" /> with Empty Plates
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto leading-relaxed"
          >
            FoodBridge connects hotels, restaurants, caterers and event organizers with trusted volunteers who safely redistribute surplus food to people in need.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-10"
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
            <Link to="/available-food">
              <RippleButton variant="secondary" className="text-base px-7 py-3.5">
                Explore Donations <Search className="h-4 w-4" />
              </RippleButton>
            </Link>
          </motion.div>

          {/* Floating stat preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
          >
            {[
              { label: 'Meals Rescued', value: 128450, suffix: '+' },
              { label: 'Volunteers', value: 1560, suffix: '+' },
              { label: 'Partner Hotels', value: 340, suffix: '+' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-stat text-2xl sm:text-3xl font-bold gradient-text">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-gray-400">
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </motion.div>
      </section>

      {/* How FoodBridge Works */}
      <section className="section">
        <SectionHeading badge="How It Works" title="How FoodBridge Works" subtitle="A simple process that connects food donors, volunteers, and people in need." />
        <div className="relative mt-14 max-w-7xl mx-auto">
          <div className="hidden lg:block absolute top-14 left-[10%] right-[10%] h-1 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              className="h-full origin-left rounded-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500"
            />
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4"
          >
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <motion.div key={step.title} variants={scaleIn} className="relative flex flex-col items-center text-center group">
                  <div className="relative z-10 mb-5">
                    <motion.div
                      whileHover={{ scale: 1.12 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="h-16 w-16 rounded-2xl-premium bg-gradient-to-br from-primary-600 to-accent-500 text-white flex items-center justify-center shadow-glow-green ring-4 ring-ivory dark:ring-gray-950"
                    >
                      <StepIcon className="h-7 w-7" />
                    </motion.div>
                    <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white dark:bg-gray-900 border-2 border-primary-500 text-primary-600 text-xs font-bold flex items-center justify-center shadow-soft">
                      {i + 1}
                    </span>
                  </div>
                  <motion.div whileHover={{ y: -8 }} className="glass-card p-5 w-full">
                    <h3 className="font-display font-semibold text-base mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                  </motion.div>
                  {i < steps.length - 1 && (
                    <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} className="lg:hidden text-primary-400 mt-4">
                      <ChevronDown className="h-6 w-6" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Food Quality Section */}
      <section className="section bg-gradient-to-b from-primary-50/40 to-ivory dark:from-primary-950/10 dark:to-gray-950">
        <SectionHeading badge="Food Safety" title="Verified Food Quality" subtitle="Every donation goes through a rigorous quality check before it reaches those in need." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          {qualitySteps.map((q, i) => {
            const QI = q.icon;
            return (
              <motion.div
                key={q.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="card-hover p-6 text-center group"
              >
                <div className="inline-flex h-14 w-14 rounded-2xl-premium bg-gradient-to-br from-primary-500 to-accent-500 text-white items-center justify-center mb-4 shadow-glow-green group-hover:scale-110 transition-transform">
                  <QI className="h-7 w-7" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{q.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{q.desc}</p>
              </motion.div>
            );
          })}
        </div>
        <div className="text-center mt-8">
          <Link to="/food-quality">
            <RippleButton variant="secondary">
              Learn More About Food Quality <ArrowRight className="h-4 w-4" />
            </RippleButton>
          </Link>
        </div>
      </section>

      {/* Our Impact - Animated Statistics */}
      <section className="section">
        <SectionHeading badge="Our Impact" title="Real change, in real numbers" subtitle="Every meal rescued, every family served, every volunteer hour — tracked and celebrated." />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6 mt-14 max-w-5xl mx-auto"
        >
          {impactStats.map((s) => {
            const StatIcon = s.icon;
            return (
              <motion.div key={s.label} variants={scaleIn} whileHover={{ y: -6 }} className="card-hover p-5 sm:p-6 text-center relative overflow-hidden group">
                <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br ${s.gradient} opacity-10 blur-2xl group-hover:opacity-25 transition-opacity duration-500`} />
                <div className={`inline-flex h-12 w-12 rounded-2xl-premium bg-gradient-to-br ${s.gradient} text-white items-center justify-center mb-3 ${s.glow} group-hover:scale-110 transition-transform duration-300`}>
                  <StatIcon className="h-6 w-6" />
                </div>
                <p className="font-stat text-2xl sm:text-3xl font-bold gradient-text">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="section bg-gradient-to-b from-accent-50/30 to-ivory dark:from-accent-950/10 dark:to-gray-950">
        <SectionHeading badge="Testimonials" title="Real Stories. Real Impact." subtitle="Every meal shared creates hope, dignity, and a stronger community." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ y: -8 }}
              className="card-hover p-6 sm:p-7 flex flex-col relative overflow-hidden group"
            >
              <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br from-primary-400/15 to-accent-400/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="h-12 w-12 rounded-2xl-premium bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center shadow-glow-green mb-5">
                <Quote className="h-6 w-6" />
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-accent-500 text-accent-500" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6 flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-primary-200 dark:ring-primary-800 flex-shrink-0">
                  <img src={t.photo} alt={t.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-sm truncate">{t.name}</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{t.role}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="h-3 w-3" /> {t.city}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Partner Hotels & NGOs */}
      <section className="section">
        <SectionHeading badge="Our Partners" title="Partner Hotels & NGOs" subtitle="Trusted by leading hospitality brands and NGOs across India." />
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-12 max-w-4xl mx-auto">
          {partners.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl-premium glass-card ${p.type === 'Hotel' ? 'border-primary-200/50' : 'border-accent-200/50'}`}
            >
              {p.type === 'Hotel' ? (
                <Hotel className="h-5 w-5 text-primary-500" />
              ) : (
                <Building2 className="h-5 w-5 text-accent-500" />
              )}
              <span className="font-display font-semibold text-sm sm:text-base">{p.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-gradient-to-b from-primary-50/30 to-ivory dark:from-primary-950/10 dark:to-gray-950">
        <SectionHeading badge="FAQ" title="Frequently asked questions" subtitle="Everything you need to know about donating and volunteering with FoodBridge." />
        <div className="max-w-3xl mx-auto mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card p-0 overflow-hidden group"
            >
              <summary className="flex items-center justify-between cursor-pointer p-5 font-medium list-none">
                {faq.q}
                <ChevronDown className="h-5 w-5 text-primary-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</div>
            </motion.details>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl-premium bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 p-8 sm:p-14 text-center text-white max-w-4xl mx-auto shadow-premium-lg"
        >
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-orange-400/20 blur-2xl" />
          <motion.h2 variants={fadeInUp} className="font-display text-3xl sm:text-4xl font-bold mb-4 relative z-10">
            Get in Touch
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-white/90 max-w-xl mx-auto mb-8 relative z-10">
            Have questions about donating food or volunteering? We're here to help you make a difference.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link to="/contact">
              <RippleButton className="bg-white text-primary-700 hover:bg-gray-50 text-base px-7 py-3.5">
                <Mail className="h-4 w-4" /> Contact Us
              </RippleButton>
            </Link>
            <a href="tel:+918012345678">
              <RippleButton variant="ghost" className="text-white hover:bg-white/10 text-base px-7 py-3.5">
                <Phone className="h-4 w-4" /> Call Us
              </RippleButton>
            </a>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
