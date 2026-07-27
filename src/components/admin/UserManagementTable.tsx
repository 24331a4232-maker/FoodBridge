import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, Eye, EyeOff, Loader2, MapPin, Phone, Mail,
  Building2, Calendar, Clock, ShieldCheck, Hotel, HeartHandshake, Truck,
  Trash2, AlertTriangle, X, UserX, Edit3, Save, Check,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';

type DeleteState = 'idle' | 'confirming' | 'deleting' | 'error';
type EditState = 'idle' | 'saving' | 'error';

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'donor', label: 'Donor' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'ngo', label: 'NGO' },
  { value: 'admin', label: 'Admin' },
];

const roleMeta: Record<UserRole, { label: string; icon: typeof Users; color: string; bg: string }> = {
  admin: { label: 'Admin', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  restaurant: { label: 'Restaurant', icon: Hotel, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  donor: { label: 'Donor', icon: HeartHandshake, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  volunteer: { label: 'Volunteer', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  ngo: { label: 'NGO', icon: Building2, color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/30' },
};

const roleFilters: { value: UserRole | 'all'; label: string }[] = [
  { value: 'all', label: 'All Users' },
  { value: 'admin', label: 'Admins' },
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'donor', label: 'Donors' },
  { value: 'volunteer', label: 'Volunteers' },
  { value: 'ngo', label: 'NGOs' },
];

function formatDate(value: string | null): string {
  if (!value) return 'Never';
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(value: string | null): string {
  if (!value) return 'Never';
  return new Date(value).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';
}

export function UserManagementTable() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>('idle');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Profile | null>(null);
  const [editState, setEditState] = useState<EditState>('idle');
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '', email: '', phone: '', role: 'donor' as UserRole,
    organization: '', address: '', city: '', state: '', pincode: '', bio: '',
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteState('deleting');
    setDeleteError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setDeleteState('error');
        setDeleteError('Your session has expired. Please sign in again.');
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId: deleteTarget.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setDeleteState('error');
        setDeleteError(json?.error ?? 'Failed to delete user');
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleteState('idle');
    } catch (err) {
      setDeleteState('error');
      setDeleteError(err instanceof Error ? err.message : 'Unexpected error');
    }
  };

  const closeDeleteModal = () => {
    if (deleteState === 'deleting') return;
    setDeleteTarget(null);
    setDeleteState('idle');
    setDeleteError(null);
  };

  const openEditModal = (u: Profile) => {
    setEditTarget(u);
    setEditState('idle');
    setEditError(null);
    setEditForm({
      full_name: u.full_name, email: u.email, phone: u.phone ?? '', role: u.role,
      organization: u.organization ?? '', address: u.address ?? '',
      city: u.city ?? '', state: u.state ?? '', pincode: u.pincode ?? '', bio: u.bio ?? '',
    });
  };

  const closeEditModal = () => {
    if (editState === 'saving') return;
    setEditTarget(null);
    setEditState('idle');
    setEditError(null);
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    setEditState('saving');
    setEditError(null);
    const { error } = await supabase.from('profiles').update({
      full_name: editForm.full_name,
      email: editForm.email,
      phone: editForm.phone || null,
      role: editForm.role,
      organization: editForm.organization || null,
      address: editForm.address || null,
      city: editForm.city || null,
      state: editForm.state || null,
      pincode: editForm.pincode || null,
      bio: editForm.bio || null,
    }).eq('id', editTarget.id);
    if (error) {
      setEditState('error');
      setEditError(error.message);
      return;
    }
    setEditTarget(null);
    setEditState('idle');
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) {
        setError(err.message);
      } else {
        setUsers((data as Profile[]) ?? []);
      }
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel('admin-profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? '').includes(q) ||
        (u.organization ?? '').toLowerCase().includes(q) ||
        (u.city ?? '').toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: users.length };
    users.forEach((u) => { c[u.role] = (c[u.role] ?? 0) + 1; });
    return c;
  }, [users]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-5 sm:p-6 mt-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary-600" />
          <h2 className="font-display text-lg font-bold">User Management</h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
            {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, username, email, phone, organization, or city..."
          className="input-field pl-12"
        />
      </div>

      {/* Role filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {roleFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setRoleFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              roleFilter === f.value
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                : 'glass hover:bg-primary-50 dark:hover:bg-primary-900/30 text-gray-600 dark:text-gray-300'
            }`}
          >
            {f.label} ({counts[f.value] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500 text-sm">
          Failed to load users: {error}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">No users match your search.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Contact</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Joined</th>
                  <th className="pb-3 font-medium">Last Login</th>
                  <th className="pb-3 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((u) => {
                  const meta = roleMeta[u.role];
                  const RoleIcon = meta.icon;
                  const expanded = expandedId === u.id;
                  return (
                    <>
                      <tr key={u.id} className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-full ${meta.bg} ${meta.color} flex items-center justify-center text-xs font-bold shrink-0`}>
                              {initials(u.full_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{u.full_name}</p>
                              <p className="text-xs text-gray-400 truncate">@{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${meta.bg} ${meta.color}`}>
                            <RoleIcon className="h-3 w-3" />
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3">
                          <p className="text-xs truncate max-w-[180px]">{u.email}</p>
                          <p className="text-xs text-gray-400">{u.phone ?? 'No phone'}</p>
                        </td>
                        <td className="py-3 text-xs text-gray-600 dark:text-gray-300">
                          {[u.city, u.state].filter(Boolean).join(', ') || 'Not provided'}
                        </td>
                        <td className="py-3 text-xs text-gray-500">{formatDate(u.created_at)}</td>
                        <td className="py-3 text-xs text-gray-500">{formatDate(u.last_login)}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setExpandedId(expanded ? null : u.id)}
                              className="text-primary-600 hover:text-primary-700 p-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30"
                              title="Toggle details"
                            >
                              {expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => openEditModal(u)}
                              className="text-primary-600 hover:text-primary-700 p-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30"
                              title="Edit user"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => { setDeleteTarget(u); setDeleteState('confirming'); setDeleteError(null); }}
                                className="text-red-500 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expanded && (
                        <tr key={`${u.id}-detail`}>
                          <td colSpan={7} className="pb-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs">
                              <div>
                                <p className="text-gray-400 mb-0.5">Organization</p>
                                <p className="font-medium">{u.organization || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 mb-0.5">Address</p>
                                <p className="font-medium">{u.address || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 mb-0.5">Pincode</p>
                                <p className="font-medium">{u.pincode || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 mb-0.5">Verified</p>
                                <p className="font-medium">{u.is_verified ? 'Yes' : 'No'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 mb-0.5">Reward Points</p>
                                <p className="font-medium">{u.reward_points}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 mb-0.5">Total Deliveries</p>
                                <p className="font-medium">{u.total_deliveries}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 mb-0.5">Total Hours</p>
                                <p className="font-medium">{u.total_hours}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 mb-0.5">Rating</p>
                                <p className="font-medium">{u.rating} / 5</p>
                              </div>
                              <div>
                                <p className="text-gray-400 mb-0.5">Availability</p>
                                <p className="font-medium capitalize">{u.availability}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 mb-0.5">Badges</p>
                                <p className="font-medium">{u.badges?.length ?? 0} earned</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-gray-400 mb-0.5">Bio</p>
                                <p className="font-medium">{u.bio || 'Not provided'}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map((u) => {
              const meta = roleMeta[u.role];
              const RoleIcon = meta.icon;
              const expanded = expandedId === u.id;
              return (
                <div key={u.id} className="rounded-xl glass p-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-full ${meta.bg} ${meta.color} flex items-center justify-center text-sm font-bold shrink-0`}>
                      {initials(u.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium truncate">{u.full_name}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${meta.bg} ${meta.color} shrink-0`}>
                          <RoleIcon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">@{u.username}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gray-400" /> {u.email}</p>
                    <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-gray-400" /> {u.phone ?? 'No phone'}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-gray-400" /> {[u.city, u.state].filter(Boolean).join(', ') || 'Not provided'}</p>
                    <p className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-gray-400" /> Joined {formatDate(u.created_at)}</p>
                    <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-gray-400" /> Last login {formatDateTime(u.last_login)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setExpandedId(expanded ? null : u.id)}
                      className="text-xs font-medium text-primary-600 hover:underline flex items-center gap-1"
                    >
                      {expanded ? <><EyeOff className="h-3.5 w-3.5" /> Hide details</> : <><Eye className="h-3.5 w-3.5" /> Show details</>}
                    </button>
                    <button
                      onClick={() => openEditModal(u)}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </button>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => { setDeleteTarget(u); setDeleteState('confirming'); setDeleteError(null); }}
                        className="text-xs font-medium text-red-500 hover:text-red-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    )}
                  </div>
                  {expanded && (
                    <div className="mt-3 grid grid-cols-2 gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-xs">
                      <div><p className="text-gray-400">Organization</p><p className="font-medium">{u.organization || 'N/A'}</p></div>
                      <div><p className="text-gray-400">Address</p><p className="font-medium">{u.address || 'N/A'}</p></div>
                      <div><p className="text-gray-400">Pincode</p><p className="font-medium">{u.pincode || 'N/A'}</p></div>
                      <div><p className="text-gray-400">Verified</p><p className="font-medium">{u.is_verified ? 'Yes' : 'No'}</p></div>
                      <div><p className="text-gray-400">Reward Points</p><p className="font-medium">{u.reward_points}</p></div>
                      <div><p className="text-gray-400">Deliveries</p><p className="font-medium">{u.total_deliveries}</p></div>
                      <div><p className="text-gray-400">Hours</p><p className="font-medium">{u.total_hours}</p></div>
                      <div><p className="text-gray-400">Rating</p><p className="font-medium">{u.rating} / 5</p></div>
                      <div><p className="text-gray-400">Availability</p><p className="font-medium capitalize">{u.availability}</p></div>
                      <div><p className="text-gray-400">Badges</p><p className="font-medium">{u.badges?.length ?? 0}</p></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeDeleteModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-white dark:bg-secondary-900 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={closeDeleteModal}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center shrink-0">
                    <UserX className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Delete User</h3>
                    <p className="text-xs text-gray-500">This action cannot be undone.</p>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 mb-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {initials(deleteTarget.full_name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate text-gray-900 dark:text-white">{deleteTarget.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{deleteTarget.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 p-3 mb-4">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                    The account and all related data (donations, pickups, certificates, inspection reports, and notifications) will be permanently removed from the database. The user will no longer be able to sign in.
                  </p>
                </div>

                {deleteState === 'error' && deleteError && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 p-3 mb-4 text-xs text-red-600 dark:text-red-400">
                    {deleteError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={closeDeleteModal}
                    disabled={deleteState === 'deleting'}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleteState === 'deleting'}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleteState === 'deleting' ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</>
                    ) : (
                      <><Trash2 className="h-4 w-4" /> Delete Permanently</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeEditModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-primary-500" /> Edit User
                </h3>
                <button onClick={closeEditModal} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Full Name</p>
                  <input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} className="input-field" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Email</p>
                    <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Phone</p>
                    <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="input-field" placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Role</p>
                  <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })} className="input-field capitalize">
                    {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Organization</p>
                  <input value={editForm.organization} onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })} className="input-field" placeholder="Hotel / NGO name" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Address</p>
                    <input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">City</p>
                    <input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">State</p>
                    <input value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Pincode</p>
                    <input value={editForm.pincode} onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })} className="input-field" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Bio</p>
                  <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={2} className="input-field resize-none" />
                </div>
                {editState === 'error' && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> {editError}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={closeEditModal}
                    disabled={editState === 'saving'}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={editState === 'saving'}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {editState === 'saving' ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="h-4 w-4" /> Save Changes</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
