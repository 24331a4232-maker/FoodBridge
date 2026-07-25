import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Check, CheckCheck, Trash2, Search, X, UtensilsCrossed, HeartHandshake,
  ShieldCheck, Truck, PartyPopper, Award, MapPin, AlertTriangle, Heart, Inbox,
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import type { Notification, NotificationType } from '@/types';

const typeMeta: Record<NotificationType, { icon: typeof Bell; gradient: string; label: string }> = {
  new_donation: { icon: UtensilsCrossed, gradient: 'from-primary-500 to-primary-600', label: 'Donation' },
  volunteer_assigned: { icon: HeartHandshake, gradient: 'from-primary-500 to-primary-600', label: 'Volunteer' },
  donation_approved: { icon: ShieldCheck, gradient: 'from-primary-500 to-primary-600', label: 'Approved' },
  pickup_started: { icon: Truck, gradient: 'from-secondary-500 to-secondary-600', label: 'Pickup' },
  delivery_completed: { icon: PartyPopper, gradient: 'from-primary-500 to-primary-600', label: 'Delivered' },
  certificate_generated: { icon: Award, gradient: 'from-gold-500 to-accent-500', label: 'Certificate' },
  volunteer_arrived: { icon: MapPin, gradient: 'from-primary-500 to-secondary-600', label: 'Arrived' },
  food_expiring: { icon: AlertTriangle, gradient: 'from-accent-500 to-red-500', label: 'Expiring' },
  thank_you: { icon: Heart, gradient: 'from-red-500 to-pink-600', label: 'Thanks' },
};

type Filter = 'all' | 'unread' | 'today' | 'week';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isThisWeek(iso: string): boolean {
  const d = new Date(iso);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return d.getTime() >= weekAgo;
}

export function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, clearAll } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const filtered = useMemo(() => {
    let list = notifications;
    if (filter === 'unread') list = list.filter((n) => !n.is_read);
    if (filter === 'today') list = list.filter((n) => isToday(n.created_at));
    if (filter === 'week') list = list.filter((n) => isThisWeek(n.created_at));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q));
    }
    return list;
  }, [notifications, filter, query]);

  const handleCardClick = async (n: Notification) => {
    if (!n.is_read) await markAsRead(n.id);
    if (n.action_url) {
      navigate(n.action_url);
      setOpen(false);
    }
  };

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
  ];

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-[min(92vw,400px)] glass-card p-0 z-50 overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary-500" />
                <h3 className="font-display font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="badge bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-[10px]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 disabled:opacity-40 transition-colors"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
                <button
                  onClick={clearAll}
                  disabled={notifications.length === 0}
                  title="Clear all"
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 disabled:opacity-40 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search notifications..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-400 outline-none"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-1 px-3 py-2 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                    filter === f.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center">
                  <Inbox className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No notifications here</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filtered.map((n) => {
                    const meta = typeMeta[n.type] ?? typeMeta.thank_you;
                    const Icon = meta.icon;
                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30, height: 0 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ y: -2 }}
                        onClick={() => handleCardClick(n)}
                        className={`group relative flex gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 dark:border-gray-800/50 transition-colors ${
                          !n.is_read ? 'bg-primary-50/40 dark:bg-primary-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                        }`}
                      >
                        {!n.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />}
                        <div className={`shrink-0 h-9 w-9 rounded-xl bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center shadow-md`}>
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold truncate">{n.title}</p>
                            {!n.is_read && <span className="h-2 w-2 rounded-full bg-accent-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{n.description}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-gray-400">{timeAgo(n.created_at)}</span>
                            <span className={`badge text-[9px] bg-gradient-to-r ${meta.gradient} text-white`}>{meta.label}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.is_read && (
                            <button
                              onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                              title="Mark as read"
                              className="p-1 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-600"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                            title="Delete"
                            className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
