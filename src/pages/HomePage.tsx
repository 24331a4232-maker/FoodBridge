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
  TrendingDown,
  Award,
  ArrowRight,
  Star,
  Quote,
  ChevronDown,
  Building2,
  Globe2,
  Truck,
  Heart,
} from 'lucide-react';
import { AnimatedCounter, SectionHeading, fadeInUp, fadeIn, scaleIn, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { ImpactDashboard } from '@/components/ImpactDashboard';

const stats = [
  { label: 'Meals Saved', value: 128450, suffix: '+', icon: UtensilsCrossed },
  { label: 'Food Donations', value: 8720, suffix: '+', icon: Package },
  { label: 'Partner Hotels', value: 340, suffix: '+', icon: Hotel },
  { label: 'Cities Covered', value: 28, suffix: '', icon: MapPin },
  { label: 'Active Volunteers', value: 1560, suffix: '+', icon: Users },
];

const steps = [
  { icon: Hotel, title: 'Food Donation', desc: 'Hotels, restaurants, and event organizers donate surplus food through FoodBridge.' },
  { icon: ShieldCheck, title: 'Food Quality Verification', desc: 'Food is checked for freshness, hygiene, packaging, and safety before approval.' },
  { icon: HeartHandshake, title: 'Volunteer Assignment', desc: 'The nearest available volunteer receives the pickup request.' },
  { icon: Truck, title: 'Pickup & Delivery', desc: 'The volunteer collects the food and delivers it safely to the assigned NGO or beneficiaries.' },
  { icon: Heart, title: 'Community Impact', desc: 'Meals reach people in need, reducing food waste and fighting hunger.' },
];

const processStats = [
  { label: 'Meals Delivered', value: 128450, suffix: '+', icon: UtensilsCrossed, gradient: 'from-emerald-500 to-green-600', glow: 'shadow-emerald-500/30' },
  { label: 'Partner Hotels', value: 340, suffix: '+', icon: Hotel, gradient: 'from-teal-500 to-cyan-600', glow: 'shadow-teal-500/30' },
  { label: 'Volunteers', value: 1560, suffix: '+', icon: HeartHandshake, gradient: 'from-lime-500 to-green-600', glow: 'shadow-lime-500/30' },
  { label: 'NGOs', value: 185, suffix: '+', icon: Building2, gradient: 'from-orange-500 to-amber-500', glow: 'shadow-orange-500/30' },
  { label: 'Food Waste Reduced', value: 42, suffix: ' tons', icon: Globe2, gradient: 'from-emerald-600 to-teal-600', glow: 'shadow-emerald-600/30' },
];

const features = [
  { icon: Clock, title: 'Real-Time Matching', desc: 'Instant notifications when surplus food is available near you, with smart route matching.' },
  { icon: ShieldCheck, title: 'Verified Network', desc: 'Every donor and volunteer is verified. Safe, trusted, transparent redistribution.' },
  { icon: MapPin, title: 'Live Tracking', desc: 'Track every pickup from source to delivery with GPS-enabled live location sharing.' },
  { icon: Award, title: 'Reward Points', desc: 'Earn points and badges for every delivery. Climb the leaderboard and get certified.' },
  { icon: Leaf, title: 'Zero Waste', desc: 'Our mission is zero edible food waste. Every meal counts toward a sustainable future.' },
  { icon: TrendingDown, title: 'Impact Analytics', desc: 'See exactly how much food you saved, CO2 reduced, and lives touched - in real numbers.' },
];

const storyStats = [
  { value: 50000, suffix: '+', label: 'Meals Shared', icon: UtensilsCrossed },
  { value: 8000, suffix: '+', label: 'Families Helped', icon: Users },
  { value: 250, suffix: '+', label: 'Partner Hotels', icon: Hotel },
  { value: 1500, suffix: '+', label: 'Volunteers', icon: HeartHandshake },
];

const testimonials = [
  {
    name: 'Rajesh Mehra',
    role: 'Hotel Manager',
    city: 'Mumbai',
    date: 'March 2026',
    rating: 5,
    text: 'Our hotel has reduced food waste significantly while helping hundreds of people through FoodBridge. The pickup process is seamless and the team is incredibly professional.',
    photo: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Ananya Krishnan',
    role: 'Student Volunteer',
    city: 'Bangalore',
    date: 'February 2026',
    rating: 5,
    text: 'Volunteering with FoodBridge has been one of the most meaningful experiences of my life. Every delivery reminds me why small actions create big change.',
    photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Sister Maria Pinto',
    role: 'NGO Partner',
    city: 'Goa',
    date: 'January 2026',
    rating: 5,
    text: 'Our NGO now receives food on time, every single week. FoodBridge has become a lifeline for the children and elderly we care for.',
    photo: 'https://images.pexels.com/photos/5905786/pexels-photo-5905786.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Lakshmi Devi',
    role: 'Beneficiary',
    city: 'Chennai',
    date: 'March 2026',
    rating: 5,
    text: 'My children slept with full stomachs because of FoodBridge. Thank you for your kindness. I will never forget the warmth you brought to our family.',
    photo: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Vikram Singh',
    role: 'Event Organizer',
    city: 'Delhi',
    date: 'February 2026',
    rating: 5,
    text: 'FoodBridge made it incredibly easy to donate surplus food after our wedding event. Knowing the meals reached families instead of going to waste was deeply satisfying.',
    photo: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Priya Nair',
    role: 'Volunteer',
    city: 'Kochi',
    date: 'January 2026',
    rating: 5,
    text: 'This initiative deserves to be in every city. The quality checks, the coordination, the smiles on faces — FoodBridge does it all with genuine care.',
    photo: 'https://images.pexels.com/photos/3760790/pexels-photo-3760790.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

const partners = ['Taj Hotels', 'The Leela', 'ITC Group', 'Hyatt', 'Marriott', 'Oberoi'];

const impactStats = [
  { label: 'Meals Rescued', value: 128450, suffix: '+', icon: UtensilsCrossed, gradient: 'from-emerald-500 to-green-600', glow: 'shadow-emerald-500/30' },
  { label: 'Families Served', value: 38900, suffix: '+', icon: Users, gradient: 'from-orange-500 to-amber-500', glow: 'shadow-orange-500/30' },
  { label: 'Partner Hotels', value: 340, suffix: '+', icon: Hotel, gradient: 'from-teal-500 to-cyan-600', glow: 'shadow-teal-500/30' },
  { label: 'NGOs Connected', value: 185, suffix: '+', icon: Building2, gradient: 'from-rose-500 to-pink-600', glow: 'shadow-rose-500/30' },
  { label: 'Active Volunteers', value: 1560, suffix: '+', icon: HeartHandshake, gradient: 'from-lime-500 to-green-600', glow: 'shadow-lime-500/30' },
  { label: 'Food Waste Reduced', value: 42, suffix: ' tons', icon: Globe2, gradient: 'from-emerald-600 to-teal-600', glow: 'shadow-emerald-600/30' },
];

const faqs = [
  { q: 'How does FoodBridge ensure food safety?', a: 'Every donor and volunteer is verified. We enforce hygiene protocols, temperature checks, and a strict 4-hour delivery window for cooked food. All pickups are tracked end-to-end.' },
  { q: 'Who can donate food?', a: 'Hotels, restaurants, event organizers, marriage halls, caterers, and even corporate cafeterias. As long as the food is edible and safe, you can list it.' },
  { q: 'How do I become a volunteer?', a: 'Register as a volunteer, complete your profile, and start accepting nearby pickups. You earn reward points and can download an official certificate.' },
  { q: 'Is FoodBridge free to use?', a: 'Yes, FoodBridge is completely free for donors, volunteers, and recipient organizations. We are a non-profit initiative by FoodBridge.' },
  { q: 'What happens to food that is not picked up?', a: 'Listings expire automatically after the pickup window. Urgent donations are prioritized and pushed to more volunteers to minimize waste.' },
];

export function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div>
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-bg pt-20">
        {/* Floating blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-primary-300/30 blur-3xl animate-blob" />
          <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-accent-300/20 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-primary-400/20 blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
        </div>

        {/* Floating icons */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          {[
            { Icon: Hotel, className: 'top-24 left-[12%]', delay: 0 },
            { Icon: UtensilsCrossed, className: 'top-32 right-[14%]', delay: 0.5 },
            { Icon: Users, className: 'bottom-32 left-[18%]', delay: 1 },
            { Icon: Package, className: 'bottom-40 right-[16%]', delay: 1.5 },
          ].map(({ Icon, className, delay }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay, type: 'spring' }}
              className={`absolute ${className}`}
            >
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay }}
                className="h-16 w-16 rounded-2xl glass flex items-center justify-center text-primary-600 shadow-lg"
              >
                <Icon className="h-7 w-7" />
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto px-4 text-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="badge bg-white/60 dark:bg-gray-800/60 text-primary-700 dark:text-primary-300 mb-6 backdrop-blur-md border border-primary-200 dark:border-primary-800"
          >
            <Leaf className="h-3.5 w-3.5" /> FoodBridge
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance"
          >
            Bridging <span className="gradient-text">Surplus Food</span> with Empty Plates
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
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gray-400"
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </motion.div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-[60px] sm:h-[100px]" preserveAspectRatio="none">
            <path d="M0,60 C320,100 640,20 960,50 C1280,80 1440,40 1440,60 L1440,120 L0,120 Z" className="fill-white dark:fill-gray-950" />
          </svg>
        </div>
      </section>

      {/* Impact Dashboard */}
      <ImpactDashboard />

      {/* How FoodBridge Works */}
      <section className="section bg-gradient-to-b from-primary-50/30 to-white dark:from-primary-950/10 dark:to-gray-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-primary-300/10 blur-3xl pointer-events-none" />
        <SectionHeading badge="How FoodBridge Works" title="How FoodBridge Works" subtitle="A simple and efficient process that connects food donors, volunteers, and people in need." />

        {/* Horizontal timeline */}
        <div className="relative mt-16 max-w-7xl mx-auto">
          {/* Animated connecting line (desktop) */}
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
                  {/* Step number badge on the timeline */}
                  <div className="relative z-10 mb-5">
                    <motion.div
                      whileHover={{ scale: 1.12, rotate: 6 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 text-white flex items-center justify-center shadow-xl shadow-primary-600/30 ring-4 ring-white dark:ring-gray-950"
                    >
                      <StepIcon className="h-7 w-7" />
                    </motion.div>
                    <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white dark:bg-gray-900 border-2 border-primary-500 text-primary-600 text-xs font-bold flex items-center justify-center shadow-md">
                      {i + 1}
                    </span>
                  </div>

                  {/* Glassmorphism card */}
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="glass-card p-5 w-full relative overflow-hidden"
                  >
                    <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-gradient-to-br from-primary-400/15 to-accent-400/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="font-display font-semibold text-base mb-2 relative z-10">{step.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed relative z-10">{step.desc}</p>
                  </motion.div>

                  {/* Down arrow (mobile) */}
                  {i < steps.length - 1 && (
                    <motion.div
                      animate={{ y: [0, 6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="lg:hidden text-primary-400 mt-4"
                    >
                      <ChevronDown className="h-6 w-6" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Animated statistics */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 mt-16 max-w-7xl mx-auto"
        >
          {processStats.map((s) => {
            const StatIcon = s.icon;
            return (
              <motion.div
                key={s.label}
                variants={scaleIn}
                whileHover={{ y: -6, scale: 1.03 }}
                className="glass-card p-5 text-center relative overflow-hidden group"
              >
                <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br ${s.gradient} opacity-10 blur-2xl group-hover:opacity-25 transition-opacity duration-500`} />
                <div className={`inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br ${s.gradient} text-white items-center justify-center mb-3 shadow-lg ${s.glow} group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                  <StatIcon className="h-6 w-6" />
                </div>
                <p className="font-display text-2xl sm:text-3xl font-bold gradient-text">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Why FoodBridge - Features */}
      <section className="section">
        <SectionHeading badge="Why FoodBridge" title="Built for real impact" subtitle="Technology that makes food redistribution simple, safe, and rewarding." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="card p-6 group hover:border-primary-200 dark:hover:border-primary-800"
            >
              <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-primary-600 group-hover:to-primary-500 group-hover:text-white transition-all">
                <f.icon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Partner Logos */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.p
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-8"
        >
          Trusted by leading hospitality brands
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {partners.map((p, i) => (
            <motion.span
              key={p}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="font-display text-lg sm:text-xl font-bold text-gray-300 dark:text-gray-700 hover:text-primary-500 transition-colors cursor-default"
            >
              {p}
            </motion.span>
          ))}
        </div>
      </section>

      {/* Success Stories */}
      <section className="section bg-gradient-to-b from-white via-primary-50/20 to-white dark:from-gray-950 dark:via-primary-950/10 dark:to-gray-950">
        <SectionHeading badge="Success Stories" title="Real Stories. Real Impact." subtitle="Every meal shared creates hope, dignity, and a stronger community." />

        {/* Animated counters */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 mb-14"
        >
          {storyStats.map((s) => (
            <motion.div key={s.label} variants={scaleIn} className="glass-card p-5 sm:p-6 text-center">
              <div className="inline-flex h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white items-center justify-center mb-3 shadow-lg">
                <s.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <p className="font-display text-2xl sm:text-3xl font-bold gradient-text">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial cards - grid on desktop, scroll-snap carousel on mobile */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 flex overflow-x-auto snap-x snap-mandatory gap-4 lg:overflow-visible px-1 lg:px-0 pb-4 lg:pb-0 scroll-smooth">
          {testimonials.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.12 }}
              whileHover={{ y: -8 }}
              className="snap-center min-w-[85%] sm:min-w-[60%] lg:min-w-0 glass-card p-6 sm:p-7 flex flex-col relative overflow-hidden group"
            >
              {/* Accent gradient corner */}
              <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br from-primary-400/15 to-accent-400/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Animated quote icon */}
              <motion.div
                animate={{ rotate: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center shadow-lg mb-5"
              >
                <Quote className="h-6 w-6" />
              </motion.div>

              {/* Rating */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-accent-500 text-accent-500" />
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6 flex-1">
                "{t.text}"
              </p>

              {/* Profile + meta */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-primary-200 dark:ring-primary-800 flex-shrink-0">
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-sm truncate">{t.name}</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{t.role}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="h-3 w-3" /> {t.city} · {t.date}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Mobile scroll hint */}
        <p className="lg:hidden text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
          <ChevronDown className="h-3.5 w-3.5 rotate-[-90deg]" /> Swipe to explore more stories
        </p>
      </section>

      {/* Our Impact Stats */}
      <section className="section bg-gradient-to-b from-primary-50/30 to-white dark:from-primary-950/10 dark:to-gray-950">
        <SectionHeading badge="Our Impact" title="Real change, in real numbers" subtitle="Every meal rescued, every family served, every volunteer hour - tracked and celebrated." />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-14"
        >
          {impactStats.map((s) => {
            const StatIcon = s.icon;
            return (
              <motion.div
                key={s.label}
                variants={scaleIn}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-card p-6 sm:p-8 relative overflow-hidden group"
              >
                <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${s.gradient} opacity-10 blur-2xl group-hover:opacity-25 transition-opacity duration-500`} />
                <div className="relative flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${s.gradient} text-white flex items-center justify-center shadow-lg ${s.glow} group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                    <StatIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-display text-3xl sm:text-4xl font-bold gradient-text">
                      <AnimatedCounter value={s.value} suffix={s.suffix} />
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="section">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 p-8 sm:p-14 text-center text-white"
        >
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-orange-400/20 blur-2xl" />
          <motion.h2 variants={fadeInUp} className="font-display text-3xl sm:text-4xl font-bold mb-4 relative z-10">
            Together We Can End Food Waste
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-white/90 max-w-xl mx-auto mb-8 relative z-10">
            Every meal donated brings hope to someone in need.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link to="/donate-food">
              <RippleButton className="bg-white text-primary-700 hover:bg-gray-50 text-base px-7 py-3.5">
                Donate Food <ArrowRight className="h-4 w-4" />
              </RippleButton>
            </Link>
            <Link to="/register">
              <RippleButton variant="ghost" className="text-white hover:bg-white/10 text-base px-7 py-3.5">
                Become a Volunteer <HeartHandshake className="h-4 w-4" />
              </RippleButton>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="section bg-gradient-to-b from-primary-50/30 to-white dark:from-primary-950/10 dark:to-gray-950">
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
              <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {faq.a}
              </div>
            </motion.details>
          ))}
        </div>
      </section>

    </div>
  );
}
