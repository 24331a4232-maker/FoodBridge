import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Package, Search, ShieldCheck, Truck, QrCode, Award,
  ArrowRight, UtensilsCrossed,
} from 'lucide-react';
import { SectionPageHeader } from '@/components/SectionPageHeader';

const services = [
  { title: 'Donate Food', desc: 'List surplus food for pickup with quantity, type, and pickup window.', icon: Package, path: '/services/donate-food', color: 'from-primary-500 to-primary-700' },
  { title: 'Available Donations', desc: 'Browse and claim nearby food donations on the live map.', icon: Search, path: '/services/available-food', color: 'from-secondary-500 to-primary-600' },
  { title: 'Food Quality Verification', desc: 'Check food safety standards with our quality scoring system.', icon: ShieldCheck, path: '/services/food-quality', color: 'from-accent-500 to-accent-700' },
  { title: 'Donation Tracking', desc: 'Track deliveries in real time from pickup to destination.', icon: Truck, path: '/services/tracking', color: 'from-gold-400 to-gold-600' },
  { title: 'QR Verification', desc: 'Verify a certificate by QR code or certificate ID.', icon: QrCode, path: '/services/verify-certificate', color: 'from-primary-600 to-secondary-600' },
  { title: 'Certificates', desc: 'View, download, and manage your volunteer certificates.', icon: Award, path: '/services/certificates', color: 'from-accent-400 to-gold-500' },
];

export function ServicesSectionPage() {
  return (
    <div className="pt-20 min-h-screen gradient-bg-soft">
      <SectionPageHeader
        crumbs={[{ label: 'Services', icon: Package }]}
        eyebrow="Services"
        title="Everything FoodBridge offers"
        subtitle="From donating surplus food to tracking deliveries and earning certificates — explore all our services."
        icon={UtensilsCrossed}
      />
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <Link to={s.path} className="card p-7 block h-full group">
                  <div className={`h-14 w-14 rounded-2xl-premium bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-5 shadow-lg group-hover:shadow-premium transition-shadow`}>
                    <Icon className="h-7 w-7" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-ink dark:text-cream mb-2">{s.title}</h3>
                  <p className="text-sm text-ink-soft dark:text-cream/60 leading-relaxed mb-4">{s.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all">
                    Open <ArrowRight className="h-4 w-4" />
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
