import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Clock, CheckCircle2, TrendingUp, Plus, MapPin, Award,
  Loader2, Search, ShieldCheck, CheckCircle, XCircle, Bell, User as UserIcon,
  Mail, Phone, MapPin, Calendar, Building2, Edit3, QrCode, Download, ExternalLink, Eye,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { AnimatedCounter } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { DashboardSectionHeader, StatCard } from '@/components/dashboard/DashboardLayout';
import { DonationQrModal } from '@/components/DonationQrCard';
import type { FoodDonation, Certificate, Notification } from '@/types';

/* ---------- Donate Food ---------- */
export function UserDonateFoodSection() {
  const { profile } = useAuth();
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('food_donations')
      .select('*')
      .eq('donor_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5);
    setDonations((data as FoodDonation[]) ?? []);
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    load();
    const ch = supabase.channel('user-donations').on('postgres_changes', { event: '*', schema: 'public', table: 'food_donations' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      available: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      claimed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };
    return map[s] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <div>
      <DashboardSectionHeader
        title="Donate Food"
        description="Create a new food donation or manage your recent ones."
        action={<Link to="/services/donate-food"><RippleButton variant="primary"><Plus className="h-4 w-4" /> New Donation</RippleButton></Link>}
      />
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : donations.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">You haven't donated any food yet.</p>
            <Link to="/services/donate-food"><RippleButton variant="primary"><Plus className="h-4 w-4" /> Create your first donation</RippleButton></Link>
          </div>
        ) : (
          donations.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center shrink-0">
                <Package className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{d.food_name}</p>
                <p className="text-xs text-gray-500 truncate">{d.quantity} {d.quantity_unit} - {d.organization}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0 ${statusBadge(d.status)}`}>{d.status}</span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

/* ---------- Track Donation ---------- */
export function UserTrackDonationSection() {
  const { profile } = useAuth();
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrDonation, setQrDonation] = useState<FoodDonation | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!profile?.id) return;
      const { data } = await supabase
        .from('food_donations')
        .select('*')
        .eq('donor_id', profile.id)
        .order('created_at', { ascending: false });
      setDonations((data as FoodDonation[]) ?? []);
      setLoading(false);
    };
    load();
    const ch = supabase.channel('user-track').on('postgres_changes', { event: '*', schema: 'public', table: 'food_donations' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [profile?.id]);

  const active = donations.filter((d) => d.status === 'available' || d.status === 'claimed' || d.status === 'picked_up');
  const completed = donations.filter((d) => d.status === 'delivered');

  const totalMeals = donations.reduce((sum, d) => sum + (d.estimated_meals ?? 0), 0);
  const totalKg = donations.reduce((sum, d) => {
    const q = parseFloat(d.quantity);
    if (!isNaN(q) && d.quantity_unit?.toLowerCase().match(/kg|kilo/)) return sum + q;
    return sum;
  }, 0);
  const totalLiters = donations.reduce((sum, d) => {
    const q = parseFloat(d.quantity);
    if (!isNaN(q) && d.quantity_unit?.toLowerCase().match(/l|liter/)) return sum + q;
    return sum;
  }, 0);

  const stepMap: Record<string, number> = { available: 1, claimed: 2, picked_up: 3, delivered: 4 };
  const steps = ['Created', 'Assigned', 'Picked Up', 'Delivered'];

  return (
    <div>
      <DashboardSectionHeader title="Track Donations" description="Follow your donations from creation to delivery in real time." />
      <div className="glass-card p-5 mb-6 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-5 w-5 text-primary-500" />
          <h3 className="font-display font-bold text-sm">Total Food Donated</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="font-stat text-2xl font-bold text-primary-600 dark:text-primary-400">{donations.length}</p>
            <p className="text-xs text-gray-500">Donations</p>
          </div>
          <div>
            <p className="font-stat text-2xl font-bold text-primary-600 dark:text-primary-400">{totalMeals.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Meals Provided</p>
          </div>
          <div>
            <p className="font-stat text-2xl font-bold text-primary-600 dark:text-primary-400">{totalKg > 0 ? `${totalKg.toFixed(1)} kg` : '—'}</p>
            <p className="text-xs text-gray-500">Food (kg)</p>
          </div>
          <div>
            <p className="font-stat text-2xl font-bold text-primary-600 dark:text-primary-400">{totalLiters > 0 ? `${totalLiters.toFixed(1)} L` : '—'}</p>
            <p className="text-xs text-gray-500">Beverages (L)</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={Clock} label="Active" value={active.length} color="bg-amber-500" />
        <StatCard icon={CheckCircle2} label="Delivered" value={completed.length} color="bg-green-500" />
        <StatCard icon={Package} label="Total" value={donations.length} color="bg-primary-500" />
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : donations.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No donations to track yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {donations.slice(0, 8).map((d, i) => {
            const step = stepMap[d.status] ?? 0;
            return (
              <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{d.food_name}</p>
                    <p className="text-xs text-gray-500 truncate">{d.organization} - {d.city}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {d.donation_code && <span className="text-xs font-mono text-gray-400 hidden sm:inline">{d.donation_code}</span>}
                    <RippleButton onClick={() => setQrDonation(d)} variant="ghost" className="text-xs px-2.5 py-1.5">
                      <QrCode className="h-3.5 w-3.5" /> Show QR
                    </RippleButton>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {steps.map((s, idx) => (
                    <div key={s} className="flex items-center gap-1 flex-1">
                      <div className={`h-2 flex-1 rounded-full ${idx < step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1.5">
                  {steps.map((s, idx) => (
                    <span key={s} className={`text-[10px] ${idx < step ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>{s}</span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      <DonationQrModal donation={qrDonation} donorName={profile?.full_name ?? ''} onClose={() => setQrDonation(null)} />
    </div>
  );
}

/* ---------- My Certificates ---------- */
export function UserCertificatesSection() {
  const { user, profile } = useAuth();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase.from('certificates').select('*').eq('volunteer_id', user.id).order('created_at', { ascending: false });
      setCerts((data as Certificate[]) ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <div>
      <DashboardSectionHeader
        title="My Certificates"
        description="Your volunteer appreciation certificates."
        action={<Link to="/services/certificate-history"><RippleButton variant="secondary">View All</RippleButton></Link>}
      />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : certs.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No certificates yet. Complete deliveries to earn certificates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certs.slice(0, 4).map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-accent-500" />
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg">
                  <Award className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{c.volunteer_name ?? profile?.full_name}</p>
                  <p className="text-xs text-gray-400 font-mono">{c.certificate_number}</p>
                </div>
                {c.is_valid && <ShieldCheck className="h-4 w-4 text-green-500 ml-auto shrink-0" />}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="font-bold text-sm">{c.deliveries_count}</p><p className="text-[10px] text-gray-400">Deliveries</p></div>
                <div><p className="font-bold text-sm">{Math.round(c.hours_served)}</p><p className="text-[10px] text-gray-400">Hours</p></div>
                <div><p className="font-bold text-sm">{c.total_meals}</p><p className="text-[10px] text-gray-400">Meals</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- My QR Code ---------- */
export function UserMyQrSection() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const donorUrl = profile?.username ? `${window.location.origin}/donor/${profile.username}` : '';

  useEffect(() => {
    if (!donorUrl) return;
    QRCode.toDataURL(donorUrl, {
      width: 320,
      margin: 2,
      color: { dark: '#1B4332', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })
      .then(setQrUrl)
      .catch(() => setQrUrl(''));
  }, [donorUrl]);

  const downloadQr = () => {
    if (!qrUrl || !profile) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `FoodBridge-QR-${profile.username}.png`;
    a.click();
    showToast('QR code downloaded', 'success');
  };

  const copyLink = async () => {
    if (!donorUrl) return;
    await navigator.clipboard.writeText(donorUrl);
    setCopied(true);
    showToast('Link copied', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <DashboardSectionHeader
        title="My QR Code"
        description="Your unique donor code — volunteers scan it to confirm your identity."
        action={
          <Link to={`/donor/${profile?.username}`} target="_blank">
            <RippleButton variant="secondary"><ExternalLink className="h-4 w-4" /> Open page</RippleButton>
          </Link>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="glass-card p-6 flex flex-col items-center text-center">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-2xl blur-lg" />
            <div className="relative bg-white p-4 rounded-2xl shadow-lg ring-1 ring-black/5">
              {qrUrl ? (
                <img src={qrUrl} alt="Your donor QR code" className="w-44 h-44" />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 font-mono break-all">{donorUrl}</p>
          <div className="flex gap-2 mt-4">
            <RippleButton onClick={downloadQr} variant="primary" className="text-xs"><Download className="h-3.5 w-3.5" /> Download</RippleButton>
            <RippleButton onClick={copyLink} variant="ghost" className="text-xs">{copied ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <QrCode className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy link'}</RippleButton>
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-display font-bold mb-3 flex items-center gap-2"><QrCode className="h-5 w-5 text-primary-500" /> How it works</h3>
          <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex gap-3">
              <span className="h-6 w-6 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <span>When a volunteer arrives for pickup, show them this QR code on your phone.</span>
            </li>
            <li className="flex gap-3">
              <span className="h-6 w-6 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <span>They scan it with their phone camera to open your public donor page.</span>
            </li>
            <li className="flex gap-3">
              <span className="h-6 w-6 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <span>Your page confirms your identity, username, and donation stats — no login required on their end.</span>
            </li>
          </ol>
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Keep this code private. Anyone who scans it can view your public donor profile.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- QR Verification ---------- */
export function UserQrVerificationSection() {
  const [certNumber, setCertNumber] = useState('');
  const [result, setResult] = useState<'idle' | 'valid' | 'invalid' | 'searching'>('idle');
  const [cert, setCert] = useState<Certificate | null>(null);

  const verify = async (num: string) => {
    if (!num.trim()) return;
    setResult('searching');
    const { data } = await supabase.from('certificates').select('*, volunteer:profiles(*)').eq('certificate_number', num.trim()).maybeSingle();
    if (data && (data as Certificate).is_valid) {
      setCert(data as Certificate);
      setResult('valid');
    } else {
      setCert(null);
      setResult('invalid');
    }
  };

  return (
    <div>
      <DashboardSectionHeader title="QR Verification" description="Verify the authenticity of a certificate." />
      <div className="glass-card p-6 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verify(certNumber)}
              placeholder="Enter certificate ID (e.g. FB-2026-0001)"
              className="input-field pl-12"
            />
          </div>
          <RippleButton onClick={() => verify(certNumber)} variant="primary"><ShieldCheck className="h-4 w-4" /> Verify</RippleButton>
        </div>
      </div>
      {result === 'searching' && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>}
      {result === 'valid' && cert && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h3 className="font-display text-lg font-bold text-green-600">Certificate Valid</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs text-gray-400">Volunteer</p><p className="font-medium">{cert.volunteer?.full_name ?? cert.volunteer_name}</p></div>
            <div><p className="text-xs text-gray-400">Certificate ID</p><p className="font-medium font-mono">{cert.certificate_number}</p></div>
            <div><p className="text-xs text-gray-400">Deliveries</p><p className="font-medium">{cert.deliveries_count}</p></div>
            <div><p className="text-xs text-gray-400">Hours Served</p><p className="font-medium">{Math.round(cert.hours_served)}</p></div>
          </div>
        </motion.div>
      )}
      {result === 'invalid' && (
        <div className="glass-card p-8 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="font-medium text-red-500">Invalid Certificate</p>
          <p className="text-sm text-gray-400 mt-1">No valid certificate found with this ID.</p>
        </div>
      )}
      {result === 'idle' && (
        <div className="glass-card p-10 text-center">
          <ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Enter a certificate number to verify.</p>
        </div>
      )}
    </div>
  );
}

/* ---------- Notifications ---------- */
export function UserNotificationsSection() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const list = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <div>
      <DashboardSectionHeader
        title="Notifications"
        description={`${unreadCount} unread of ${notifications.length} total`}
        action={unreadCount > 0 ? <RippleButton onClick={markAllAsRead} variant="secondary">Mark all read</RippleButton> : undefined}
      />
      <div className="flex gap-2 mb-4">
        {(['all', 'unread'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-primary-600 text-white' : 'glass text-gray-600 dark:text-gray-300'}`}>
            {f}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notifications.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className={`glass-card p-4 flex items-start gap-3 ${!n.is_read ? 'border-l-4 border-primary-500' : ''}`}>
              <div className="h-9 w-9 rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center shrink-0">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.description}</p>
                <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!n.is_read && <button onClick={() => markAsRead(n.id)} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600"><CheckCircle className="h-4 w-4" /></button>}
                <button onClick={() => deleteNotification(n.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><XCircle className="h-4 w-4" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Profile ---------- */
export function UserProfileSection() {
  const { profile } = useAuth();
  const info = [
    { icon: UserIcon, label: 'Full Name', value: profile?.full_name },
    { icon: Mail, label: 'Email', value: profile?.email },
    { icon: Phone, label: 'Phone', value: profile?.phone ?? 'Not provided' },
    { icon: Building2, label: 'Organization', value: profile?.organization ?? 'Not provided' },
    { icon: MapPin, label: 'Location', value: [profile?.city, profile?.state].filter(Boolean).join(', ') || 'Not provided' },
    { icon: Calendar, label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '' },
  ];
  return (
    <div>
      <DashboardSectionHeader
        title="My Profile"
        description="Your account information."
        action={<Link to="/profile"><RippleButton variant="secondary"><Edit3 className="h-4 w-4" /> Edit</RippleButton></Link>}
      />
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className="font-display text-xl font-bold">{profile?.full_name}</p>
            <p className="text-sm text-gray-500 capitalize">{profile?.role}</p>
            {profile?.is_verified && <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1"><ShieldCheck className="h-3 w-3" /> Verified</span>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {info.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <Icon className="h-5 w-5 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium truncate">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Award} label="Reward Points" value={profile?.reward_points ?? 0} color="bg-yellow-500" />
        <StatCard icon={Package} label="Deliveries" value={profile?.total_deliveries ?? 0} color="bg-primary-500" />
        <StatCard icon={Clock} label="Hours Served" value={profile?.total_hours ?? 0} color="bg-blue-500" />
        <StatCard icon={TrendingUp} label="Rating" value={`${profile?.rating ?? 0}/5`} color="bg-green-500" />
      </div>
    </div>
  );
}
