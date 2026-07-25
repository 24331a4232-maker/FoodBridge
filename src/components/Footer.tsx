import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowUp, Send } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

const quickLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Available Food', path: '/available-food' },
  { name: 'Donate Food', path: '/donate-food' },
  { name: 'Volunteer', path: '/volunteer' },
  { name: 'Contact', path: '/contact' },
];

const resources = [
  { name: 'FAQ', path: '/help' },
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Terms of Service', path: '/terms' },
  { name: 'Certificate Verification', path: '/verify-certificate' },
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
];

const socials = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
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
    <footer className="relative mt-20 overflow-hidden bg-gradient-to-b from-primary-50/50 to-white dark:from-primary-950/20 dark:to-gray-950 border-t border-gray-100 dark:border-gray-800">
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-96 rounded-full bg-primary-300/10 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="FoodBridge" className="h-11 w-11 object-contain" />
              <span className="font-display text-xl font-bold gradient-text">FoodBridge</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 max-w-sm">
              FoodBridge redirects surplus food from events & hotels to those in need - reducing food waste while fighting hunger through technology.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="h-10 w-10 rounded-full glass flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <s.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="font-display font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:col-span-2">
            <h3 className="font-display font-semibold mb-4">Resources</h3>
            <ul className="space-y-2.5">
              {resources.map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div className="lg:col-span-4">
            <h3 className="font-display font-semibold mb-4">Stay Connected</h3>
            <div className="space-y-3 mb-5">
              <a href="mailto:hello@foodbridge.org" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
                <Mail className="h-4 w-4 text-primary-500" /> hello@foodbridge.org
              </a>
              <a href="tel:+918012345678" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
                <Phone className="h-4 w-4 text-primary-500" /> +91 80 1234 5678
              </a>
              <p className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 text-primary-500" /> MG Road, Bangalore, India
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Subscribe to newsletter"
                className="input-field text-sm py-2.5"
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

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> by FoodBridge &copy; {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">FoodBridge</span>
            <motion.button
              whileHover={{ y: -3 }}
              onClick={scrollToTop}
              className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-600/30"
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
