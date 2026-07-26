import { motion } from 'framer-motion';
import { BarChart3, FileText } from 'lucide-react';
import { SectionPageHeader } from '@/components/SectionPageHeader';
import { SectionTabs } from '@/components/SectionTabs';
import { SectionHeading } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { UnifiedImpactGraph } from '@/components/ImpactAnalyticsDashboard';

function ImpactGraphTab() {
  return (
    <div>
      <SectionHeading
        badge="Unified Analytics"
        title="The FoodBridge Impact Graph"
        subtitle="One elegant view of donations, volunteers, food waste prevented, and families helped across the last 12 months."
      />
      <div className="mt-14">
        <UnifiedImpactGraph />
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
        subtitle="One unified, interactive view of FoodBridge's impact — donations, volunteers, food waste prevented, and families helped."
        icon={BarChart3}
      />
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <SectionTabs
          tabs={[
            { id: 'impact-graph', label: 'Impact Graph', icon: BarChart3, content: <ImpactGraphTab /> },
            { id: 'reports', label: 'Reports', icon: FileText, content: <ReportsTab /> },
          ]}
        />
      </section>
    </div>
  );
}
