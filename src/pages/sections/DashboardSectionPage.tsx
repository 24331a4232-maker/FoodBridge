import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import { SectionPageHeader } from '@/components/SectionPageHeader';

const dashboards = [
  {
    title: 'Volunteer Dashboard',
    desc: 'Manage your deliveries, track your impact, earn certificates, and climb the leaderboard.',
    icon: LayoutDashboard,
    path: '/dashboard/volunteer',
    color: 'from-primary-500 to-primary-700',
    protected: true,
  },
  {
    title: 'Admin Dashboard',
    desc: 'Oversee platform operations with the Mission Control Center — users, donations, analytics, and reports.',
    icon: Building2,
    path: '/dashboard/admin',
    color: 'from-accent-500 to-accent-700',
    protected: true,
    adminOnly: true,
  },
];

export function DashboardSectionPage() {
  return (
    <div className="pt-20 min-h-screen gradient-bg-soft">
      <SectionPageHeader
        crumbs={[{ label: 'Dashboard', icon: LayoutDashboard }]}
        eyebrow="Dashboard"
        title="Your command center"
        subtitle="Access volunteer and admin dashboards to manage deliveries, track impact, and oversee operations."
        icon={LayoutDashboard}
      />
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {dashboards.map((d, i) => {
            const Icon = d.icon;
            return (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -6 }}
              >
                <Link to={d.path} className="card p-8 block h-full group">
                  <div className={`h-16 w-16 rounded-2xl-premium bg-gradient-to-br ${d.color} text-white flex items-center justify-center mb-6 shadow-lg group-hover:shadow-premium transition-shadow`}>
                    <Icon className="h-8 w-8" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-ink dark:text-cream mb-2">{d.title}</h3>
                  <p className="text-sm text-ink-soft dark:text-cream/60 leading-relaxed mb-5">{d.desc}</p>
                  {d.protected && (
                    <span className="inline-flex items-center gap-1 text-xs text-ink-soft dark:text-cream/50 mb-4">
                      <ShieldCheck className="h-3.5 w-3.5" /> {d.adminOnly ? 'Admin access required' : 'Sign in required'}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all">
                    Open dashboard <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
