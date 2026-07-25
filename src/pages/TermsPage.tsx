import { motion } from 'framer-motion';
import { FileText, CheckSquare, AlertTriangle, Scale, Ban, RefreshCw } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';

const sections = [
  { icon: CheckSquare, title: 'Acceptance of Terms', content: 'By accessing FoodBridge, you agree to these terms. If you do not agree, please discontinue use. These terms may be updated periodically, and continued use constitutes acceptance of updates.' },
  { icon: FileText, title: 'User Responsibilities', content: 'Donors must provide accurate food information and ensure food is safe for consumption. Volunteers must handle food hygienically and deliver within the specified time. All users must provide truthful information.' },
  { icon: AlertTriangle, title: 'Food Safety Liability', content: 'FoodBridge is a platform connecting donors and recipients. We are not liable for food quality or safety issues. Donors are responsible for food safety until pickup. Volunteers are responsible during transit. Always follow hygiene protocols.' },
  { icon: Scale, title: 'Intellectual Property', content: 'All content, logos, and branding on FoodBridge are owned by The Last Plate Initiative. User-generated content remains the property of the user, with a license granted to FoodBridge for platform operations.' },
  { icon: Ban, title: 'Prohibited Activities', content: 'Users must not post false information, donate spoiled food, spam other users, misuse the platform for commercial gain, or attempt to disrupt service. Violations may result in account suspension.' },
  { icon: RefreshCw, title: 'Modifications & Termination', content: 'We reserve the right to modify or discontinue features. We may terminate accounts that violate these terms. Users may delete their account at any time through profile settings.' },
];

export function TermsPage() {
  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 items-center justify-center mb-4 shadow-lg">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Terms of Service</h1>
          <p className="text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {sections.map((s) => (
            <motion.div key={s.title} variants={fadeInUp} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-accent-600" />
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
