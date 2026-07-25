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
} from 'lucide-react';
import { AnimatedCounter, SectionHeading, fadeInUp, fadeIn, scaleIn, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';

const stats = [
  { label: 'Meals Saved', value: 128450, suffix: '+', icon: UtensilsCrossed },
  { label: 'Food Donations', value: 8720, suffix: '+', icon: Package },
  { label: 'Partner Hotels', value: 340, suffix: '+', icon: Hotel },
  { label: 'Cities Covered', value: 28, suffix: '', icon: MapPin },
  { label: 'Active Volunteers', value: 1560, suffix: '+', icon: Users },
];

const steps = [
  { icon: Hotel, title: 'Donor Lists Food', desc: 'Hotels, restaurants and event organizers post surplus food with pickup details and quantity.' },
  { icon: Search, title: 'Volunteer Finds', desc: 'Nearby volunteers browse available donations and accept pickups that match their route.' },
  { icon: Package, title: 'Safe Pickup', desc: 'Volunteer collects food at the scheduled time using hygiene-safe handling protocols.' },
  { icon: HeartHandshake, title: 'Delivered', desc: 'Food reaches orphanages, shelters and people in need - verified and tracked end-to-end.' },
];

const features = [
  { icon: Clock, title: 'Real-Time Matching', desc: 'Instant notifications when surplus food is available near you, with smart route matching.' },
  { icon: ShieldCheck, title: 'Verified Network', desc: 'Every donor and volunteer is verified. Safe, trusted, transparent redistribution.' },
  { icon: MapPin, title: 'Live Tracking', desc: 'Track every pickup from source to delivery with GPS-enabled live location sharing.' },
  { icon: Award, title: 'Reward Points', desc: 'Earn points and badges for every delivery. Climb the leaderboard and get certified.' },
  { icon: Leaf, title: 'Zero Waste', desc: 'Our mission is zero edible food waste. Every meal counts toward a sustainable future.' },
  { icon: TrendingDown, title: 'Impact Analytics', desc: 'See exactly how much food you saved, CO2 reduced, and lives touched - in real numbers.' },
];

const testimonials = [
  { name: 'Ananya Krishnan', role: 'Volunteer, Bangalore', text: 'FoodBridge changed how I spend my weekends. I have delivered over 200 meals and earned a certificate that helped my college application.', rating: 5 },
  { name: 'Rajesh Mehra', role: 'Manager, The Grand Hotel', text: 'We used to throw away buffet leftovers every night. Now FoodBridge volunteers pick it up within hours. It feels great to give back.', rating: 5 },
  { name: 'Sister Maria', role: 'Hope Orphanage', text: 'Thanks to FoodBridge, our children get fresh, warm meals from events we could never afford. This is a blessing for our community.', rating: 5 },
];

const partners = ['Taj Hotels', 'The Leela', 'ITC Group', 'Hyatt', 'Marriott', 'Oberoi'];

const galleryImages = [
  { url: 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg', title: 'Community Kitchen' },
  { url: 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg', title: 'Fresh Meals' },
  { url: 'https://images.pexels.com/photos/262896/pexels-photo-262896.jpeg', title: 'Food Drive' },
  { url: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg', title: 'Volunteer Team' },
  { url: 'https://images.pexels.com/photos/4488647/pexels-photo-4488647.jpeg', title: 'Distribution' },
  { url: 'https://images.pexels.com/photos/3214329/pexels-photo-3214329.jpeg', title: 'Happy Faces' },
];

const faqs = [
  { q: 'How does FoodBridge ensure food safety?', a: 'Every donor and volunteer is verified. We enforce hygiene protocols, temperature checks, and a strict 4-hour delivery window for cooked food. All pickups are tracked end-to-end.' },
  { q: 'Who can donate food?', a: 'Hotels, restaurants, event organizers, marriage halls, caterers, and even corporate cafeterias. As long as the food is edible and safe, you can list it.' },
  { q: 'How do I become a volunteer?', a: 'Register as a volunteer, complete your profile, and start accepting nearby pickups. You earn reward points and can download an official certificate.' },
  { q: 'Is FoodBridge free to use?', a: 'Yes, FoodBridge is completely free for donors, volunteers, and recipient organizations. We are a non-profit initiative under The Last Plate.' },
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
            <Leaf className="h-3.5 w-3.5" /> The Last Plate Initiative
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

      {/* Statistics */}
      <section className="section">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={scaleIn} whileHover={{ y: -8 }} className="card p-5 sm:p-6 text-center group">
              <div className="inline-flex h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <s.icon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="section bg-gradient-to-b from-primary-50/30 to-white dark:from-primary-950/10 dark:to-gray-950">
        <SectionHeading badge="How It Works" title="From surplus to served in 4 steps" subtitle="A simple, transparent process that gets food to those who need it - fast." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              <div className="card p-6 h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-600/30">
                    <step.icon className="h-7 w-7" />
                  </div>
                  <span className="font-display text-5xl font-bold text-primary-100 dark:text-primary-900/40">0{i + 1}</span>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 z-10 text-primary-300">
                  <ArrowRight className="h-6 w-6" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
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

      {/* Testimonials */}
      <section className="section bg-gradient-to-b from-white to-primary-50/30 dark:from-gray-950 dark:to-primary-950/10">
        <SectionHeading badge="Testimonials" title="Stories from our community" subtitle="Real people, real impact. Hear from donors, volunteers, and recipients." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="card p-6 relative hover:-translate-y-2 transition-transform duration-300"
            >
              <Quote className="h-10 w-10 text-primary-200 dark:text-primary-900/50 mb-4" />
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-accent-500 text-accent-500" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="section">
        <SectionHeading badge="Gallery" title="Impact in pictures" subtitle="Moments captured from our food redistribution drives across the country." />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-14">
          {galleryImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.03 }}
              className="relative group rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
            >
              <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="absolute bottom-4 left-4 text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">{img.title}</p>
            </motion.div>
          ))}
        </div>
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
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <motion.h2 variants={fadeInUp} className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Ready to bridge the gap?
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-white/90 max-w-xl mx-auto mb-8">
            Join thousands of donors and volunteers reducing food waste and fighting hunger every single day.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <RippleButton className="bg-white text-primary-700 hover:bg-gray-50 text-base px-7 py-3.5">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </RippleButton>
            </Link>
            <Link to="/contact">
              <RippleButton variant="ghost" className="text-white hover:bg-white/10 text-base px-7 py-3.5">
                Contact Us
              </RippleButton>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
