import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import {
  Menu, X, Moon, Sun, LogOut, ChevronDown, LayoutDashboard, User as UserIcon,
  Award, Package, Search, ShieldCheck, MapPin, Truck,
  Building2, FileText, Lock, HelpCircle, Home, Info, Phone, Search as SearchIcon,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { NotificationBell } from '@/components/NotificationBell';

interface NavItem {
  name: string;
  path?: string;
  icon: LucideIcon;
  children?: { name: string; path: string; icon: LucideIcon }[];
}

const navItems: NavItem[] = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'About', path: '/about', icon: Info },
  {
    name: 'Features',
    icon: Package,
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
    icon: LayoutDashboard,
    children: [
      { name: 'Volunteer Dashboard', path: '/volunteer', icon: LayoutDashboard },
      { name: 'Admin Dashboard', path: '/admin', icon: Building2 },
      { name: 'Profile & Settings', path: '/profile', icon: UserIcon },
    ],
  },
  {
    name: 'Certificates',
    icon: Award,
    children: [
      { name: 'Volunteer Certificate', path: '/certificate', icon: Award },
      { name: 'Certificate Verification', path: '/verify-certificate', icon: ShieldCheck },
    ],
  },
  {
    name: 'Resources',
    icon: FileText,
    children: [
      { name: 'FAQ', path: '/help', icon: HelpCircle },
      { name: 'Privacy Policy', path: '/privacy', icon: Lock },
      { name: 'Terms & Conditions', path: '/terms', icon: FileText },
    ],
  },
  { name: 'Contact', path: '/contact', icon: Phone },
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const prevY = useRef(0);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = prevY.current;
    if (latest > prev && latest > 160 && !mobileOpen) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    prevY.current = latest;
    setScrolled(latest > 20);
  });

  // Close dropdowns and mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setUserMenu(false);
    setMobileExpanded(null);
    setSearchOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    setSearchOpen(false);
    setSearchQuery('');
    if (!q) return;
    const match = navItems.flatMap((i) => i.children ?? [{ name: i.name, path: i.path }]).find((c) => c.name.toLowerCase().includes(q));
    if (match?.path) navigate(match.path);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? -100 : 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-lg shadow-gray-200/30 dark:shadow-black/20 border-b border-gray-100 dark:border-gray-800/50' : 'bg-white/60 dark:bg-gray-950/60 backdrop-blur-md'
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
              const TopIcon = item.icon;
              if (item.children) {
                return (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown((cur) => (cur === item.name ? null : cur))}
                  >
                    <button
                      className={`relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                        active
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                      }`}
                    >
                      <TopIcon className="h-4 w-4 opacity-70" />
                      {item.name}
                      <motion.span animate={{ rotate: openDropdown === item.name ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </motion.span>
                      {active && (
                        <motion.span layoutId="navUnderline" className="absolute left-3.5 right-3.5 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
                      )}
                    </button>
                    <AnimatePresence>
                      {openDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.97 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="absolute left-0 top-full pt-2.5 w-64"
                        >
                          <div className="bg-white dark:bg-gray-900 rounded-2xl p-2 shadow-2xl shadow-gray-300/40 dark:shadow-black/40 border border-gray-100 dark:border-gray-800">
                            <div className="absolute -top-1.5 left-6 h-3 w-3 rotate-45 bg-white dark:bg-gray-900 border-l border-t border-gray-100 dark:border-gray-800" />
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              const childActive = location.pathname === child.path;
                              return (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                    childActive
                                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                      : 'hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  <span className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${childActive ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                                    <ChildIcon className="h-4 w-4" />
                                  </span>
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
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                    active
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <TopIcon className="h-4 w-4 opacity-70" />
                  {item.name}
                  {active && (
                    <motion.span layoutId="navUnderline" className="absolute left-3.5 right-3.5 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Search"
            >
              <SearchIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>

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
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full glass hover:shadow-md transition-all"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                    {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">{profile?.full_name?.split(' ')[0] ?? 'User'}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
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
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl p-2 shadow-2xl border border-gray-100 dark:border-gray-800 z-20"
                      >
                        <div className="px-3 py-2 mb-1 border-b border-gray-100 dark:border-gray-800">
                          <p className="text-sm font-semibold truncate">{profile?.full_name ?? 'User'}</p>
                          <p className="text-xs text-gray-400 truncate">{profile?.email ?? user.email}</p>
                        </div>
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
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity:1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.form
            onSubmit={handleSearch}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-t border-gray-100 dark:border-gray-800"
          >
            <div className="px-4 py-3 flex gap-2">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages..."
                className="input-field text-sm"
              />
              <button type="submit" className="btn-primary px-4 py-2.5 shrink-0">
                <SearchIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 top-16 bg-black/30 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed top-16 right-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-gray-950 z-40 overflow-y-auto border-l border-gray-100 dark:border-gray-800"
            >
              <div className="px-4 py-5 space-y-1">
                {navItems.map((item) => {
                  const active = isActive(location.pathname, item.path, item.children);
                  const TopIcon = item.icon;
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
                          <span className="flex items-center gap-2.5">
                            <TopIcon className="h-4 w-4 text-primary-500" />
                            {item.name}
                          </span>
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
                                const ChildIcon = child.icon;
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
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <TopIcon className="h-4 w-4 text-primary-500" />
                      {item.name}
                    </Link>
                  );
                })}

                {user ? (
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-3 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2.5">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                ) : (
                  <div className="flex gap-2 pt-3">
                    <Link to="/login" className="btn-secondary flex-1 text-sm">Login</Link>
                    <Link to="/register" className="btn-primary flex-1 text-sm">Register</Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
