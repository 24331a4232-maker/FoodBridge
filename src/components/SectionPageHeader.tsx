import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { PageNav, type Crumb } from '@/components/PageNav';

interface SectionPageHeaderProps {
  crumbs: Crumb[];
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}

export function SectionPageHeader({ crumbs, eyebrow, title, subtitle, icon: Icon, children }: SectionPageHeaderProps) {
  return (
    <>
      <PageNav crumbs={crumbs} />
      <section className="relative overflow-hidden pt-4 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute -top-10 right-0 h-48 w-48 rounded-full bg-primary-100/40 dark:bg-primary-900/20 blur-3xl pointer-events-none" />
        <div className="absolute -top-4 left-1/4 h-32 w-32 rounded-full bg-gold-100/30 dark:bg-gold-900/10 blur-3xl pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl-premium bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow-green">
              <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
            </div>
            <span className="eyebrow">{eyebrow}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink dark:text-cream tracking-[-0.02em]">{title}</h1>
          <p className="text-lg text-ink-soft dark:text-cream/60 mt-3 max-w-2xl">{subtitle}</p>
          {children}
        </motion.div>
      </section>
    </>
  );
}
