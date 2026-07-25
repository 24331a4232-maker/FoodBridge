import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Recycle, TrendingDown, Users, Heart, Globe2, Leaf, Truck, Droplet, Cloud,
  Target, ShieldCheck, Zap, HandHeart, Award, UtensilsCrossed, Sprout,
  ChevronDown, ArrowRight, BarChart3, Quote, type LucideIcon,
} from 'lucide-react';
import { AnimatedCounter, fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { Illustration } from '@/components/Illustration';

interface Section {
  id: string;
  label: string;
  icon: LucideIcon;
}

const sections: Section[] = [
  { id: 'statistics', label: 'Food Waste Statistics', icon: BarChart3 },
  { id: 'hunger', label: 'Hunger Challenges', icon: Heart },
  { id: 'environment', label: 'Environmental Impact', icon: Leaf },
  { id: 'sdgs', label: 'SDG Goals', icon: Globe2 },
  { id: 'why', label: 'Why FoodBridge?', icon: ShieldCheck },
  { id: 'stories', label: 'Real Success Stories', icon: Award },
  { id: 'difference', label: 'How We Make a Difference', icon: Zap },
];

const wasteStats = [
  { value: 1300, suffix: 'M', label: 'tonnes of food wasted globally each year', icon: Recycle, color: 'from-accent-500 to-accent-500' },
  { value: 40, suffix: '%', label: 'of food produced in India is wasted', icon: TrendingDown, color: 'from-red-500 to-red-500' },
  { value: 931, suffix: 'M', label: 'tonnes of food lost or wasted worldwide', icon: BarChart3, color: 'from-gold-500 to-yellow-500' },
  { value: 33, suffix: '%', label: 'of all food produced is never consumed', icon: Droplet, color: 'from-secondary-500 to-primary-500' },
];

const hungerStats = [
  { value: 828, suffix: 'M', label: 'people go to bed hungry every night', icon: Users, color: 'from-red-500 to-accent-500' },
  { value: 189, suffix: 'M', label: 'Indians are undernourished', icon: Heart, color: 'from-red-500 to-pink-500' },
  { value: 14, suffix: 'K', label: 'children die daily from hunger-related causes', icon: UtensilsCrossed, color: 'from-gold-500 to-red-500' },
  { value: 25, suffix: '%', label: 'of the world faces moderate to severe food insecurity', icon: ShieldCheck, color: 'from-accent-500 to-yellow-500' },
];

const envStats = [
  { value: 8, suffix: '%', label: 'of global greenhouse gas emissions from food waste', icon: Cloud, color: 'from-primary-500 to-primary-500' },
  { value: 4.4, suffix: 'Gt', label: 'CO2 equivalent emitted by wasted food annually', icon: Cloud, color: 'from-slate-500 to-gray-500' },
  { value: 25, suffix: '%', label: 'of global freshwater used to grow wasted food', icon: Droplet, color: 'from-secondary-500 to-primary-500' },
  { value: 1.4, suffix: 'B ha', label: 'of land used to produce food that is never eaten', icon: Leaf, color: 'from-primary-500 to-primary-500' },
];

const sdgs = [
  { num: '2', title: 'Zero Hunger', desc: 'End hunger, achieve food security and improved nutrition, and promote sustainable agriculture.', color: 'from-gold-500 to-yellow-500' },
  { num: '3', title: 'Good Health & Well-being', desc: 'Ensure healthy lives and promote well-being for all, at all ages.', color: 'from-primary-500 to-primary-500' },
  { num: '11', title: 'Sustainable Cities', desc: 'Make cities and human settlements inclusive, safe, resilient, and sustainable.', color: 'from-accent-500 to-gold-500' },
  { num: '12', title: 'Responsible Consumption', desc: 'Ensure sustainable consumption and production patterns.', color: 'from-yellow-500 to-gold-600' },
  { num: '13', title: 'Climate Action', desc: 'Take urgent action to combat climate change and its impacts.', color: 'from-primary-500 to-primary-500' },
  { num: '17', title: 'Partnerships for Goals', desc: 'Strengthen the means of implementation and revitalize global partnerships.', color: 'from-secondary-500 to-primary-500' },
];

const whyReasons = [
  { icon: Zap, title: 'Real-time Matching', desc: 'Our platform instantly connects donors with nearby recipients, reducing food spoilage and delivery time.' },
  { icon: ShieldCheck, title: 'Food Quality Verification', desc: 'Every donation passes a freshness and quality check before delivery, ensuring safe, edible food reaches people.' },
  { icon: Award, title: 'Volunteer Certificates', desc: 'Verified volunteers earn recognized certificates, building a trusted community of trained changemakers.' },
  { icon: Truck, title: 'Live Tracking', desc: 'Track every donation from pickup to delivery with live maps, so nothing is ever lost or unaccounted for.' },
  { icon: HandHeart, title: 'Community First', desc: 'We work with orphanages, shelters, and slums - reaching the people who need help the most, first.' },
  { icon: Sprout, title: 'Sustainability Focus', desc: 'Every meal saved is less waste in landfills and less CO2 in the air - measurable environmental impact.' },
];

const successStories = [
  {
    name: 'The Grand Hotel, Bangalore',
    illustration: 'donation' as const,
    quote: 'We used to throw away 40+ meals after every banquet. FoodBridge now redirects all of it to a nearby shelter the same night. Zero waste, full hearts.',
    meals: 12400, period: '8 months',
  },
  {
    name: 'Sunrise Orphanage, Delhi',
    illustration: 'shelter' as const,
    quote: 'Our children get warm, fresh meals every evening from partner hotels. The quality verification gives us complete peace of mind about what they eat.',
    meals: 8600, period: '6 months',
  },
  {
    name: 'Rahul Verma, Volunteer',
    illustration: 'volunteers' as const,
    quote: 'I have completed 45 deliveries. The certificate I earned helped me in my college application. FoodBridge gave me purpose and a community.',
    meals: 45, period: '6 months',
  },
];

const differenceSteps = [
  { step: '01', icon: UtensilsCrossed, title: 'Donor Lists Surplus', desc: 'Hotels, events, and caterers post surplus food on FoodBridge with quantity, freshness, and pickup details.' },
  { step: '02', icon: ShieldCheck, title: 'Quality Verified', desc: 'Our food quality check scores each donation for freshness and safety before it is approved for delivery.' },
  { step: '03', icon: Zap, title: 'Volunteer Matched', desc: 'A nearby volunteer is instantly matched based on location, availability, and route optimization.' },
  { step: '04', icon: Truck, title: 'Live Tracked Delivery', desc: 'The pickup is tracked live on the map until it reaches the recipient - full transparency, zero loss.' },
  { step: '05', icon: Award, title: 'Impact Recorded', desc: 'Meals saved, CO2 avoided, and volunteer hours are logged automatically, generating certificates and impact reports.' },
];

function useActiveSection() {
  const [active, setActive] = useState(sections[0].id);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return active;
}

function SectionCard({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="scroll-mt-24"
    >
      {children}
    </motion.section>
  );
}

function StatGrid({ stats }: { stats: { value: number; suffix: string; label: string; icon: LucideIcon; color: string }[] }) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
      {stats.map((s) => (
        <motion.div key={s.label} variants={fadeInUp} whileHover={{ y: -6 }} className="card p-6 text-center group">
          <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
            <s.icon className="h-6 w-6" />
          </div>
          <p className="font-display text-3xl sm:text-4xl font-bold gradient-text">
            <AnimatedCounter value={s.value} suffix={s.suffix} />
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{s.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

function MobileAccordion({ id, label, icon: Icon, children }: { id: string; label: string; icon: LucideIcon; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="flex items-center gap-3 font-display font-semibold text-lg">
          <span className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </span>
          {label}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { PageNav } from '@/components/PageNav';
export function RealChallengesPage() {
  const active = useActiveSection();
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="pt-16 min-h-screen gradient-bg-soft">
      <PageNav crumbs={[{ label: 'Resources' }, { label: 'Real Challenges', icon: Globe2 }]} />

      {/* Hero */}
      <section ref={heroRef} className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl animate-blob" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-accent-300/20 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <span className="badge bg-white/60 dark:bg-gray-800/60 text-primary-700 dark:text-primary-300 mb-6 backdrop-blur-md">
            <Globe2 className="h-3.5 w-3.5" /> Real Challenges
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
            The reality of <span className="gradient-text">food waste & hunger</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto">
            Understanding the scale of the problem is the first step toward solving it. Explore the facts, the impact, and how FoodBridge is turning the tide.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <RippleButton onClick={() => scrollTo('statistics')} variant="primary">
              Explore the Data <ArrowRight className="h-4 w-4" />
            </RippleButton>
            <Link to="/donate-food"><RippleButton variant="secondary">Take Action</RippleButton></Link>
          </div>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
          {/* Sticky side nav (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="card p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">On this page</p>
                <nav className="space-y-1">
                  {sections.map((s) => {
                    const isActive = active === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => scrollTo(s.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <s.icon className={`h-4 w-4 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                        {s.label}
                        {isActive && <motion.span layoutId="sideActive" className="ml-auto h-2 w-2 rounded-full bg-primary-500" />}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-16 lg:space-y-20">
            {/* Desktop content sections */}
            <div className="hidden lg:block space-y-16 lg:space-y-20">
              <SectionCard id="statistics">
                <h2 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3">
                  <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-500 text-white flex items-center justify-center"><BarChart3 className="h-5 w-5" /></span>
                  Food Waste Statistics
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl">The scale of food waste is staggering - and it happens while millions go hungry. Here is the data behind the crisis.</p>
                <StatGrid stats={wasteStats} />
              </SectionCard>

              <SectionCard id="hunger">
                <h2 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3">
                  <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-red-500 text-white flex items-center justify-center"><Heart className="h-5 w-5" /></span>
                  Hunger Challenges
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl">Hunger is not a problem of scarcity - it is a problem of distribution. These numbers reveal the human cost.</p>
                <StatGrid stats={hungerStats} />
              </SectionCard>

              <SectionCard id="environment">
                <h2 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3">
                  <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-500 text-white flex items-center justify-center"><Leaf className="h-5 w-5" /></span>
                  Environmental Impact
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl">Wasted food is not just wasted nourishment - it is wasted land, water, and a major source of greenhouse gas emissions.</p>
                <StatGrid stats={envStats} />
                {/* Infographic bar */}
                <div className="card p-6 mt-8">
                  <p className="text-sm font-semibold mb-4">If food waste were a country, it would be the 3rd largest emitter of CO2 - after China and the USA.</p>
                  <div className="space-y-3">
                    {[
                      { name: 'China', val: 11, color: 'bg-red-500' },
                      { name: 'USA', val: 6.5, color: 'bg-secondary-500' },
                      { name: 'Food Waste', val: 4.4, color: 'bg-accent-500' },
                      { name: 'India', val: 2.7, color: 'bg-primary-500' },
                    ].map((c) => (
                      <div key={c.name} className="flex items-center gap-3">
                        <span className="text-xs font-medium w-20 shrink-0">{c.name}</span>
                        <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(c.val / 11) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full ${c.color} rounded-full flex items-center justify-end pr-2`}
                          >
                            <span className="text-[10px] text-white font-semibold">{c.val} Gt</span>
                          </motion.div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>

              <SectionCard id="sdgs">
                <h2 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3">
                  <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary-500 to-primary-500 text-white flex items-center justify-center"><Globe2 className="h-5 w-5" /></span>
                  UN SDG Goals
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl">FoodBridge directly contributes to 6 United Nations Sustainable Development Goals.</p>
                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
                  {sdgs.map((sdg) => (
                    <motion.div key={sdg.num} variants={fadeInUp} whileHover={{ y: -6 }} className="card p-6 group">
                      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${sdg.color} text-white flex items-center justify-center font-display text-xl font-bold mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        {sdg.num}
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-2">{sdg.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{sdg.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </SectionCard>

              <SectionCard id="why">
                <h2 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3">
                  <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center"><ShieldCheck className="h-5 w-5" /></span>
                  Why FoodBridge?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl">We are not just a donation app. FoodBridge is a complete, trusted system that solves the real problems of food redistribution.</p>
                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
                  {whyReasons.map((r) => (
                    <motion.div key={r.title} variants={fadeInUp} whileHover={{ y: -6 }} className="card p-6">
                      <div className="h-11 w-11 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                        <r.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display font-semibold text-base mb-2">{r.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{r.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </SectionCard>

              <SectionCard id="stories">
                <h2 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3">
                  <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold-500 to-accent-500 text-white flex items-center justify-center"><Award className="h-5 w-5" /></span>
                  Real Success Stories
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl">Behind every number is a real person, a real meal, and a real story of change.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                  {successStories.map((story, i) => (
                    <motion.div
                      key={story.name}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.12 }}
                      whileHover={{ y: -8 }}
                      className="card overflow-hidden group"
                    >
                      <div className="relative h-44 overflow-hidden bg-cream dark:bg-secondary-900 flex items-center justify-center p-6">
                        <Illustration variant={story.illustration} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="font-display font-semibold text-sm text-ink dark:text-cream">{story.name}</p>
                          <p className="text-white/70 text-xs">{story.period}</p>
                        </div>
                      </div>
                      <div className="p-5">
                        <Quote className="h-6 w-6 text-primary-200 dark:text-primary-900/40 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{story.quote}</p>
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                          <UtensilsCrossed className="h-4 w-4 text-accent-500" />
                          <span className="font-display font-bold text-lg gradient-text"><AnimatedCounter value={story.meals} /></span>
                          <span className="text-xs text-gray-500">meals saved</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard id="difference">
                <h2 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3">
                  <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center"><Zap className="h-5 w-5" /></span>
                  How FoodBridge Makes a Difference
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl">From surplus to served in five transparent steps - here is exactly how every meal reaches someone in need.</p>
                <div className="relative mt-12 pl-8">
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-500 to-accent-500" />
                  {differenceSteps.map((s, i) => (
                    <motion.div
                      key={s.step}
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="relative mb-8 last:mb-0"
                    >
                      <div className="absolute -left-8 h-8 w-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 text-white flex items-center justify-center shadow-lg">
                        <s.icon className="h-4 w-4" />
                      </div>
                      <div className="card p-5 ml-2">
                        <span className="text-xs font-bold text-primary-500">STEP {s.step}</span>
                        <h3 className="font-display font-semibold text-lg mt-1 mb-1">{s.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* Mobile accordion content */}
            <div className="lg:hidden space-y-4">
              <MobileAccordion id="statistics" label="Food Waste Statistics" icon={BarChart3}>
                <StatGrid stats={wasteStats} />
              </MobileAccordion>
              <MobileAccordion id="hunger" label="Hunger Challenges" icon={Heart}>
                <StatGrid stats={hungerStats} />
              </MobileAccordion>
              <MobileAccordion id="environment" label="Environmental Impact" icon={Leaf}>
                <StatGrid stats={envStats} />
                <div className="card p-5 mt-5">
                  <p className="text-sm font-semibold mb-3">If food waste were a country, it would be the 3rd largest emitter of CO2.</p>
                  <div className="space-y-2">
                    {[
                      { name: 'China', val: 11, color: 'bg-red-500' },
                      { name: 'USA', val: 6.5, color: 'bg-secondary-500' },
                      { name: 'Food Waste', val: 4.4, color: 'bg-accent-500' },
                      { name: 'India', val: 2.7, color: 'bg-primary-500' },
                    ].map((c) => (
                      <div key={c.name} className="flex items-center gap-2">
                        <span className="text-xs font-medium w-16 shrink-0">{c.name}</span>
                        <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(c.val / 11) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className={`h-full ${c.color} rounded-full flex items-center justify-end pr-2`}
                          >
                            <span className="text-[9px] text-white font-semibold">{c.val} Gt</span>
                          </motion.div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </MobileAccordion>
              <MobileAccordion id="sdgs" label="SDG Goals" icon={Globe2}>
                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 gap-4">
                  {sdgs.map((sdg) => (
                    <motion.div key={sdg.num} variants={fadeInUp} className="card p-5">
                      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${sdg.color} text-white flex items-center justify-center font-display text-lg font-bold mb-3 shadow-lg`}>
                        {sdg.num}
                      </div>
                      <h3 className="font-display font-semibold mb-1">{sdg.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{sdg.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </MobileAccordion>
              <MobileAccordion id="why" label="Why FoodBridge?" icon={ShieldCheck}>
                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 gap-4">
                  {whyReasons.map((r) => (
                    <motion.div key={r.title} variants={fadeInUp} className="card p-5">
                      <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center mb-3">
                        <r.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display font-semibold text-base mb-1">{r.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{r.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </MobileAccordion>
              <MobileAccordion id="stories" label="Real Success Stories" icon={Award}>
                <div className="space-y-4">
                  {successStories.map((story) => (
                    <div key={story.name} className="card overflow-hidden">
                      <div className="relative h-36 overflow-hidden bg-cream dark:bg-secondary-900 flex items-center justify-center p-4">
                        <Illustration variant={story.illustration} className="w-full h-full" />
                        <p className="absolute bottom-2 left-3 font-display font-semibold text-sm text-ink dark:text-cream">{story.name}</p>
                      </div>
                      <div className="p-4">
                        <Quote className="h-5 w-5 text-primary-200 dark:text-primary-900/40 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{story.quote}</p>
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                          <UtensilsCrossed className="h-4 w-4 text-accent-500" />
                          <span className="font-display font-bold gradient-text"><AnimatedCounter value={story.meals} /></span>
                          <span className="text-xs text-gray-500">meals saved</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </MobileAccordion>
              <MobileAccordion id="difference" label="How We Make a Difference" icon={Zap}>
                <div className="relative pl-7">
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-500 to-accent-500" />
                  {differenceSteps.map((s, i) => (
                    <motion.div
                      key={s.step}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="relative mb-5 last:mb-0"
                    >
                      <div className="absolute -left-7 h-7 w-7 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 text-white flex items-center justify-center shadow-lg">
                        <s.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="card p-4 ml-2">
                        <span className="text-xs font-bold text-primary-500">STEP {s.step}</span>
                        <h3 className="font-display font-semibold mt-1 mb-1">{s.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </MobileAccordion>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card p-8 sm:p-12 text-center bg-gradient-to-br from-primary-600 to-primary-500 text-white"
            >
              <Target className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">Be part of the solution</h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">Every meal saved is a step toward zero hunger. Join FoodBridge as a donor, volunteer, or partner today.</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link to="/donate-food"><RippleButton className="bg-white text-primary-700 hover:bg-white/90 !shadow-none">Donate Food</RippleButton></Link>
                <Link to="/register"><RippleButton className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-md border border-white/30 !shadow-none">Become a Volunteer</RippleButton></Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
