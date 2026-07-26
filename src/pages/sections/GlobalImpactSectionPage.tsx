import { motion } from 'framer-motion';
import {
  Globe2, Recycle, TrendingDown, BarChart3, Droplet, Users, Heart,
  UtensilsCrossed, ShieldCheck, Cloud, Leaf, Zap,
  Target, Handshake, MapPin,
} from 'lucide-react';
import { SectionHeading, AnimatedCounter } from '@/lib/animations';
import { SectionPageHeader } from '@/components/SectionPageHeader';
import { SectionTabs } from '@/components/SectionTabs';

const wasteStats = [
  { value: 1300, suffix: 'M', label: 'tonnes of food wasted globally each year', icon: Recycle, color: 'from-accent-500 to-accent-500' },
  { value: 40, suffix: '%', label: 'of food produced in India is wasted', icon: TrendingDown, color: 'from-red-500 to-red-500' },
  { value: 931, suffix: 'M', label: 'tonnes of food lost or wasted worldwide', icon: BarChart3, color: 'from-gold-500 to-yellow-500' },
  { value: 33, suffix: '%', label: 'of all food produced is never consumed', icon: Droplet, color: 'from-secondary-500 to-primary-500' },
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

const partners = [
  { name: 'UN FAO', desc: 'Food and Agriculture Organization — global food waste data and standards.', icon: Globe2 },
  { name: 'Feeding India', desc: 'On-the-ground distribution network across 28 cities.', icon: Heart },
  { name: 'Robin Hood Army', desc: 'Volunteer-driven surplus food redistribution partner.', icon: Users },
  { name: 'No Food Waste', desc: 'Technology and logistics partner for pickup coordination.', icon: Recycle },
];

const impactCities = [
  { name: 'Bangalore', meals: 28400, x: 52, y: 62 },
  { name: 'Delhi', meals: 22300, x: 42, y: 28 },
  { name: 'Mumbai', meals: 19100, x: 32, y: 55 },
  { name: 'Hyderabad', meals: 15200, x: 48, y: 58 },
  { name: 'Chennai', meals: 12800, x: 56, y: 68 },
  { name: 'Kolkata', meals: 9600, x: 64, y: 38 },
  { name: 'Pune', meals: 8400, x: 36, y: 58 },
  { name: 'Goa', meals: 4200, x: 40, y: 72 },
];

function StatGrid({ stats }: { stats: typeof wasteStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-6 text-center">
            <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <Icon className="h-6 w-6" />
            </div>
            <p className="font-stat text-3xl font-bold gradient-text"><AnimatedCounter value={s.value} suffix={s.suffix} /></p>
            <p className="text-sm text-ink-soft dark:text-cream/60 mt-2">{s.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

function ProblemTab() {
  return (
    <div className="space-y-16">
      <div>
        <SectionHeading badge="The Problem" title="Food waste is a global crisis" subtitle="The numbers are staggering — and unacceptable. Together we can change them." />
        <div className="mt-14"><StatGrid stats={wasteStats} /></div>
      </div>
      <div>
        <SectionHeading badge="Environmental Impact" title="Wasted food, wounded planet" subtitle="Food waste is not just a social issue — it is an environmental emergency." />
        <div className="mt-14"><StatGrid stats={envStats} /></div>
        <div className="card p-8 mt-8 max-w-3xl mx-auto">
          <p className="text-sm text-ink-soft dark:text-cream/60 text-center">
            If food waste were a country, it would be the third largest emitter of CO2 after China and the USA.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoalsTab() {
  return (
    <div>
      <SectionHeading badge="UN SDGs" title="Aligned with global goals" subtitle="FoodBridge directly contributes to 6 United Nations Sustainable Development Goals." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
        {sdgs.map((sdg, i) => (
          <motion.div key={sdg.num} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6 }} className="card p-6 group">
            <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${sdg.color} text-white flex items-center justify-center font-display text-xl font-bold mb-4 shadow-lg`}>{sdg.num}</div>
            <h3 className="font-display font-semibold text-lg mb-2 text-ink dark:text-cream">{sdg.title}</h3>
            <p className="text-sm text-ink-soft dark:text-cream/60">{sdg.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ReachTab() {
  return (
    <div className="space-y-16">
      <div>
        <SectionHeading badge="Global Statistics" title="FoodBridge by the numbers" subtitle="Our growing impact across India and beyond." />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
          {[
            { label: 'Meals Rescued', value: 128450, suffix: '+', icon: UtensilsCrossed },
            { label: 'Food Waste Reduced', value: 42, suffix: ' t', icon: Globe2 },
            { label: 'Families Helped', value: 38900, suffix: '+', icon: Users },
            { label: 'Volunteers', value: 1560, suffix: '+', icon: Heart },
            { label: 'Partner Hotels', value: 340, suffix: '+', icon: Handshake },
            { label: 'Cities', value: 28, suffix: '', icon: MapPin },
            { label: 'CO2 Saved (kg)', value: 154000, suffix: '+', icon: Leaf },
            { label: 'Volunteer Hours', value: 24500, suffix: '+', icon: Zap },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card p-6 text-center">
                <Icon className="h-8 w-8 text-primary-500 mx-auto mb-3" />
                <p className="font-stat text-2xl sm:text-3xl font-bold gradient-text"><AnimatedCounter value={s.value} suffix={s.suffix} /></p>
                <p className="text-sm text-ink-soft dark:text-cream/60 mt-2">{s.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHeading badge="World Impact Map" title="Cities we serve" subtitle="FoodBridge is active across 28 cities in India, with plans to expand globally." />
        <div className="mt-14 card p-8">
          <div className="relative w-full aspect-[4/3] max-w-2xl mx-auto rounded-2xl bg-gradient-to-br from-primary-50 via-cream to-oat dark:from-primary-950/40 dark:via-secondary-950/40 dark:to-primary-950/40 overflow-hidden border border-linen dark:border-secondary-800">
            {impactCities.map((city, i) => (
              <motion.div
                key={city.name}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                className="absolute group"
                style={{ left: `${city.x}%`, top: `${city.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <motion.div className="absolute inset-0 rounded-full bg-primary-500" animate={{ scale: [1, 2.5], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} />
                <div className="relative h-4 w-4 rounded-full bg-primary-600 ring-2 ring-white dark:ring-secondary-900 shadow-lg" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div className="bg-ink text-cream text-xs px-2.5 py-1.5 rounded-lg shadow-lg">
                    <p className="font-medium">{city.name}</p>
                    <p className="text-cream/70 text-[10px]">{city.meals.toLocaleString()} meals</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {impactCities.slice(0, 8).map((city) => (
              <div key={city.name} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
                <span className="text-ink-soft dark:text-cream/60">{city.name}</span>
                <span className="font-stat font-semibold text-primary-600 ml-auto">{(city.meals / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionHeading badge="Partnerships" title="Stronger together" subtitle="We partner with organizations that share our mission to end food waste and hunger." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-14 max-w-4xl mx-auto">
          {partners.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div key={p.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} className="card p-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shrink-0 shadow-lg">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-ink dark:text-cream">{p.name}</h3>
                  <p className="text-sm text-ink-soft dark:text-cream/60 mt-1">{p.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function GlobalImpactSectionPage() {
  return (
    <div className="pt-20 min-h-screen gradient-bg-soft">
      <SectionPageHeader
        crumbs={[{ label: 'Global Impact', icon: Globe2 }]}
        eyebrow="Global Impact"
        title="Our impact on the world"
        subtitle="FoodBridge contributes to the UN Sustainable Development Goals by reducing food waste, feeding the hungry, and building sustainable communities."
        icon={Globe2}
      />
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <SectionTabs
          tabs={[
            { id: 'problem', label: 'The Problem', icon: TrendingDown, content: <ProblemTab /> },
            { id: 'goals', label: 'UN SDGs', icon: Target, content: <GoalsTab /> },
            { id: 'reach', label: 'Our Reach', icon: MapPin, content: <ReachTab /> },
          ]}
        />
      </section>
    </div>
  );
}
