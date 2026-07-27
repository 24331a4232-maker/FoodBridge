import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  UtensilsCrossed,
  Phone,
  Search,
  HeartHandshake,
  Info,
  ShoppingBasket,
  LayoutDashboard,
  Mail,
  Leaf,
  ChevronRight,
} from 'lucide-react';
import { RippleButton } from '@/components/ui/RippleButton';
import { PageNav } from '@/components/PageNav';
import { Illustration } from '@/components/Illustration';
import { fadeInUp, staggerContainer, scaleIn } from '@/lib/animations';

const quickLinks = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'About', path: '/about', icon: Info },
  { name: 'Donate Food', path: '/services/donate-food', icon: UtensilsCrossed },
  { name: 'Available Donations', path: '/services/available-food', icon: ShoppingBasket },
  { name: 'Volunteer Dashboard', path: '/dashboard/volunteer', icon: LayoutDashboard },
  { name: 'Contact', path: '/resources/contact', icon: Phone },
];

const searchablePages = [
  ...quickLinks,
  { name: 'Food Quality', path: '/services/food-quality', icon: Leaf },
  { name: 'Help Center', path: '/resources/help', icon: Mail },
  { name: 'Achievements', path: '/achievements', icon: HeartHandshake },
  { name: 'Certificate', path: '/services/certificates', icon: HeartHandshake },
  { name: 'Verify Certificate', path: '/services/verify-certificate', icon: HeartHandshake },
];

const floatingIcons = [
  { Icon: UtensilsCrossed, className: 'top-[18%] left-[12%]', delay: 0, color: 'text-primary-400' },
  { Icon: HeartHandshake, className: 'top-[28%] right-[14%]', delay: 0.5, color: 'text-accent-400' },
  { Icon: Leaf, className: 'bottom-[24%] left-[16%]', delay: 1, color: 'text-primary-500' },
  { Icon: ShoppingBasket, className: 'bottom-[18%] right-[12%]', delay: 1.5, color: 'text-accent-500' },
];

export function NotFoundPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchablePages.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      navigate(results[0].path);
    }
  };

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4 py-12 gradient-bg relative overflow-hidden">
      <PageNav crumbs={[{ label: 'Page Not Found', icon: Search }]} />
      {/* Floating background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-accent-300/20 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary-200/10 blur-3xl" />
      </div>

      {/* Floating icons */}
      {floatingIcons.map(({ Icon, className, delay, color }, i) => (
        <motion.div
          key={i}
          className={`absolute hidden md:block ${className} ${color}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.4, scale: 1, y: [0, -16, 0] }}
          transition={{
            opacity: { delay, duration: 0.6 },
            scale: { delay, duration: 0.6 },
            y: { repeat: Infinity, duration: 4 + i, ease: 'easeInOut', delay },
          }}
        >
          <Icon className="h-12 w-12" />
        </motion.div>
      ))}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-2xl"
      >
        <motion.div variants={scaleIn} className="glass-card p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent-500/10 blur-3xl" />

          {/* Logo */}
          <motion.div variants={fadeInUp} className="flex justify-center mb-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.img
                src="/logo.png"
                alt="FoodBridge"
                className="h-14 w-14 sm:h-16 sm:w-16 object-contain"
                whileHover={{ rotate: 10, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
              <span className="font-display text-xl sm:text-2xl font-bold gradient-text">FoodBridge</span>
            </Link>
          </motion.div>

          {/* Illustration */}
          <motion.div variants={scaleIn} className="relative mx-auto mb-6 w-full max-w-sm aspect-[16/10] rounded-2xl overflow-hidden shadow-xl shadow-primary-500/10 bg-cream dark:bg-secondary-900 flex items-center justify-center">
            <Illustration variant="community" className="w-3/4 h-3/4" />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg"
            >
              <HeartHandshake className="h-5 w-5 text-primary-600" />
            </motion.div>
          </motion.div>

          {/* 404 */}
          <motion.h1
            variants={fadeInUp}
            className="font-display text-7xl sm:text-8xl font-bold gradient-text leading-none"
          >
            404
          </motion.h1>
          <motion.h2 variants={fadeInUp} className="font-display text-xl sm:text-2xl font-bold mt-3">
            Page Not Found
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-ink-soft dark:text-cream/60 max-w-md mx-auto mt-2">
            Oops! The page you're looking for doesn't exist or may have been moved.
          </motion.p>

          {/* Search */}
          <motion.form variants={fadeInUp} onSubmit={handleSearch} className="relative max-w-md mx-auto mt-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-soft/60 dark:text-cream/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search website..."
                className="input-field pl-12 pr-4 py-3 text-base"
              />
            </div>
            <AnimatePresence>
              {results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute z-20 left-0 right-0 mt-2 glass-card p-2 text-left"
                >
                  {results.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.path}
                        type="button"
                        onClick={() => navigate(r.path)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                      >
                        <Icon className="h-4 w-4 text-primary-600" />
                        <span className="text-sm font-medium flex-1 text-left">{r.name}</span>
                        <ChevronRight className="h-4 w-4 text-ink-soft/60 dark:text-cream/40" />
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          {/* Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Link to="/">
              <RippleButton variant="primary" className="text-sm px-5 py-3">
                <Home className="h-4 w-4" /> Back to Home
              </RippleButton>
            </Link>
            <Link to="/services/donate-food">
              <RippleButton variant="accent" className="text-sm px-5 py-3">
                <UtensilsCrossed className="h-4 w-4" /> Donate Food
              </RippleButton>
            </Link>
            <Link to="/resources/contact">
              <RippleButton variant="ghost" className="text-sm px-5 py-3">
                <Phone className="h-4 w-4" /> Contact Us
              </RippleButton>
            </Link>
            <button type="button" onClick={() => (document.querySelector('input[placeholder="Search website..."]') as HTMLInputElement)?.focus()}>
              <RippleButton variant="secondary" className="text-sm px-5 py-3">
                <Search className="h-4 w-4" /> Search Website
              </RippleButton>
            </button>
          </motion.div>
        </motion.div>

        {/* You may be looking for */}
        <motion.div variants={fadeInUp} className="mt-8">
          <p className="text-center text-sm font-medium text-ink-soft dark:text-cream/60 mb-4">
            You may be looking for:
          </p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <motion.div key={link.path} variants={scaleIn} whileHover={{ y: -4 }}>
                  <Link
                    to={link.path}
                    className="glass-card p-4 flex items-center gap-3 group hover:shadow-lg transition-shadow"
                  >
                    <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{link.name}</span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Footer message */}
        <motion.p
          variants={fadeInUp}
          className="text-center text-sm text-ink-soft dark:text-cream/60 mt-8 italic"
        >
          "Every meal matters. Let's continue making a difference together."
        </motion.p>
      </motion.div>
    </div>
  );
}
