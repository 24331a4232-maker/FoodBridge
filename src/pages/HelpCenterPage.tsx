import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  HelpCircle,
  Mail,
  Phone,
  ArrowRight,
  HeartHandshake,
  UtensilsCrossed,
  Hotel,
  Building2,
  Award,
  MapPin,
  Leaf,
  Salad,
  ShieldCheck,
  Bell,
  Shield,
  Download,
  QrCode,
  BadgeCheck,
  MessageSquare,
} from 'lucide-react';
import { SectionHeading, fadeInUp, staggerContainer, scaleIn } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';

type CategoryId = 'food' | 'volunteer' | 'hotels' | 'ngos' | 'certificates' | 'maps';

const categories: { id: CategoryId; label: string; icon: typeof UtensilsCrossed }[] = [
  { id: 'food', label: 'Food Donation', icon: UtensilsCrossed },
  { id: 'volunteer', label: 'Volunteer', icon: HeartHandshake },
  { id: 'hotels', label: 'Hotels & Restaurants', icon: Hotel },
  { id: 'ngos', label: 'NGOs', icon: Building2 },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'maps', label: 'Maps & Tracking', icon: MapPin },
];

interface FaqItem {
  q: string;
  a: string;
  category: CategoryId;
  icon: typeof UtensilsCrossed;
}

const faqs: FaqItem[] = [
  {
    q: 'What is FoodBridge?',
    a: 'FoodBridge is a community-driven platform that connects hotels, restaurants, and event organizers with surplus food to volunteers who pick it up and deliver it to verified NGOs, orphanages, and shelters. Our mission is to reduce food waste while fighting hunger.',
    category: 'food',
    icon: Leaf,
  },
  {
    q: 'Who can donate food?',
    a: 'Hotels, restaurants, event organizers, marriage halls, caterers, and even corporate cafeterias. As long as the food is edible and safe, you can list it on FoodBridge for a volunteer to pick up.',
    category: 'food',
    icon: UtensilsCrossed,
  },
  {
    q: 'What type of food can be donated?',
    a: 'Cooked meals, packaged food, fresh produce, bakery items, and unopened groceries. Food must be hygienically prepared, within its shelf life, and safe for consumption. We do not accept spoiled, stale, or alcohol-containing items.',
    category: 'food',
    icon: Salad,
  },
  {
    q: 'How is food quality verified?',
    a: 'Every donation is tagged with a food quality score based on freshness, packaging, temperature, and shelf life. Volunteers verify the food at pickup using our quality checklist before delivery, ensuring only safe food reaches recipients.',
    category: 'food',
    icon: ShieldCheck,
  },
  {
    q: 'How do volunteers receive pickup requests?',
    a: 'Once a donor lists surplus food, nearby volunteers are notified instantly. You can accept a pickup request from your Volunteer Dashboard, which shows the pickup location, quantity, and delivery destination.',
    category: 'volunteer',
    icon: Bell,
  },
  {
    q: 'Is my current location shared securely?',
    a: 'Your live location is only used to match you with nearby pickup requests and is never displayed publicly. It is visible solely to you and the FoodBridge system during an active delivery, and you can disable it anytime from your profile settings.',
    category: 'maps',
    icon: Shield,
  },
  {
    q: 'How do I track my donation?',
    a: 'After a volunteer accepts your donation, you can track the entire journey in real time on the Available Food and Maps page. You will see pickup, in-transit, and delivered status updates until the food reaches the recipient NGO.',
    category: 'maps',
    icon: MapPin,
  },
  {
    q: 'How do I download my volunteer certificate?',
    a: 'Once you complete verified deliveries, a certificate is auto-generated for your contribution. Visit the Certificate page, preview your certificate, and click Download to save a high-quality PDF. You can also view all past certificates under My Certificates.',
    category: 'certificates',
    icon: Download,
  },
  {
    q: 'How can I verify a certificate using the QR code?',
    a: 'Every FoodBridge certificate has a unique QR code. Scan it with any QR scanner or use the Verify Certificate page and enter the certificate ID. The system confirms authenticity and displays the volunteer name, deliveries, and issue date.',
    category: 'certificates',
    icon: QrCode,
  },
  {
    q: 'Which NGOs receive the donated food?',
    a: 'FoodBridge partners only with verified orphanages, old-age homes, shelters, and community kitchens. Every recipient organization is vetted before joining the network, and you can see the receiving NGO for each of your donations in your dashboard.',
    category: 'ngos',
    icon: Building2,
  },
  {
    q: 'Is FoodBridge free to use?',
    a: 'Yes. FoodBridge is completely free for donors, volunteers, and NGOs. There are no subscription fees or hidden charges. Our goal is to make food redistribution accessible to everyone.',
    category: 'volunteer',
    icon: BadgeCheck,
  },
  {
    q: 'How can hotels become official partners?',
    a: 'Register your hotel as a donor, complete your organization profile, and start listing surplus food through the Donate Food page. For bulk or recurring partnerships, contact our team and we will onboard you as a verified FoodBridge partner.',
    category: 'hotels',
    icon: Hotel,
  },
];

