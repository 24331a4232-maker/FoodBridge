import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Menu, X, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

export interface NavItem {
  key: string;
  label: string;
  icon: typeof LogOut;
  content: ReactNode;
}

interface DashboardLayoutProps {
  navItems: NavItem[];
  title: string;
  subtitle: string;
  roles: UserRole[];
  accent?: string;
}

export function DashboardLayout({ navItems, title, subtitle, roles, accent = 'primary' }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const hash = location.hash.replace('#', '');
  const activeKey = navItems.find((n) => n.key === hash)?.key ?? navItems[0]?.key;
  const activeItem = navItems.find((n) => n.key === activeKey) ?? navItems[0];

  const handleNav = (key: string) => {
    navigate(`${location.pathname}#${key}`, { replace: true });
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const accentClasses: Record<string, { sidebar: string; active: string; badge: string; header: string }> = {
    primary: { sidebar: 'from-primary-600 to-primary-700', active: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300', badge: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300', header: 'from-primary-500/10 to-transparent' },
    blue: { sidebar: 'from-blue-600 to-blue-700', active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', header: 'from-blue-500/10 to-transparent' },
    rose: { sidebar: 'from-rose-600 to-rose-700', active: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', header: 'from-rose-500/10 to-transparent' },
  };
  const a = accentClasses[accent] ?? accentClasses.primary;

  return (
    <div className="pt-16 min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 pt-16 bg-gradient-to-b ${a.sidebar} text-white z-30`}>
        <div className="px-5 py-5 border-b border-white/10">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <p className="text-xs text-white/70 mt-0.5">{subtitle}</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-white/20 text-white shadow-lg' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shrink-0">
              {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name ?? 'User'}</p>
              <p className="text-xs text-white/60 truncate capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="font-display text-base font-bold">{title}</h2>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${a.badge}`}>{activeItem?.label}</span>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`lg:hidden fixed inset-y-0 left-0 top-0 w-72 bg-gradient-to-b ${a.sidebar} text-white z-50 flex flex-col`}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div>
                  <h2 className="font-display text-lg font-bold">{title}</h2>
                  <p className="text-xs text-white/70 mt-0.5">{subtitle}</p>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 no-scrollbar">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.key === activeKey;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleNav(item.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive ? 'bg-white/20 text-white shadow-lg' : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="px-3 py-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-2 py-2 mb-2">
                  <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shrink-0">
                    {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{profile?.full_name ?? 'User'}</p>
                    <p className="text-xs text-white/60 truncate capitalize">{profile?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 pt-14 lg:pt-16">
        <div className={`px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {activeItem?.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function DashboardSectionHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold">{title}</h1>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, color }: { icon: typeof LogOut; label: string; value: number | string; color: string }) {
  return (
    <div className="glass-card p-4">
      <div className={`h-10 w-10 rounded-xl ${color} text-white flex items-center justify-center shadow-lg mb-3`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-display text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export function BackToDashboardLink({ to }: { to: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4">
      <ChevronLeft className="h-4 w-4" /> Back to Dashboard
    </Link>
  );
}
