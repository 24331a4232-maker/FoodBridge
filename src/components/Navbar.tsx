import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import {
  Menu, X, Moon, Sun, LogOut, ChevronDown, LayoutDashboard, User as UserIcon,
  Award, Package, Search, ShieldCheck, Truck,
  Building2, FileText, Lock, HelpCircle, Home, Info, Phone, Search as SearchIcon,
  Settings, LogIn, UserPlus, ChevronRight, QrCode, Users, BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { NotificationBell } from '@/components/NotificationBell';

interface MenuLink {
  name: string;
  path: string;
  icon: LucideIcon;
  description?: string;
}

const primaryLinks: MenuLink[] = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'About', path: '/about', icon: Info },
  { name: 'Services', path: '/services', icon: Package },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Impact', path: '/analytics', icon: BarChart3 },
  { name: 'Community', path: '/community', icon: Users },
  { name: 'Contact', path: '/resources/contact', icon: Phone },
];

const servicesLinks: MenuLink[] = [
  { name: 'Donate Food', path: '/services/donate-food', icon: Package, description: 'List surplus food for pickup' },
  { name: 'Food Quality Verification', path: '/services/food-quality', icon: ShieldCheck, description: 'Check food safety standards' },
  { name: 'Volunteer Assignment', path: '/services/available-food', icon: Search, description: 'Claim nearby food pickups' },
  { name: 'Live Donation Tracking', path: '/services/tracking', icon: Truck, description: 'Track deliveries in real time' },
  { name: 'Certificate Generation', path: '/services/certificates', icon: Award, description: 'View and download certificates' },
  { name: 'QR Verification', path: '/services/verify-certificate', icon: QrCode, description: 'Verify a certificate by QR or ID' },
];

const dashboardLinks: MenuLink[] = [
  { name: 'Volunteer Dashboard', path: '/dashboard/volunteer', icon: LayoutDashboard, description: 'Manage your deliveries and impact' },
  { name: 'Admin Dashboard', path: '/dashboard/admin', icon: Building2, description: 'Oversee platform operations' },
];

const resourcesLinks: MenuLink[] = [
  { name: 'FAQ', path: '/resources', icon: HelpCircle, description: 'Frequently asked questions' },
  { name: 'Help Center', path: '/resources/help', icon: Search, description: 'Guides and tutorials' },
  { name: 'Contact', path: '/resources/contact', icon: Phone, description: 'Get in touch with us' },
  { name: 'Privacy Policy', path: '/resources/privacy', icon: Lock, description: 'How we handle your data' },
  { name: 'Terms & Conditions', path: '/resources/terms', icon: FileText, description: 'Rules of the platform' },
];

interface DrawerSection {
  id: string;
  label: string;
  icon: LucideIcon;
  accent: 'green' | 'orange';
  links: MenuLink[];
}