export function HelpCenterPage() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<CategoryId | 'all'>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => {
      const matchesCat = active === 'all' || f.category === active;
      const matchesQuery = q === '' || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [query, active]);

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      {/* Hero */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="badge bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 mb-4">
            <HelpCircle className="h-3.5 w-3.5" /> Help Center
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-xl mx-auto">
            Find answers to the most common questions about FoodBridge.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-xl mx-auto mt-8"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions..."
            className="input-field pl-12 pr-4 py-3.5 text-base"
          />
        </motion.div>

        {/* Category filters */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center justify-center gap-2.5 mt-6"
        >
          <FilterPill label="All" active={active === 'all'} onClick={() => setActive('all')} />
          {categories.map((c) => (
            <FilterPill
              key={c.id}
              label={c.label}
              icon={c.icon}
              active={active === c.id}
              onClick={() => setActive(c.id)}
            />
          ))}
        </motion.div>
      </section>

      {/* Accordion */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pb-8">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((f, i) => {
              const isOpen = openIndex === i;
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.q}
                  layout
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card p-0 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center gap-4 p-5 text-left"
                  >
                    <span className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1 font-medium text-[15px] sm:text-base">{f.q}</span>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <ChevronDown className="h-5 w-5 text-primary-500" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pl-20 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {f.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="h-16 w-16 rounded-full glass flex items-center justify-center mx-auto mb-4">
                <Search className="h-7 w-7 text-gray-400" />
              </div>
              <p className="font-medium">No questions found</p>
              <p className="text-sm text-gray-500 mt-1">Try a different search or category.</p>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Bottom CTA */}
      <section className="section">
        <SectionHeading badge="Still need help?" title="Still have questions?" subtitle="Our support team is here to help you with anything you need." />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mt-12"
        >
          <motion.div variants={fadeInUp} className="glass-card p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary-500/15 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-accent-500/15 blur-3xl" />
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <a href="mailto:support@foodbridge.org" className="flex items-center gap-4 group">
                <span className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                  <Mail className="h-6 w-6" />
                </span>
                <span>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="font-medium">support@foodbridge.org</p>
                </span>
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-4 group">
                <span className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-accent-500/30 group-hover:scale-110 transition-transform">
                  <Phone className="h-6 w-6" />
                </span>
                <span>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="font-medium">+91 98765 43210</p>
                </span>
              </a>
            </div>
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/contact">
                <RippleButton variant="primary" className="text-base px-7 py-3.5">
                  Contact Us <MessageSquare className="h-4 w-4" />
                </RippleButton>
              </Link>
              <Link to="/register">
                <RippleButton variant="ghost" className="text-base px-7 py-3.5">
                  Become a Volunteer <HeartHandshake className="h-4 w-4" />
                </RippleButton>
              </Link>
              <Link to="/donate-food">
                <RippleButton variant="accent" className="text-base px-7 py-3.5">
                  Donate Food <ArrowRight className="h-4 w-4" />
                </RippleButton>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

function FilterPill({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon?: typeof UtensilsCrossed;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      variants={fadeInUp}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
          : 'glass text-gray-600 dark:text-gray-300 hover:text-primary-600'
      }`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </motion.button>
  );
}
