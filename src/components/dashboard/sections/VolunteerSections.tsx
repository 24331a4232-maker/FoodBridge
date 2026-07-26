import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Clock, CheckCircle2, MapPin, Truck, Navigation, Loader2,
  QrCode, ScanLine, Award, ShieldCheck, Zap, Target, Trophy, Star,
  Camera, Thermometer, CheckCircle, XCircle, Calendar,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useNotifications } from '@/context/NotificationContext';
import { AnimatedCounter } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { LeafletMap, haversineKm, type MapPoint } from '@/components/LeafletMap';
import { useGeolocation, getRoute, type RouteInfo } from '@/lib/geo';
import { DonationStatusTracker } from '@/components/DonationStatusTracker';
import { FoodQualityBadge } from '@/components/FoodQualityBadge';
import { DonationImage } from '@/components/Illustration';
import { DashboardSectionHeader, StatCard } from '@/components/dashboard/DashboardLayout';
import type { FoodDonation, Pickup } from '@/types';

/* ---------- Assigned Donations ---------- */
export function VolunteerAssignedSection() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { pushToast, pushNotification } = useNotifications();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('pickups').select('*, donation:food_donations(*)').eq('volunteer_id', user.id).order('created_at', { ascending: false });
    setPickups((data as Pickup[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    const ch = supabase.channel('vol-assigned').on('postgres_changes', { event: '*', schema: 'public', table: 'pickups' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const active = pickups.filter((p) => p.status === 'accepted' || p.status === 'in_progress');

  const markDelivered = async (pickup: Pickup) => {
    const { error } = await supabase.from('pickups').update({ status: 'delivered', delivered_at: new Date().toISOString() }).eq('id', pickup.id);
    if (error) { toast('Could not update status', 'error'); return; }
    await supabase.from('food_donations').update({ status: 'delivered', delivery_time: new Date().toISOString() }).eq('id', pickup.donation_id);
    if (profile) {
      await supabase.from('profiles').update({
        total_deliveries: (profile.total_deliveries ?? 0) + 1,
        total_hours: (profile.total_hours ?? 0) + 0.5,
        reward_points: (profile.reward_points ?? 0) + (pickup.points_earned ?? 25),
      }).eq('id', profile.id);
    }
    pushToast('Delivery completed! Points earned.', 'success');
    pushNotification({
      type: 'delivery_completed',
      title: 'Delivery Completed',
      description: `You delivered ${pickup.donation?.food_name ?? 'a donation'} and earned ${pickup.points_earned ?? 25} points.`,
      actionUrl: '/dashboard/volunteer',
    });
    load();
  };

  return (
    <div>
      <DashboardSectionHeader title="Assigned Donations" description="Pickups assigned to you that need action." />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Clock} label="Active" value={active.length} color="bg-amber-500" />
        <StatCard icon={CheckCircle2} label="Completed" value={pickups.filter((p) => p.status === 'delivered').length} color="bg-green-500" />
        <StatCard icon={Package} label="Total" value={pickups.length} color="bg-primary-500" />
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : active.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No active assignments right now.</p>
          <Link to="/services/available-food"><RippleButton variant="primary">Browse Available Food</RippleButton></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {active.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.donation?.food_name ?? 'Pickup'}</p>
                  <p className="text-xs text-gray-500 truncate">{p.donation?.organization} - {p.donation?.address ?? ''}</p>
                </div>
                <RippleButton onClick={() => markDelivered(p)} variant="primary" className="text-xs px-3 py-2 shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Delivered
                </RippleButton>
              </div>
              {p.donation && <DonationStatusTracker donation={p.donation} pickup={p} compact />}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Live Tracking ---------- */
export function VolunteerLiveTrackingSection() {
  const { user } = useAuth();
  const { position, loading: geoLoading, request: requestGeo } = useGeolocation();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase.from('pickups').select('*, donation:food_donations(*)').eq('volunteer_id', user.id).order('created_at', { ascending: false });
      setPickups((data as Pickup[]) ?? []);
      setLoading(false);
    };
    load();
    const ch = supabase.channel('vol-live').on('postgres_changes', { event: '*', schema: 'public', table: 'pickups' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const active = pickups.filter((p) => p.status === 'accepted' || p.status === 'in_progress');

  const mapPoints: MapPoint[] = [];
  if (position) mapPoints.push({ lat: position.lat, lng: position.lng, type: 'user', popup: 'You are here' });
  active.forEach((t) => {
    if (t.donation?.latitude != null && t.donation?.longitude != null) {
      mapPoints.push({ lat: t.donation.latitude, lng: t.donation.longitude, type: 'donor', popup: `<strong>${t.donation.food_name}</strong><br/>${t.donation.organization}` });
    }
  });

  const generateRoute = async (donation: FoodDonation) => {
    if (!position || donation.latitude == null || donation.longitude == null) return;
    setRouteLoading(true);
    const r = await getRoute([position.lat, position.lng], [donation.latitude, donation.longitude]);
    setRouteLoading(false);
    if (r) setRoute(r);
  };

  return (
    <div>
      <DashboardSectionHeader title="Live Tracking" description="See your active deliveries on the map in real time." />
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary-500" /> Live Map</h3>
          {!position && <RippleButton onClick={requestGeo} variant="ghost" className="text-xs" disabled={geoLoading}>{geoLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />} Enable Location</RippleButton>}
        </div>
        <LeafletMap points={mapPoints} showRoute={!!route} routeCoords={route?.coordinates ?? []} height="h-80" center={position ? [position.lat, position.lng] : [20.5937, 78.9629]} zoom={position ? 13 : 5} />
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : active.length === 0 ? (
        <div className="glass-card p-8 text-center"><p className="text-gray-500">No active deliveries to track.</p></div>
      ) : (
        <div className="space-y-3">
          {active.map((p) => {
            const dist = position && p.donation?.latitude != null && p.donation?.longitude != null ? haversineKm([position.lat, position.lng], [p.donation.latitude, p.donation.longitude]) : null;
            return (
              <div key={p.id} className="glass-card p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.donation?.food_name}</p>
                  <p className="text-xs text-gray-500 truncate">{p.donation?.organization}</p>
                </div>
                {dist != null && <span className="text-xs text-gray-400 shrink-0">{dist.toFixed(1)} km</span>}
                {position && p.donation?.latitude != null && (
                  <RippleButton onClick={() => generateRoute(p.donation!)} variant="ghost" className="text-xs px-3 py-1.5 shrink-0" disabled={routeLoading}>
                    <Navigation className="h-3 w-3" /> Route
                  </RippleButton>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- QR Scanner ---------- */
export function VolunteerQrScannerSection() {
  const [scanned, setScanned] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');

  const handleVerify = async (code: string) => {
    setStatus('verifying');
    // Simulate scan verification
    await new Promise((r) => setTimeout(r, 800));
    setScanned(code);
    setStatus('verified');
  };

  return (
    <div>
      <DashboardSectionHeader title="QR Scanner" description="Scan a donation QR code to verify and update pickup status." />
      <div className="glass-card p-8 text-center mb-4">
        <div className="h-48 w-48 mx-auto rounded-3xl border-4 border-dashed border-primary-300 dark:border-primary-700 flex items-center justify-center mb-4 relative overflow-hidden">
          <ScanLine className="h-20 w-20 text-primary-400" />
          <motion.div
            animate={{ y: [-80, 80, -80] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-4 right-4 h-1 bg-primary-500 rounded-full shadow-lg shadow-primary-500/50"
          />
        </div>
        <p className="text-sm text-gray-500 mb-4">Point your camera at the donation QR code</p>
        <RippleButton onClick={() => handleVerify('FB-DON-2026-0001')} variant="primary">
          <QrCode className="h-4 w-4" /> Simulate Scan
        </RippleButton>
      </div>
      {status === 'verifying' && <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>}
      {status === 'verified' && scanned && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h3 className="font-display text-lg font-bold text-green-600">Donation Verified</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs text-gray-400">Donation Code</p><p className="font-medium font-mono">{scanned}</p></div>
            <div><p className="text-xs text-gray-400">Status</p><span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Verified</span></div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ---------- Delivery History ---------- */
export function VolunteerDeliveryHistorySection() {
  const { user, profile } = useAuth();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase.from('pickups').select('*, donation:food_donations(*)').eq('volunteer_id', user.id).eq('status', 'delivered').order('created_at', { ascending: false });
      setPickups((data as Pickup[]) ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  const completed = pickups.filter((p) => p.status === 'delivered');

  return (
    <div>
      <DashboardSectionHeader title="Delivery History" description="All your completed deliveries." />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={CheckCircle2} label="Completed" value={completed.length} color="bg-green-500" />
        <StatCard icon={Clock} label="Hours" value={Math.round(profile?.total_hours ?? 0)} color="bg-blue-500" />
        <StatCard icon={Zap} label="Points" value={profile?.reward_points ?? 0} color="bg-yellow-500" />
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : completed.length === 0 ? (
        <div className="glass-card p-10 text-center"><CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No completed deliveries yet.</p></div>
      ) : (
        <div className="relative pl-6 space-y-4">
          <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-primary-200 dark:bg-primary-800" />
          {completed.map((p) => (
            <div key={p.id} className="relative">
              <div className="absolute -left-4 top-1 h-3 w-3 rounded-full bg-primary-500 ring-4 ring-primary-100 dark:ring-primary-900" />
              <p className="font-semibold text-sm">{p.donation?.food_name ?? 'Delivery'}</p>
              <p className="text-xs text-gray-500">{p.donation?.organization} - {new Date(p.delivered_at ?? p.created_at).toLocaleDateString()}</p>
              <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 mt-1">+{p.points_earned} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Food Quality Update ---------- */
export function VolunteerFoodQualitySection() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [quality, setQuality] = useState<Record<string, { freshness: string; temp: string; notes: string }>>({});

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase.from('pickups').select('*, donation:food_donations(*)').eq('volunteer_id', user.id).in('status', ['accepted', 'in_progress']).order('created_at', { ascending: false });
      setPickups((data as Pickup[]) ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  const submitQuality = async (pickup: Pickup) => {
    const q = quality[pickup.id];
    if (!q) return;
    setSubmitting(pickup.id);
    await supabase.from('food_donations').update({
      food_condition: q.freshness as 'fresh' | 'good' | 'average',
      food_temperature: q.temp ? parseFloat(q.temp) : null,
      quality_result: 'approved',
    }).eq('id', pickup.donation_id);
    await supabase.from('donation_events').insert({
      donation_id: pickup.donation_id,
      event_type: 'food_quality_approved',
      actor_name: profile?.full_name ?? 'Volunteer',
      actor_role: 'volunteer',
      notes: q.notes || `Quality: ${q.freshness}, Temp: ${q.temp}°C`,
    });
    toast('Food quality updated successfully', 'success');
    setSubmitting(null);
    setQuality((prev) => { const n = { ...prev }; delete n[pickup.id]; return n; });
    setPickups((p) => p.filter((x) => x.id !== pickup.id));
  };

  return (
    <div>
      <DashboardSectionHeader title="Food Quality Update" description="Inspect and report food quality for your active pickups." />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : pickups.length === 0 ? (
        <div className="glass-card p-10 text-center"><ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No active pickups to inspect.</p></div>
      ) : (
        <div className="space-y-4">
          {pickups.map((p) => {
            const q = quality[p.id] ?? { freshness: 'fresh', temp: '', notes: '' };
            return (
              <div key={p.id} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.donation?.food_name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.donation?.organization}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Freshness</label>
                    <select value={q.freshness} onChange={(e) => setQuality((prev) => ({ ...prev, [p.id]: { ...q, freshness: e.target.value } }))} className="input-field text-sm">
                      <option value="fresh">Fresh</option>
                      <option value="good">Good</option>
                      <option value="average">Average</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Temperature (°C)</label>
                    <input type="number" value={q.temp} onChange={(e) => setQuality((prev) => ({ ...prev, [p.id]: { ...q, temp: e.target.value } }))} placeholder="e.g. 4" className="input-field text-sm" />
                  </div>
                </div>
                <textarea value={q.notes} onChange={(e) => setQuality((prev) => ({ ...prev, [p.id]: { ...q, notes: e.target.value } }))} placeholder="Inspection notes..." rows={2} className="input-field text-sm mb-3 resize-none" />
                <RippleButton onClick={() => submitQuality(p)} variant="primary" disabled={submitting === p.id}>
                  {submitting === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Submit Quality Report
                </RippleButton>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Availability ---------- */
export function VolunteerAvailabilitySection() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [availability, setAvailability] = useState<'available' | 'on_delivery' | 'offline'>(profile?.availability ?? 'available');
  const [saving, setSaving] = useState(false);

  const update = async (status: 'available' | 'on_delivery' | 'offline') => {
    setAvailability(status);
    setSaving(true);
    await supabase.from('profiles').update({ availability: status }).eq('id', profile?.id);
    await refreshProfile();
    setSaving(false);
    toast('Availability updated', 'success');
  };

  const options = [
    { value: 'available' as const, label: 'Available', desc: 'Ready to accept new pickups', icon: CheckCircle2, color: 'green' },
    { value: 'on_delivery' as const, label: 'On Delivery', desc: 'Currently on a delivery', icon: Truck, color: 'amber' },
    { value: 'offline' as const, label: 'Offline', desc: 'Not available for pickups', icon: XCircle, color: 'gray' },
  ];

  return (
    <div>
      <DashboardSectionHeader title="Availability" description="Set your status so coordinators know when you're ready for pickups." />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = availability === opt.value;
          const colorMap: Record<string, string> = {
            green: isActive ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
            amber: isActive ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
            gray: isActive ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
          };
          return (
            <button key={opt.value} onClick={() => update(opt.value)} disabled={saving} className={`glass-card p-5 text-left transition-all ${isActive ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md'}`}>
              <div className={`h-12 w-12 rounded-xl ${colorMap[opt.color]} flex items-center justify-center mb-3`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="font-medium">{opt.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Volunteer Profile ---------- */
export function VolunteerProfileSection() {
  const { profile } = useAuth();
  const progress = Math.min(100, ((profile?.total_deliveries ?? 0) / 50) * 100);
  return (
    <div>
      <DashboardSectionHeader title="My Profile" description="Your volunteer profile and achievements." />
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'V'}
          </div>
          <div>
            <p className="font-display text-xl font-bold">{profile?.full_name}</p>
            <p className="text-sm text-gray-500">Volunteer</p>
            {profile?.is_verified && <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1"><ShieldCheck className="h-3 w-3" /> Verified</span>}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Zap} label="Reward Points" value={profile?.reward_points ?? 0} color="bg-yellow-500" />
          <StatCard icon={Package} label="Deliveries" value={profile?.total_deliveries ?? 0} color="bg-primary-500" />
          <StatCard icon={Clock} label="Hours" value={Math.round(profile?.total_hours ?? 0)} color="bg-blue-500" />
          <StatCard icon={Star} label="Rating" value={`${profile?.rating ?? 0}/5`} color="bg-green-500" />
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium flex items-center gap-2"><Target className="h-4 w-4 text-primary-500" /> Progress to 50 deliveries</p>
            <p className="text-xs text-gray-500">{profile?.total_deliveries ?? 0} / 50</p>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" />
          </div>
        </div>
        {profile?.badges && profile.badges.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2"><Award className="h-4 w-4 text-primary-500" /> Badges</p>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((b) => <span key={b} className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">{b}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