const drawerSections: DrawerSection[] = [
  {
    id: 'account',
    label: 'Account',
    icon: UserIcon,
    accent: 'green',
    links: [
      { name: 'Profile', path: '/profile', icon: UserIcon },
      { name: 'Settings', path: '/profile', icon: Settings },
    ],
  },
  {
    id: 'certificates',
    label: 'Certificates',
    icon: Award,
    accent: 'orange',
    links: [
      { name: 'My Certificate', path: '/services/certificates', icon: Award },
      { name: 'Certificate History', path: '/services/certificates-history', icon: FileText },
      { name: 'Verify Certificate', path: '/services/verify-certificate', icon: QrCode },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: FileText,
    accent: 'green',
    links: [
      { name: 'FAQ', path: '/resources', icon: HelpCircle },
      { name: 'Help Center', path: '/resources/help', icon: Search },
      { name: 'Contact', path: '/resources/contact', icon: Phone },
      { name: 'Privacy Policy', path: '/resources/privacy', icon: Lock },
      { name: 'Terms & Conditions', path: '/resources/terms', icon: FileText },
    ],
  },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<'services' | 'dashboard' | 'resources' | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const prevY = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = prevY.current;
    if (latest > prev && latest > 160 && !drawerOpen) setHidden(true);
    else setHidden(false);
    prevY.current = latest;
    setScrolled(latest > 20);
  });

  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const handleSignOut = async () => {
    setDrawerOpen(false);
    await signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    setSearchOpen(false);
    setSearchQuery('');
    if (!q) return;
    const all = [...servicesLinks, ...dashboardLinks, ...primaryLinks, ...drawerSections.flatMap((s) => s.links)];
    const match = all.find((c) => c.name.toLowerCase().includes(q));
    if (match?.path) navigate(match.path);
  };

  const accentClasses = {
    green: {
      icon: 'text-secondary-600 dark:text-secondary-400',
      chip: 'bg-secondary-100 dark:bg-secondary-900/40 text-secondary-700 dark:text-secondary-300',
      dot: 'bg-secondary-500',
      hover: 'hover:bg-secondary-50 dark:hover:bg-secondary-900/30',
      activeIcon: 'bg-secondary-600 text-cream',
    },
    orange: {
      icon: 'text-accent-600 dark:text-accent-400',
      chip: 'bg-accent-100 dark:bg-accent-900/40 text-accent-700 dark:text-accent-300',
      dot: 'bg-accent-500',
      hover: 'hover:bg-accent-50 dark:hover:bg-accent-900/30',
      activeIcon: 'bg-accent-600 text-cream',
    },
  };

  const isPathInLinks = (path: string, links: MenuLink[]) => links.some((l) => l.path === path);

  const renderDropdown = (id: 'services' | 'dashboard' | 'resources', label: string, icon: LucideIcon, links: MenuLink[]) => {
    const isOpen = openDropdown === id;
    const isActive = isPathInLinks(location.pathname, links);
    const Icon = icon;
    return (
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(isOpen ? null : id)}
          onMouseEnter={() => setOpenDropdown(id)}
          className={`relative flex items-center gap-1.5 px-2.5 xl:px-3.5 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
            isActive || isOpen
              ? 'text-primary-700 dark:text-primary-300'
              : 'text-ink-soft dark:text-cream/70 hover:text-primary-600 dark:hover:text-primary-400'
          }`}
        >
          <Icon className="h-4 w-4 opacity-70" />
          {label}
          <ChevronDown className={`h-3.5 w-3.5 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          {isActive && (
            <motion.span layoutId="navUnderline" className="absolute left-3.5 right-3.5 -bottom-0.5 h-0.5 rounded-full bg-primary-500" />
          )}
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-full mt-2 w-72 rounded-2xl glass-nav shadow-premium-lg border border-linen/70 dark:border-secondary-800/60 overflow-hidden p-2"
              onMouseLeave={() => setOpenDropdown(null)}
            >
              {links.map((link) => {
                const LinkIcon = link.icon;
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path + link.name}
                    to={link.path}
                    className={`group flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-primary-50 dark:bg-primary-900/30'
                        : 'hover:bg-oat dark:hover:bg-secondary-800/60'
                    }`}
                  >
                    <span className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      active
                        ? 'bg-primary-600 text-cream'
                        : 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/60'
                    }`}>
                      <LinkIcon className="h-4.5 w-4.5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold ${active ? 'text-primary-700 dark:text-primary-300' : 'text-ink dark:text-cream'}`}>
                        {link.name}
                      </p>
                      {link.description && (
                        <p className="text-xs text-ink-soft dark:text-cream/50 mt-0.5 leading-snug">{link.description}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-nav shadow-soft' : 'bg-cream/60 dark:bg-secondary-950/60 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl lg:max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <motion.img
                src="/logo.png"
                alt="FoodBridge"
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                whileHover={{ rotate: 10, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
              <span className="font-display text-base sm:text-lg lg:text-xl font-semibold gradient-text-soft">FoodBridge</span>
            </Link>

            {/* Primary links + dropdowns — desktop */}
            <div ref={dropdownRef} className="hidden lg:flex items-center gap-0.5 xl:gap-1">
              {primaryLinks.map((item) => {
                const active = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`relative flex items-center gap-1.5 px-2.5 xl:px-3.5 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                      active
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-ink-soft dark:text-cream/70 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                  >
                    <Icon className="h-4 w-4 opacity-70 xl:hidden" />
                    {item.name}
                    {active && (
                      <motion.span layoutId="navUnderline" className="absolute left-2.5 right-2.5 xl:left-3.5 xl:right-3.5 -bottom-0.5 h-0.5 rounded-full bg-primary-500" />
                    )}
                  </Link>
                );
              })}
              {renderDropdown('services', 'Services', Package, servicesLinks)}
              {renderDropdown('dashboard', 'Dashboard', LayoutDashboard, dashboardLinks)}
              {renderDropdown('resources', 'Resources', HelpCircle, resourcesLinks)}
            </div>

            {/* Right side — search, theme, bell, avatar, hamburger */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-full hover:bg-oat dark:hover:bg-secondary-800 transition-colors"
                aria-label="Search"
              >
                <SearchIcon className="h-5 w-5 text-ink-soft dark:text-cream/70" />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-oat dark:hover:bg-secondary-800 transition-colors"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  {theme === 'light' ? (
                    <motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                      <Moon className="h-5 w-5 text-ink-soft" />
                    </motion.div>
                  ) : (
                    <motion.div key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                      <Sun className="h-5 w-5 text-accent-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {user && <NotificationBell />}

              {user ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full glass hover:shadow-soft transition-all"
                  aria-label="My profile"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-cream text-sm font-bold">
                    {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium max-w-[110px] truncate text-ink dark:text-cream">
                    {profile?.full_name?.split(' ')[0] ?? 'User'}
                  </span>
                </Link>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm">Login</Link>
                  <Link to="/register" className="btn-primary text-sm">Register</Link>
                </div>
              )}

              {/* Hamburger — opens the drawer */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-2 rounded-full hover:bg-oat dark:hover:bg-secondary-800 transition-colors"
                aria-label="Open menu"
              >
                <motion.div initial={false} animate={{ rotate: drawerOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <Menu className="h-6 w-6 text-ink dark:text-cream" />
                </motion.div>
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
              className="overflow-hidden border-t border-linen dark:border-secondary-800"
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
      </motion.nav>

      {/* Premium glassmorphism drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[60] bg-ink/30 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md flex flex-col"
            >
              <div className="h-full m-3 rounded-3xl overflow-hidden flex flex-col bg-cream/90 dark:bg-secondary-950/90 backdrop-blur-2xl border border-linen/70 dark:border-secondary-800/60 shadow-premium-lg">
                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-linen/70 dark:border-secondary-800/60">
                  <div className="flex items-center gap-2.5">
                    <img src="/logo.png" alt="FoodBridge" className="h-8 w-8 object-contain" />
                    <span className="font-display text-lg font-semibold gradient-text-soft">Menu</span>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-2 rounded-full hover:bg-oat dark:hover:bg-secondary-800 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5 text-ink dark:text-cream" />
                  </button>
                </div>

                {/* Quick access — Services & Dashboards */}
                <div className="px-4 pt-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft dark:text-cream/50 px-1">
                    Quick Access
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/services/donate-food" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-800/40 transition-colors">
                      <Package className="h-4 w-4 text-primary-600 dark:text-primary-400" strokeWidth={1.75} />
                      <span className="text-sm font-medium text-ink dark:text-cream">Donate Food</span>
                    </Link>
                    <Link to="/services/available-food" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary-50 dark:bg-secondary-900/30 hover:bg-secondary-100 dark:hover:bg-secondary-800/40 transition-colors">
                      <Search className="h-4 w-4 text-secondary-600 dark:text-secondary-400" strokeWidth={1.75} />
                      <span className="text-sm font-medium text-ink dark:text-cream">Available</span>
                    </Link>
                    <Link to="/dashboard/volunteer" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-accent-50 dark:bg-accent-900/30 hover:bg-accent-100 dark:hover:bg-accent-800/40 transition-colors">
                      <LayoutDashboard className="h-4 w-4 text-accent-600 dark:text-accent-400" strokeWidth={1.75} />
                      <span className="text-sm font-medium text-ink dark:text-cream">Volunteer</span>
                    </Link>
                    <Link to="/dashboard/admin" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-800/40 transition-colors">
                      <Building2 className="h-4 w-4 text-primary-600 dark:text-primary-400" strokeWidth={1.75} />
                      <span className="text-sm font-medium text-ink dark:text-cream">Admin</span>
                    </Link>
                  </div>
                </div>

                {/* User card (when signed in) */}
                {user && (
                  <div className="mx-4 mt-4 p-4 rounded-2xl-premium bg-gradient-to-br from-secondary-700 to-secondary-800 text-cream">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-cream/15 backdrop-blur flex items-center justify-center text-cream font-bold text-lg">
                        {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{profile?.full_name ?? 'User'}</p>
                        <p className="text-xs text-cream/70 truncate">{profile?.email ?? user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scrollable sections */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 no-scrollbar">
                  {drawerSections.map((section) => {
                    const SectionIcon = section.icon;
                    const accent = accentClasses[section.accent];
                    return (
                      <div key={section.id}>
                        <div className="flex items-center gap-2 px-1 mb-2">
                          <span className={`h-7 w-7 rounded-lg flex items-center justify-center ${accent.chip}`}>
                            <SectionIcon className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft dark:text-cream/50">
                            {section.label}
                          </h3>
                          <span className={`flex-1 h-px ml-1 ${accent.dot} opacity-20`} style={{ backgroundColor: 'currentColor' }} />
                        </div>
                        <div className="space-y-0.5">
                          {section.links.map((link) => {
                            const active = location.pathname === link.path;
                            const LinkIcon = link.icon;
                            return (
                              <Link
                                key={link.path + link.name}
                                to={link.path}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl-premium transition-all duration-200 ${
                                  active
                                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                    : `${accent.hover} text-ink-soft dark:text-cream/70`
                                }`}
                              >
                                <span className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  active ? accent.activeIcon : 'bg-oat dark:bg-secondary-800 ' + accent.icon
                                }`}>
                                  <LinkIcon className="h-4 w-4" strokeWidth={1.75} />
                                </span>
                                <span className="text-sm font-medium flex-1">{link.name}</span>
                                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity" />
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Account actions */}
                  <div>
                    <div className="flex items-center gap-2 px-1 mb-2">
                      <span className="h-7 w-7 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                        <LogOut className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft dark:text-cream/50">
                        Account Actions
                      </h3>
                    </div>
                    {user ? (
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl-premium hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                      >
                        <span className="h-8 w-8 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-900/40 text-red-600">
                          <LogOut className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    ) : (
                      <div className="space-y-0.5">
                        <Link
                          to="/login"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl-premium hover:bg-oat dark:hover:bg-secondary-800 text-ink-soft dark:text-cream/70 transition-colors"
                        >
                          <span className="h-8 w-8 rounded-lg flex items-center justify-center bg-oat dark:bg-secondary-800 text-primary-600">
                            <LogIn className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                          <span className="text-sm font-medium">Login</span>
                        </Link>
                        <Link
                          to="/register"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl-premium hover:bg-oat dark:hover:bg-secondary-800 text-ink-soft dark:text-cream/70 transition-colors"
                        >
                          <span className="h-8 w-8 rounded-lg flex items-center justify-center bg-oat dark:bg-secondary-800 text-accent-600">
                            <UserPlus className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                          <span className="text-sm font-medium">Register</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Drawer footer */}
                <div className="px-5 py-3.5 border-t border-linen/70 dark:border-secondary-800/60 text-center">
                  <p className="text-xs text-ink-soft/70 dark:text-cream/40">No plate left empty.</p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
