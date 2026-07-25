import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HelpCircle, Phone, Lock, FileText, MessageSquare,
  ArrowRight, Search, ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { SectionPageHeader } from '@/components/SectionPageHeader';
import { SectionTabs } from '@/components/SectionTabs';
import { RippleButton } from '@/components/ui/RippleButton';

const faqs = [
  { q: 'How does FoodBridge ensure food safety?', a: 'Every donor and volunteer is verified. We enforce hygiene protocols, temperature checks, and a strict 4-hour delivery window for cooked food. All pickups are tracked end-to-end.' },
  { q: 'Who can donate food?', a: 'Hotels, restaurants, event organizers, marriage halls, caterers, and corporate cafeterias. As long as the food is edible and safe, you can list it.' },
  { q: 'How do I become a volunteer?', a: 'Register as a volunteer, complete your profile, and start accepting nearby pickups. You earn reward points and can download an official certificate.' },
  { q: 'Is FoodBridge free to use?', a: 'Yes, FoodBridge is completely free for donors, volunteers, and recipient organizations. We are a non-profit initiative.' },
  { q: 'What happens to food that is not picked up?', a: 'Listings expire automatically after the pickup window. Urgent donations are prioritized and pushed to more volunteers to minimize waste.' },
  { q: 'How are volunteers matched to donations?', a: 'Our system matches based on proximity, availability, and route optimization. Volunteers see nearby donations on a live map and can accept with one tap.' },
  { q: 'Can I track my delivery in real time?', a: 'Yes. Once a volunteer accepts a pickup, the delivery is tracked on the map from pickup to destination with full transparency.' },
  { q: 'How do certificates work?', a: 'After completing deliveries, volunteers earn certificates that can be downloaded as PDFs and verified by QR code or certificate ID.' },
];

const helpCategories = [
  { icon: Search, title: 'Getting Started', desc: 'Account setup, registration, and first steps.' },
  { icon: HelpCircle, title: 'Donations', desc: 'How to donate, list food, and manage pickups.' },
  { icon: ArrowRight, title: 'Volunteering', desc: 'Accepting pickups, tracking, and earning rewards.' },
  { icon: FileText, title: 'Certificates', desc: 'Downloading, verifying, and sharing certificates.' },
];

const privacySections = [
  { title: 'Information We Collect', desc: 'We collect your name, email, phone number, organization details, and location data when you use FoodBridge. This includes donation listings, pickup records, and delivery information.' },
  { title: 'How We Use Your Data', desc: 'Your data is used to match donors with volunteers, track deliveries, generate certificates, and improve our services. We never sell your data to third parties.' },
  { title: 'Data Storage & Security', desc: 'All data is stored securely using Supabase with row-level security. Passwords are hashed, and sensitive data is encrypted at rest.' },
  { title: 'Your Rights', desc: 'You can access, update, or delete your personal data at any time from your profile settings. You can also export your data or close your account.' },
  { title: 'Communication', desc: 'We send notifications about donations, deliveries, and certificates. You can customize notification preferences in your account settings.' },
  { title: 'Third-Party Services', desc: 'We use Supabase for data storage, Leaflet for maps, and standard web infrastructure. These services have their own privacy policies.' },
];

const termsSections = [
  { title: 'Acceptance of Terms', desc: 'By using FoodBridge, you agree to these terms. If you do not agree, please do not use the platform.' },
  { title: 'User Responsibilities', desc: 'Donors must provide accurate food information. Volunteers must follow safety protocols. All users must treat each other with respect.' },
  { title: 'Food Safety Liability', desc: 'FoodBridge facilitates connections but is not liable for food quality. Donors are responsible for food safety at the time of listing. Volunteers must verify quality at pickup.' },
  { title: 'Intellectual Property', desc: 'All content, branding, and certificates are property of FoodBridge. Volunteer certificates are personal and non-transferable.' },
  { title: 'Prohibited Activities', desc: 'No selling donated food, no false listings, no harassment, and no use of the platform for commercial gain outside our terms.' },
  { title: 'Modifications & Termination', desc: 'We may update these terms at any time. We can suspend accounts that violate our terms. Users can delete their accounts at any time.' },
];

