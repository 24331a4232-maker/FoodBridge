import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart3, Package, Recycle, Users, FileText, ArrowRight,
  TrendingUp, TrendingDown, UtensilsCrossed, Globe2, Heart,
} from 'lucide-react';
import { AnimatedCounter, SectionHeading } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { SectionPageHeader } from '@/components/SectionPageHeader';
import { SectionTabs } from '@/components/SectionTabs';

function ImpactDashboardTab() {
  return (
    <div>
      <SectionHeading badge="Impact Dashboard" title="Mission Control Center" subtitle="Real-time platform intelligence at a glance." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
        {[
          { label: 'Meals Rescued', value: 128450, suffix: '+', growth: '+18%', icon: UtensilsCrossed, color: 'from-primary-500 to-primary-700' },
          { label: 'Families Fed', value: 38900, suffix: '+', growth: '+14%', icon: Heart, color: 'from-accent-500 to-accent-700' },
          { label: 'Food Waste Reduced', value: 42, suffix: ' t', growth: '+22%', icon: Globe2, color: 'from-secondary-500 to-primary-600' },
          { label: 'Active Volunteers', value: 1560, suffix: '+', growth: '+9%', icon: Users, color: 'from-gold-400 to-gold-600' },
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div key={k.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6 }} className="glass-card p-6 relative overflow-hidden group">
              <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${k.color} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity`} />
              <div className="relative flex items-start justify-between mb-5">
                <div className={`h-12 w-12 rounded-2xl-premium flex items-center justify-center bg-gradient-to-br ${k.color} shadow-lg`}><Icon className="h-6 w-6 text-white" /></div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-full"><TrendingUp className="h-3 w-3" /> {k.growth}</span>
              </div>
              <p className="font-stat text-3xl font-bold text-ink dark:text-cream"><AnimatedCounter value={k.value} suffix={k.suffix} /></p>
              <p className="text-sm text-ink-soft dark:text-cream/60 mt-1">{k.label}</p>
            </motion.div>
          );
        })}
      </div>
      <div className="text-center mt-10">
        <Link to="/dashboard/admin"><RippleButton variant="primary">Open full Mission Control <ArrowRight className="h-4 w-4" /></RippleButton></Link>
      </div>
    </div>
  );
}

function DonationAnalyticsTab() {
  const monthlyData = [
    { month: 'Jan', value: 8400 }, { month: 'Feb', value: 9200 }, { month: 'Mar', value: 10800 },
    { month: 'Apr', value: 11500 }, { month: 'May', value: 13200 }, { month: 'Jun', value: 14500 },
    { month: 'Jul', value: 16800 }, { month: 'Aug', value: 18200 }, { month: 'Sep', value: 19400 },
    { month: 'Oct', value: 21000 }, { month: 'Nov', value: 22800 }, { month: 'Dec', value: 24500 },
  ];
  const max = Math.max(...monthlyData.map((d) => d.value));
  return (
    <div>
      <SectionHeading badge="Donation Analytics" title="Donations over time" subtitle="Monthly donation volume across all partner hotels and events." />
      <div className="card p-8 mt-14">
        <div className="flex items-end justify-between gap-2 h-64">
          {monthlyData.map((d, i) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: `${(d.value / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.8, ease: 'easeOut' }}
                className="w-full rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-300 dark:from-primary-600 dark:to-primary-400 relative group"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-stat font-bold text-ink dark:text-cream whitespace-nowrap">{d.value.toLocaleString()}</div>
              </motion.div>
              <span className="text-xs text-ink-soft dark:text-cream/50">{d.month}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Total Donations', value: 189200, suffix: '', icon: Package },
          { label: 'This Month', value: 24500, suffix: '', icon: TrendingUp },
          { label: 'Avg per Day', value: 816, suffix: '', icon: BarChart3 },
          { label: 'Growth Rate', value: 18, suffix: '%', icon: TrendingUp },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card p-5 text-center">
              <Icon className="h-7 w-7 text-primary-500 mx-auto mb-2" />
              <p className="font-stat text-2xl font-bold gradient-text"><AnimatedCounter value={s.value} suffix={s.suffix} /></p>
              <p className="text-xs text-ink-soft dark:text-cream/60 mt-1">{s.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function WasteAnalyticsTab() {
  const wasteByCategory = [
    { label: 'Cooked Food', value: 45, color: 'bg-accent-500' },
    { label: 'Raw Produce', value: 25, color: 'bg-primary-500' },
    { label: 'Packaged', value: 18, color: 'bg-gold-500' },
    { label: 'Bakery', value: 12, color: 'bg-secondary-500' },
  ];
  return (
    <div>
      <SectionHeading badge="Food Waste Analytics" title="What we save from waste" subtitle="Breakdown of food types rescued through FoodBridge." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-14">
        <div className="card p-8">
          <h3 className="font-display font-semibold text-lg mb-6 text-ink dark:text-cream">Waste by Category</h3>
          <div className="space-y-5">
            {wasteByCategory.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="flex justify-between text-sm mb-2"><span className="text-ink dark:text-cream">{c.label}</span><span className="font-stat font-bold text-primary-600">{c.value}%</span></div>
                <div className="h-3 rounded-full bg-oat dark:bg-secondary-800 overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${c.value}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1 }} className={`h-full ${c.color} rounded-full`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="card p-8">
          <h3 className="font-display font-semibold text-lg mb-6 text-ink dark:text-cream">Environmental Impact</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'CO2 Saved', value: 154000, suffix: ' kg', icon: Globe2 },
              { label: 'Water Saved', value: 350000, suffix: ' L', icon: Recycle },
              { label: 'Land Saved', value: 1.4, suffix: ' ha', icon: TrendingDown },
              { label: 'Meals Saved', value: 128450, suffix: '+', icon: UtensilsCrossed },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl bg-primary-50 dark:bg-primary-900/20 p-4 text-center">
                  <Icon className="h-6 w-6 text-primary-500 mx-auto mb-2" />
                  <p className="font-stat text-xl font-bold gradient-text"><AnimatedCounter value={s.value} suffix={s.suffix} /></p>
                  <p className="text-xs text-ink-soft dark:text-cream/60 mt-1">{s.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function VolunteerAnalyticsTab() {
  return (
    <div>
      <SectionHeading badge="Volunteer Analytics" title="Our volunteer network" subtitle="Growth and engagement of the FoodBridge volunteer community." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
        {[
          { label: 'Active Volunteers', value: 1560, suffix: '+', icon: Users },
          { label: 'Total Deliveries', value: 24500, suffix: '+', icon: Package },
          { label: 'Volunteer Hours', value: 24500, suffix: '+', icon: TrendingUp },
          { label: 'Avg Rating', value: 4.8, suffix: '/5', icon: Heart },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card p-5 text-center">
              <Icon className="h-7 w-7 text-primary-500 mx-auto mb-2" />
              <p className="font-stat text-2xl font-bold gradient-text"><AnimatedCounter value={s.value} suffix={s.suffix} /></p>
              <p className="text-xs text-ink-soft dark:text-cream/60 mt-1">{s.label}</p>
            </motion.div>
          );
        })}
      </div>
      <div className="card p-8 mt-6">
        <h3 className="font-display font-semibold text-lg mb-6 text-ink dark:text-cream">Top Volunteer Cities</h3>
        <div className="space-y-4">
          {[
            { city: 'Bangalore', volunteers: 340, pct: 100 },
            { city: 'Delhi', volunteers: 280, pct: 82 },
            { city: 'Mumbai', volunteers: 220, pct: 65 },
            { city: 'Hyderabad', volunteers: 180, pct: 53 },
            { city: 'Chennai', volunteers: 150, pct: 44 },
          ].map((c, i) => (
            <motion.div key={c.city} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="flex justify-between text-sm mb-2"><span className="text-ink dark:text-cream">{c.city}</span><span className="font-stat font-bold text-primary-600">{c.volunteers}</span></div>
              <div className="h-2.5 rounded-full bg-oat dark:bg-secondary-800 overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${c.pct}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1 }} className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportsTab() {
  return (
    <div>
      <SectionHeading badge="Reports" title="Download impact reports" subtitle="Detailed reports on FoodBridge's operations and impact." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
        {[
          { title: 'Monthly Impact Report', desc: 'Comprehensive overview of meals, volunteers, and partnerships.', date: 'December 2025' },
          { title: 'Food Waste Audit', desc: 'Detailed breakdown of food types and quantities rescued.', date: 'Q4 2025' },
          { title: 'Volunteer Engagement', desc: 'Volunteer hours, retention, and satisfaction metrics.', date: '2025 Annual' },
          { title: 'Partner Network Report', desc: 'Hotel, shelter, and NGO partnership summaries.', date: '2025 Annual' },
          { title: 'Environmental Impact', desc: 'CO2, water, and land savings calculations.', date: 'Q4 2025' },
          { title: 'Financial Summary', desc: 'Operational costs and funding overview.', date: 'FY 2025' },
        ].map((r, i) => (
          <motion.div key={r.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} className="card p-6">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center mb-4 shadow-lg"><FileText className="h-5 w-5" /></div>
            <h3 className="font-display font-semibold text-ink dark:text-cream">{r.title}</h3>
            <p className="text-sm text-ink-soft dark:text-cream/60 mt-1">{r.desc}</p>
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-linen dark:border-secondary-800">
              <span className="text-xs text-ink-soft dark:text-cream/50">{r.date}</span>
              <RippleButton variant="ghost" className="text-xs px-3 py-1.5">Download</RippleButton>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsSectionPage() {
  return (
    <div className="pt-20 min-h-screen gradient-bg-soft">
      <SectionPageHeader
        crumbs={[{ label: 'Analytics', icon: BarChart3 }]}
        eyebrow="Analytics"
        title="Data-driven impact"
        subtitle="Explore FoodBridge's analytics — donation trends, waste reduction, volunteer engagement, and downloadable reports."
        icon={BarChart3}
      />
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <SectionTabs
          tabs={[
            { id: 'impact', label: 'Impact Dashboard', icon: BarChart3, content: <ImpactDashboardTab /> },
            { id: 'donations', label: 'Donation Analytics', icon: Package, content: <DonationAnalyticsTab /> },
            { id: 'waste', label: 'Food Waste Analytics', icon: Recycle, content: <WasteAnalyticsTab /> },
            { id: 'volunteers', label: 'Volunteer Analytics', icon: Users, content: <VolunteerAnalyticsTab /> },
            { id: 'reports', label: 'Reports', icon: FileText, content: <ReportsTab /> },
          ]}
        />
      </section>
    </div>
  );
}
