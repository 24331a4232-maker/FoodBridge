import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Menu, X, Moon, Sun, LogOut, ChevronDown, LayoutDashboard, User as UserIcon,
  Award, Package, Search, ShieldCheck, MapPin, Truck, HeartHandshake,
  Building2, FileText, Lock, HelpCircle, Mail, type LucideIcon,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { NotificationBell } from '@/components/NotificationBell';

interface NavItem {
  name: string;
  path?: string;
  icon?: LucideIcon;
  children?: { name: string; path: string; icon: LucideIcon }[];
}

const navItems: NavItem[] = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  {
    name: 'Features',
    children: [
      { name: 'Donate Food', path: '/donate-food', icon: Package },
      { name: 'Available Donations', path: '/available-food', icon: Search },
      { name: 'Food Quality Verification', path: '/food-quality', icon: ShieldCheck },
      { name: 'Donation Tracking', path: '/tracking', icon: Truck },
      { name: 'Current Location Map', path: '/location', icon: MapPin },
    ],
  },
  {
    name: 'Dashboards',
    children: [
      { name: 'Volunteer Dashboard', path: '/volunteer', icon: LayoutDashboard },
      { name: 'Admin Dashboard', path: '/admin', icon: Building2 },
      { name: 'Profile & Settings', path: '/profile', icon: UserIcon },
    ],
  },
  {
    name: 'Certificates',
    children: [
      { name: 'Volunteer Certificate', path: '/certificate', icon: Award },
      { name: 'Certificate Verification', path: '/verify-certificate', icon: ShieldCheck },
    ],
  },
  {
    name: 'Resources',
    children: [
      { name: 'FAQ', path: '/help', icon: HelpCircle },
      { name: 'Privacy Policy', path: '/privacy', icon: Lock },
      { name: 'Terms & Conditions', path: '/terms', icon: FileText },
    ],
  },
  { name: 'Contact', path: '/contact' },
];

function isActive(pathname: string, path?: string, children?: { path: string }[]): boolean {
  if (path) return pathname === path;
  if (children) return children.some((c) => pathname === c.path);
  return false;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [userMenu, setUserMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns and mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setUserMenu(false);
    setMobileExpanded(null);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-gray-200/30 dark:shadow-black/20' : 'bg-white/70 dark:bg-gray-950/70 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <motion.img
              src="/logo.png"
              alt="FoodBridge"
              className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
              whileHover={{ rotate: 10, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
            <span className="font-display text-lg sm:text-xl font-bold gradient-text">FoodBridge</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const active = isActive(location.pathname, item.path, item.children);
              if (item.children) {
                return (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown((cur) => (cur === item.name ? null : cur))}
                  >
                    <button
                      className={`flex items-center gap-1 px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                        active
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                      }`}
                    >
                      {item.name}
                      <motion.span animate={{ rotate: openDropdown === item.name ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="h-4 w-4" />
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {openDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.97 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="absolute left-0 top-full pt-2 w-60"
                        >
                          <div className="glass-card p-2 shadow-xl">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon!;
                              const childActive = location.pathname === child.path;
                              return (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                                    childActive
                                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                      : 'hover:bg-primary-50 dark:hover:bg-primary-900/20'
                                  }`}
                                >
                                  <ChildIcon className={`h-4 w-4 ${childActive ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'}`} />
                                  <span className="text-sm font-medium">{child.name}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
              return (
                <Link
                  key={item.name}
                  to={item.path!}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    active
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  {item.name}
                  {active && (
                    <motion.span
                      layoutId="navActive"
                      className="absolute inset-0 rounded-full bg-primary-100 dark:bg-primary-900/40 -z-10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {user && <NotificationBell />}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === 'light' ? (
                  <motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <Moon className="h-5 w-5 text-gray-700" />
                  </motion.div>
                ) : (
                  <motion.div key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Sun className="h-5 w-5 text-yellow-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {user ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full glass hover:shadow-md transition-all"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                    {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">{profile?.full_name?.split(' ')[0] ?? 'User'}</span>
                </button>
                <AnimatePresence>
                  {userMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 glass-card p-2 z-20"
                      >
                        <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
                          <UserIcon className="h-4 w-4 text-primary-600" />
                          <span className="text-sm">My Profile</span>
                        </Link>
                        <Link to="/volunteer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
                          <LayoutDashboard className="h-4 w-4 text-primary-600" />
                          <span className="text-sm">Dashboard</span>
                        </Link>
                        <Link to="/certificate" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
                          <Award className="h-4 w-4 text-primary-600" />
                          <span className="text-sm">Certificate</span>
                        </Link>
                        {profile?.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
                            <Building2 className="h-4 w-4 text-accent-600" />
                            <span className="text-sm">Admin Panel</span>
                          </Link>
                        )}
                        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 transition-colors">
                          <LogOut className="h-4 w-4" />
                          <span className="text-sm">Sign Out</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Register</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass overflow-hidden border-t border-gray-100 dark:border-gray-800"
          >
            <div className="px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
              {navItems.map((item) => {
                const active = isActive(location.pathname, item.path, item.children);
                if (item.children) {
                  const expanded = mobileExpanded === item.name;
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => setMobileExpanded(expanded ? null : item.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                          active
                            ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {item.name}
                        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="h-4 w-4" />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden pl-3 mt-1 space-y-0.5"
                          >
                            {item.children.map((child) => {
                              const ChildIcon = child.icon!;
                              const childActive = location.pathname === child.path;
                              return (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                                    childActive
                                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                                  }`}
                                >
                                  <ChildIcon className="h-4 w-4 text-primary-500" />
                                  {child.name}
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.path!}
                    className={`block px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {user ? (
                <button onClick={handleSignOut} className="w-full text-left px-4 py-3 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                  Sign Out
                </button>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" className="btn-secondary flex-1 text-sm">Login</Link>
                  <Link to="/register" className="btn-primary flex-1 text-sm">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