function FAQTab() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = open === i;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="card overflow-hidden">
              <button onClick={() => setOpen(isOpen ? null : i)} className="flex items-center justify-between w-full p-6 font-display text-lg font-medium text-ink dark:text-cream text-left">
                {faq.q}
                <ChevronDown className={`h-5 w-5 text-primary-500 shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <motion.div initial={false} animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                <div className="px-6 pb-6 text-base text-ink-soft dark:text-cream/60 leading-relaxed">{faq.a}</div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function HelpCenterTab() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {helpCategories.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} className="card p-6">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center mb-4 shadow-lg"><Icon className="h-5 w-5" /></div>
              <h3 className="font-display font-semibold text-ink dark:text-cream">{c.title}</h3>
              <p className="text-sm text-ink-soft dark:text-cream/60 mt-1">{c.desc}</p>
            </motion.div>
          );
        })}
      </div>
      <div className="text-center mt-10">
        <p className="text-ink-soft dark:text-cream/60 mb-4">Still need help? Reach out to our team.</p>
        <Link to="/resources/contact"><RippleButton variant="primary">Contact Support <ArrowRight className="h-4 w-4" /></RippleButton></Link>
      </div>
    </div>
  );
}

function PrivacyTab() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {privacySections.map((s, i) => (
        <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center"><Lock className="h-4 w-4" /></div>
            <h3 className="font-display font-semibold text-lg text-ink dark:text-cream">{s.title}</h3>
          </div>
          <p className="text-ink-soft dark:text-cream/60 leading-relaxed">{s.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}

function TermsTab() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {termsSections.map((s, i) => (
        <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-accent-100 dark:bg-accent-900/40 text-accent-600 dark:text-accent-400 flex items-center justify-center"><FileText className="h-4 w-4" /></div>
            <h3 className="font-display font-semibold text-lg text-ink dark:text-cream">{s.title}</h3>
          </div>
          <p className="text-ink-soft dark:text-cream/60 leading-relaxed">{s.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}

function ContactTab() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8">
        <h3 className="font-display text-xl font-semibold text-ink dark:text-cream mb-6">Send us a message</h3>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="input-field" placeholder="Your name" />
            <input className="input-field" placeholder="Your email" type="email" />
          </div>
          <input className="input-field" placeholder="Subject" />
          <textarea className="input-field min-h-32" placeholder="Your message" rows={5} />
          <RippleButton variant="primary" type="submit" fullWidth>Send Message</RippleButton>
        </form>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {[
          { icon: MessageSquare, label: 'Email', value: 'hello@foodbridge.org' },
          { icon: Phone, label: 'Phone', value: '+91 80 4567 8900' },
          { icon: HelpCircle, label: 'Support Hours', value: 'Mon–Sat, 9am–8pm' },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card p-5 text-center">
              <Icon className="h-6 w-6 text-primary-500 mx-auto mb-2" />
              <p className="text-xs text-ink-soft dark:text-cream/50">{c.label}</p>
              <p className="text-sm font-medium text-ink dark:text-cream mt-1">{c.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ResourcesSectionPage() {
  return (
    <div className="pt-20 min-h-screen gradient-bg-soft">
      <SectionPageHeader
        crumbs={[{ label: 'Resources', icon: HelpCircle }]}
        eyebrow="Resources"
        title="Help, policies, and support"
        subtitle="Find answers, read our policies, or get in touch with the FoodBridge team."
        icon={HelpCircle}
      />
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <SectionTabs
          tabs={[
            { id: 'faq', label: 'FAQ', icon: HelpCircle, content: <FAQTab /> },
            { id: 'help', label: 'Help Center', icon: Search, content: <HelpCenterTab /> },
            { id: 'privacy', label: 'Privacy Policy', icon: Lock, content: <PrivacyTab /> },
            { id: 'terms', label: 'Terms & Conditions', icon: FileText, content: <TermsTab /> },
            { id: 'contact', label: 'Contact', icon: MessageSquare, content: <ContactTab /> },
          ]}
        />
      </section>
    </div>
  );
}
