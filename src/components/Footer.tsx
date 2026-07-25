import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowUp, Send } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

const services = [
  { name: 'Donate Food', path: '/donate-food' },
  { name: 'Available Donations', path: '/available-food' },
  { name: 'Food Quality Verification', path: '/food-quality' },
  { name: 'Donation Tracking', path: '/tracking' },
  { name: 'Verify Certificate', path: '/verify-certificate' },
];

const dashboards = [
  { name: 'Volunteer Dashboard', path: '/volunteer' },
  { name: 'Admin Dashboard', path: '/admin' },
];

const account = [
  { name: 'My Profile', path: '/profile' },
  { name: 'My Certificates', path: '/certificate' },
  { name: 'Settings', path: '/profile' },
  { name: 'FAQ', path: '/help' },
];

const legal = [
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Terms & Conditions', path: '/terms' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const socials = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

const linkGroups = [
  { title: 'Services', links: services },
  { title: 'Dashboards', links: dashboards },
  { title: 'Account', links: account },
  { title: 'More', links: legal },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const subscribe = async () => {
    if (!email || !email.includes('@')) {
      toast('Please enter a valid email', 'error');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('newsletter_subscribers').insert({ email });
    setLoading(false);
    if (error) {
      toast(error.code === '23505' ? 'You are already subscribed!' : 'Could not subscribe, try again', 'error');
    } else {
      toast('Subscribed successfully! Welcome to FoodBridge.', 'success');
      setEmail('');
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative overflow-hidden bg-secondary-900 dark:bg-secondary-950 text-cream border-t border-secondary-800">
      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-4">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <img src="/logo.png" alt="FoodBridge" className="h-11 w-11 object-contain" />
              <span className="font-display text-xl font-semibold text-cream">FoodBridge</span>
            </Link>
            <p className="text-sm text-cream/60 leading-relaxed mb-6 max-w-sm">
              Every Meal Deserves a Purpose. We redirect surplus food from events &amp; hotels to those who need it most — reducing food waste while fighting hunger, one bridge at a time.
            </p>
            <div className="flex gap-2.5">
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  whileHover={{ y: -3 }}
                  className="h-9 w-9 rounded-full bg-secondary-800 hover:bg-primary-600 flex items-center justify-center text-cream/70 hover:text-cream transition-colors"
                >
                  <s.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          <div className="col-span-2 md:col-span-3 lg:col-span-5 grid grid-cols-2 md:grid-cols-4 gap-6">
            {linkGroups.map((group) => (
              <div key={group.title}>
                <h3 className="font-display font-semibold mb-4 text-sm text-cream">{group.title}</h3>
                <ul className="space-y-2.5">
                  {group.links.map((l) => (
                    <li key={l.path + l.name}>
                      <Link to={l.path} className="text-sm text-cream/55 hover:text-primary-300 transition-colors">
                        {l.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact + Newsletter */}
          <div className="col-span-2 md:col-span-3 lg:col-span-3">
            <h3 className="font-display font-semibold mb-4 text-sm text-cream">Stay connected</h3>
            <div className="space-y-3 mb-6">
              <a href="mailto:hello@foodbridge.org" className="flex items-center gap-3 text-sm text-cream/60 hover:text-primary-300 transition-colors">
                <Mail className="h-4 w-4 text-primary-400 shrink-0" /> hello@foodbridge.org
              </a>
              <a href="tel:+918012345678" className="flex items-center gap-3 text-sm text-cream/60 hover:text-primary-300 transition-colors">
                <Phone className="h-4 w-4 text-primary-400 shrink-0" /> +91 80 1234 5678
              </a>
              <p className="flex items-center gap-3 text-sm text-cream/60">
                <MapPin className="h-4 w-4 text-primary-400 shrink-0" /> MG Road, Bangalore, India
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Newsletter email"
                className="w-full px-4 py-2.5 rounded-xl-premium bg-secondary-800 border border-secondary-700 text-cream placeholder-cream/40 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm"
                aria-label="Email for newsletter"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={subscribe}
                disabled={loading}
                className="btn-primary px-4 py-2.5 shrink-0"
                aria-label="Subscribe"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-secondary-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-cream/50 flex items-center gap-1.5">
            Made with <Heart className="h-3.5 w-3.5 text-primary-400 fill-primary-400" /> by FoodBridge &copy; {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-cream/40">No plate left empty.</span>
            <motion.button
              whileHover={{ y: -3 }}
              onClick={scrollToTop}
              className="h-10 w-10 rounded-full bg-primary-600 hover:bg-primary-700 text-cream flex items-center justify-center transition-colors"
              aria-label="Back to top"
            >
              <ArrowUp className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}
