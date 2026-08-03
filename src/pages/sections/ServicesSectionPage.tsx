import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Package, ShieldCheck, Truck, QrCode, Award,
  ArrowRight, UtensilsCrossed, HeartHandshake, ClipboardList,
  type LucideIcon,
} from 'lucide-react';
import { SectionPageHeader } from '@/components/SectionPageHeader';

interface ServiceStep {
  step: number;
  title: string;
  desc: string;
  icon: LucideIcon;
  path: string;
  color: string;
  badge: string;
}

const workflow: ServiceStep[] = [
  {
    step: 1,
    title: 'Donate Food',
    desc: 'Hotels, caterers, and events list surplus food with quantity, type, and pickup window.',
    icon: Package,
    path: '/services/donate-food',
    color: 'from-primary-500 to-primary-700',
    badge: 'Start here',
  },
  {
    step: 2,
    title: 'Food Quality Verification',
    desc: 'Temperature, hygiene, packaging, and freshness are verified against a safety checklist.',
    icon: ShieldCheck,
    path: '/services/food-quality',
    color: 'from-secondary-500 to-primary-600',
    badge: 'Safety first',
  },
  {
    step: 3,
    title: 'Volunteer Assignment',
    desc: 'Approved donations appear on the live map for nearby volunteers to claim and pick up.',
    icon: HeartHandshake,
    path: '/services/available-food',
    color: 'from-accent-500 to-accent-700',
    badge: 'Community',
  },
  {
    step: 4,
    title: 'Live Donation Tracking',
    desc: 'Track every delivery in real time from pickup to destination — fresh and on time.',
    icon: Truck,
    path: '/services/tracking',
    color: 'from-gold-400 to-gold-600',
    badge: 'Real-time',
  },
  {
    step: 5,
    title: 'Certificate Generation',
    desc: 'Volunteers earn reward points and an official certificate for every completed delivery.',
    icon: Award,
    path: '/services/certificates',
    color: 'from-accent-400 to-gold-500',
    badge: 'Rewards',
  },
  {
    step: 6,
    title: 'QR Verification',
    desc: 'Verify any certificate instantly by scanning its QR code or entering the certificate ID.',
    icon: QrCode,
    path: '/services/verify-certificate',
    color: 'from-primary-600 to-secondary-600',
    badge: 'Trust',
  },
];

export function ServicesSectionPage() {
  return (
    <div className="pt-20 min-h-screen gradient-bg-soft">
      <SectionPageHeader
        crumbs={[{ label: 'Services', icon: UtensilsCrossed }]}
        eyebrow="Services Hub"
        title="The FoodBridge workflow"
        subtitle="Six connected steps that take surplus food from a kitchen to someone who needs it — follow the journey in order."
        icon={UtensilsCrossed}
      />

      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        {/* Workflow connector line (desktop) */}
        <div className="hidden lg:block relative max-w-5xl mx-auto mb-2">
          <svg className="absolute top-20 left-0 right-0 h-1 -z-0 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 2">
            <motion.path
              d="M 0 1 L 100 1"
              fill="none"
              stroke="url(#workflowGradient)"
              strokeWidth="0.5"
              strokeLinecap="round"
              pathLength={1}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
            />
            <defs>
              <linearGradient id="workflowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1B4332" />
                <stop offset="35%" stopColor="#74A57F" />
                <stop offset="65%" stopColor="#C9A66B" />
                <stop offset="100%" stopColor="#8B5E3C" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Premium numbered workflow cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {workflow.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="relative"
              >
                <Link to={s.path} className="card p-7 block h-full group relative overflow-hidden">
                  {/* Step number watermark */}
                  <span className="absolute -top-4 -right-2 font-display text-6xl sm:text-8xl font-bold text-primary-100/60 dark:text-primary-900/30 select-none pointer-events-none">
                    {String(s.step).padStart(2, '0')}
                  </span>

                  {/* Step badge */}
                  <span className="relative inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-full mb-5">
                    <ClipboardList className="h-3 w-3" /> Step {s.step}
                  </span>

                  <div className={`relative h-14 w-14 rounded-2xl-premium bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-5 shadow-lg group-hover:shadow-premium transition-shadow`}>
                    <Icon className="h-7 w-7" strokeWidth={1.75} />
                  </div>

                  <h3 className="relative font-display text-lg font-semibold text-ink dark:text-cream mb-2">{s.title}</h3>
                  <p className="relative text-sm text-ink-soft dark:text-cream/60 leading-relaxed mb-5">{s.desc}</p>

                  <div className="relative flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all">
                      Open <ArrowRight className="h-4 w-4" />
                    </span>
                    <span className="text-[11px] font-medium text-ink-soft/60 dark:text-cream/40">{s.badge}</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-14"
        >
          <p className="text-ink-soft dark:text-cream/60 mb-5">Ready to start the journey?</p>
          <Link to="/services/donate-food" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-base">
            <Package className="h-4 w-4" /> Begin with Donate Food <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
