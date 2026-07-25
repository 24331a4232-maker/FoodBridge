import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';

const sections = [
  { icon: Eye, title: 'Information We Collect', content: 'We collect information you provide directly: name, email, phone number, organization details, and delivery records. We also collect usage data such as login times and page interactions to improve our services.' },
  { icon: Lock, title: 'How We Use Your Information', content: 'Your information is used to facilitate food donations and deliveries, verify identities, communicate updates, generate certificates, and improve the platform. We never sell your data to third parties.' },
  { icon: Database, title: 'Data Storage & Security', content: 'All data is stored securely using Supabase with row-level security policies. Passwords are hashed. Sensitive data is encrypted in transit and at rest. Access is restricted to authorized personnel only.' },
  { icon: UserCheck, title: 'Your Rights', content: 'You have the right to access, correct, or delete your personal data at any time. You can export your data or close your account through your profile settings. Contact us at privacy@foodbridge.org for any data requests.' },
  { icon: Mail, title: 'Communication', content: 'We send transactional emails (pickup confirmations, certificates) and optional newsletters. You can unsubscribe from newsletters at any time using the link in the email or through your profile settings.' },
  { icon: Shield, title: 'Third-Party Services', content: 'We use Supabase for database and authentication, and Google Maps for location services. These providers have their own privacy policies. We only share data necessary for the service to function.' },
];

export function PrivacyPage() {
  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 items-center justify-center mb-4 shadow-lg">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
          <p className="text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {sections.map((s) => (
            <motion.div key={s.title} variants={fadeInUp} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg mb-2">{s.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
