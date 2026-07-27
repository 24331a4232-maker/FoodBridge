import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Clock, CheckCircle2, MapPin, Truck, Navigation, Loader2,
  Award, ShieldCheck, Zap, Target, Trophy, Star,
  Camera, Thermometer, CheckCircle, XCircle, Calendar, Radio,
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
import type { FoodDonation, Pickup, InspectionChecklist } from '@/types';

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
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-ink-soft/60 dark:text-cream/40" /></div>
      ) : active.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Package className="h-12 w-12 text-ink-soft/40 dark:text-cream/30 mx-auto mb-3" />
          <p className="text-ink-soft dark:text-cream/60 mb-4">No active assignments right now.</p>
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
                  <p className="text-xs text-ink-soft dark:text-cream/60 truncate">{p.donation?.organization} - {p.donation?.address ?? ''}</p>
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
  const [broadcasting, setBroadcasting] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

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

  // Push the volunteer's live position to their profile so admins can track them.
  useEffect(() => {
    if (!broadcasting || !user || !position) return;
    supabase
      .from('profiles')
      .update({
        current_location_lat: position.lat,
        current_location_lng: position.lng,
      })
      .eq('id', user.id)
      .then(() => {});
  }, [broadcasting, position, user]);

  const toggleBroadcast = async () => {
    if (!broadcasting) {
      if (!position) requestGeo();
      setBroadcasting(true);
    } else {
      setBroadcasting(false);
      if (watchId != null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      if (user) {
        await supabase
          .from('profiles')
          .update({ current_location_lat: null, current_location_lng: null })
          .eq('id', user.id);
      }
    }
  };

  // Start a high-accuracy watch when broadcasting so the position keeps refreshing.
  useEffect(() => {
    if (!broadcasting || !('geolocation' in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      () => {},
      () => {},
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 },
    );
    setWatchId(id);
    return () => {
      navigator.geolocation.clearWatch(id);
    };
  }, [broadcasting]);

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
          <RippleButton onClick={toggleBroadcast} variant={broadcasting ? 'primary' : 'ghost'} className="text-xs">
            <Radio className="h-3 w-3" /> {broadcasting ? 'Stop Sharing' : 'Share Live Location'}
          </RippleButton>
        </div>
        <LeafletMap points={mapPoints} showRoute={!!route} routeCoords={route?.coordinates ?? []} height="h-80" center={position ? [position.lat, position.lng] : [20.5937, 78.9629]} zoom={position ? 13 : 5} />
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-ink-soft/60 dark:text-cream/40" /></div>
      ) : active.length === 0 ? (
        <div className="glass-card p-8 text-center"><p className="text-ink-soft dark:text-cream/60">No active deliveries to track.</p></div>
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
                  <p className="text-xs text-ink-soft dark:text-cream/60 truncate">{p.donation?.organization}</p>
                </div>
                {dist != null && <span className="text-xs text-ink-soft/60 dark:text-cream/40 shrink-0">{dist.toFixed(1)} km</span>}
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
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-ink-soft/60 dark:text-cream/40" /></div>
      ) : completed.length === 0 ? (
        <div className="glass-card p-10 text-center"><CheckCircle2 className="h-12 w-12 text-ink-soft/40 dark:text-cream/30 mx-auto mb-3" /><p className="text-ink-soft dark:text-cream/60">No completed deliveries yet.</p></div>
      ) : (
        <div className="relative pl-6 space-y-4">
          <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-primary-200 dark:bg-primary-800" />
          {completed.map((p) => (
            <div key={p.id} className="relative">
              <div className="absolute -left-4 top-1 h-3 w-3 rounded-full bg-primary-500 ring-4 ring-primary-100 dark:ring-primary-900" />
              <p className="font-semibold text-sm">{p.donation?.food_name ?? 'Delivery'}</p>
              <p className="text-xs text-ink-soft dark:text-cream/60">{p.donation?.organization} - {new Date(p.delivered_at ?? p.created_at).toLocaleDateString()}</p>
              <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 mt-1">+{p.points_earned} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Food Quality Inspection ---------- */
const REJECTION_REASONS: { value: string; label: string }[] = [
  { value: 'expired', label: 'Expired' },
  { value: 'damaged_packaging', label: 'Damaged Packaging' },
  { value: 'bad_smell', label: 'Bad Smell' },
  { value: 'contaminated', label: 'Contaminated' },
  { value: 'unsafe_temperature', label: 'Unsafe Temperature' },
];

const CHECKLIST_ITEMS: { key: keyof InspectionChecklist; label: string }[] = [
  { key: 'visual_inspection', label: 'Visual inspection - food looks fresh and appealing' },
  { key: 'temperature_check', label: 'Temperature check - within safe range' },
  { key: 'packaging_intact', label: 'Packaging intact - no tears or leaks' },
  { key: 'no_contamination', label: 'No contamination signs' },
  { key: 'within_expiry', label: 'Within expiry / best-before date' },
  { key: 'no_off_odour', label: 'No off-odour detected' },
];

interface InspectionForm {
  checklist: InspectionChecklist;
  temperature: string;
  freshness: 'fresh' | 'good' | 'average' | 'stale';
  packaging: 'excellent' | 'good' | 'fair' | 'poor';
  rating: number;
  photoUrl: string;
  approval: 'approved' | 'rejected';
  rejectionReason: string;
  notes: string;
}

const EMPTY_FORM: InspectionForm = {
  checklist: {},
  temperature: '',
  freshness: 'fresh',
  packaging: 'good',
  rating: 0,
  photoUrl: '',
  approval: 'approved',
  rejectionReason: '',
  notes: '',
};

export function VolunteerFoodQualitySection() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { pushToast } = useNotifications();
  const { position, loading: geoLoading, request: requestGeo } = useGeolocation();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, InspectionForm>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('pickups')
      .select('*, donation:food_donations(*)')
      .eq('volunteer_id', user.id)
      .in('status', ['accepted', 'in_progress'])
      .order('created_at', { ascending: false });
    setPickups((data as Pickup[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    const ch = supabase
      .channel('vol-quality')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pickups' }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const updateForm = (pickupId: string, patch: Partial<InspectionForm>) =>
    setForms((prev) => ({ ...prev, [pickupId]: { ...(prev[pickupId] ?? EMPTY_FORM), ...patch } }));

  const handlePhoto = async (pickupId: string, file: File) => {
    setUploading(pickupId);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${user?.id}/${pickupId}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('food-photos').upload(path, file, { cacheControl: '3600', upsert: true });
    if (upErr) {
      toast('Photo upload failed', 'error');
      setUploading(null);
      return;
    }
    const { data: pub } = supabase.storage.from('food-photos').getPublicUrl(path);
    updateForm(pickupId, { photoUrl: pub.publicUrl });
    setUploading(null);
    toast('Photo uploaded', 'success');
  };

  const startPickup = async (pickup: Pickup) => {
    const now = new Date().toISOString();
    await supabase.from('pickups').update({
      status: 'in_progress',
      tracking_status: 'pickup_started',
      started_at: now,
      current_lat: position?.lat ?? null,
      current_lng: position?.lng ?? null,
    }).eq('id', pickup.id);
    await supabase.from('donation_events').insert({
      donation_id: pickup.donation_id,
      event_type: 'pickup_started',
      actor_name: profile?.full_name ?? 'Volunteer',
      actor_role: 'volunteer',
      notes: 'Volunteer started navigation to pickup location.',
    });
    pushToast('Pickup started - navigate to the donor location', 'success');
    load();
  };

  const submitInspection = async (pickup: Pickup) => {
    const f = forms[pickup.id] ?? EMPTY_FORM;
    if (f.rating === 0) { toast('Please rate the food quality (1-5 stars)', 'error'); return; }
    if (f.approval === 'rejected' && !f.rejectionReason) { toast('Please select a rejection reason', 'error'); return; }
    if (!f.photoUrl) { toast('Please upload a food photo', 'error'); return; }
    setSubmitting(pickup.id);

    const checklistDone = CHECKLIST_ITEMS.filter((c) => f.checklist[c.key]).length;
    if (checklistDone < CHECKLIST_ITEMS.length) {
      toast('Please complete every checklist item before submitting', 'error');
      setSubmitting(null);
      return;
    }

    const isApproved = f.approval === 'approved';
    const qualityScore = isApproved ? Math.round(60 + (f.rating / 5) * 40) : Math.round((f.rating / 5) * 40);

    await supabase.from('food_quality_inspections').insert({
      donation_id: pickup.donation_id,
      pickup_id: pickup.id,
      inspector_id: user?.id ?? null,
      inspector_name: profile?.full_name ?? 'Volunteer',
      freshness: f.freshness,
      packaging: f.packaging,
      temperature: f.temperature,
      expiry_check: f.checklist.within_expiry ? 'pass' : 'fail',
      approval_status: f.approval,
      rejection_reason: f.rejectionReason,
      rating: f.rating,
      photo_url: f.photoUrl,
      checklist: f.checklist,
      inspector_lat: position?.lat ?? null,
      inspector_lng: position?.lng ?? null,
      notes: f.notes,
    });

    await supabase.from('food_donations').update({
      food_condition: f.freshness,
      food_temperature: f.temperature ? parseFloat(f.temperature) : null,
      quality_score: qualityScore,
      freshness_status: isApproved ? 'fresh' : 'spoiled',
      status: isApproved ? 'claimed' : 'cancelled',
    }).eq('id', pickup.donation_id);

    await supabase.from('donation_events').insert({
      donation_id: pickup.donation_id,
      event_type: isApproved ? 'food_quality_approved' : 'food_quality_rejected',
      actor_name: profile?.full_name ?? 'Volunteer',
      actor_role: 'volunteer',
      notes: isApproved
        ? `Approved - ${f.rating}/5 stars. ${f.notes || ''}`
        : `Rejected - ${REJECTION_REASONS.find((r) => r.value === f.rejectionReason)?.label ?? f.rejectionReason}. ${f.notes || ''}`,
    });

    if (!isApproved) {
      await supabase.from('pickups').update({ status: 'cancelled', tracking_status: 'cancelled' }).eq('id', pickup.id);
    }

    pushToast(isApproved ? 'Inspection approved - proceed to pickup' : 'Inspection submitted - donation rejected', isApproved ? 'success' : 'error');
    setSubmitting(null);
    setForms((prev) => { const n = { ...prev }; delete n[pickup.id]; return n; });
    setActiveId(null);
    load();
  };

  return (
    <div>
      <DashboardSectionHeader title="Food Quality Inspection" description="Accept a donation, navigate to pickup, inspect the food, and submit your report." />

      {!position && (
        <div className="glass-card p-4 mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-soft dark:text-cream/60 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary-500" /> Enable location to track your route and tag inspections.</p>
          <RippleButton onClick={requestGeo} variant="ghost" className="text-xs shrink-0" disabled={geoLoading}>
            {geoLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />} Enable
          </RippleButton>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-ink-soft/60 dark:text-cream/40" /></div>
      ) : pickups.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <ShieldCheck className="h-12 w-12 text-ink-soft/40 dark:text-cream/30 mx-auto mb-3" />
          <p className="text-ink-soft dark:text-cream/60">No active pickups to inspect.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pickups.map((p, idx) => {
            const f = forms[p.id] ?? EMPTY_FORM;
            const isActive = activeId === p.id;
            const started = p.tracking_status !== 'accepted';
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-5"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{p.donation?.food_name}</p>
                    <p className="text-xs text-ink-soft dark:text-cream/60 truncate">{p.donation?.organization} - {p.donation?.address ?? ''}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${started ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                    {started ? 'In Progress' : 'Assigned'}
                  </span>
                </div>

                {/* Step 1: Accept / Navigate */}
                {!started && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                      <span className="h-6 w-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs">1</span>
                      Accept & Navigate to Pickup
                    </div>
                    <p className="text-xs text-ink-soft dark:text-cream/60 mb-3 ml-8">Accept the donation to start navigating to the pickup location.</p>
                    <RippleButton onClick={() => startPickup(p)} variant="primary" className="ml-8">
                      <Navigation className="h-4 w-4" /> Accept & Start Pickup
                    </RippleButton>
                  </div>
                )}

                {/* Steps 2-8: Inspection form */}
                {started && (
                  <div className="space-y-5">
                    {/* Step 2: Checklist */}
                    <div>
                      <p className="flex items-center gap-2 mb-2 text-sm font-medium">
                        <span className="h-6 w-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs">2</span>
                        Quality Inspection Checklist
                      </p>
                      <div className="ml-8 space-y-2">
                        {CHECKLIST_ITEMS.map((c) => {
                          const checked = !!f.checklist[c.key];
                          return (
                            <button
                              key={c.key}
                              type="button"
                              onClick={() => updateForm(p.id, { checklist: { ...f.checklist, [c.key]: !checked } })}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-colors ${checked ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'bg-oat dark:bg-secondary-800/50 hover:bg-linen dark:hover:bg-secondary-800'}`}
                            >
                              <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${checked ? 'bg-primary-500 text-white' : 'border-2 border-linen dark:border-secondary-600'}`}>
                                {checked && <CheckCircle className="h-3.5 w-3.5" />}
                              </div>
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 3: Photo upload */}
                    <div>
                      <p className="flex items-center gap-2 mb-2 text-sm font-medium">
                        <span className="h-6 w-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs">3</span>
                        Upload Food Photo
                      </p>
                      <div className="ml-8">
                        <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-linen dark:border-secondary-600 cursor-pointer hover:border-primary-400 transition-colors">
                          {uploading === p.id ? (
                            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                          ) : f.photoUrl ? (
                            <img src={f.photoUrl} alt="Food" className="h-32 w-full object-cover rounded-lg" />
                          ) : (
                            <>
                              <Camera className="h-8 w-8 text-ink-soft/60 dark:text-cream/40" />
                              <span className="text-xs text-ink-soft dark:text-cream/60">Tap to add a photo</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { const file = e.target.files?.[0]; if (file) handlePhoto(p.id, file); }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Step 4: Rating */}
                    <div>
                      <p className="flex items-center gap-2 mb-2 text-sm font-medium">
                        <span className="h-6 w-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs">4</span>
                        Rate Food Quality
                      </p>
                      <div className="ml-8 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} type="button" onClick={() => updateForm(p.id, { rating: n })} className="p-1">
                            <Star className={`h-7 w-7 transition-colors ${n <= f.rating ? 'fill-yellow-400 text-yellow-400' : 'text-linen dark:text-secondary-600'}`} />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-ink-soft dark:text-cream/60">{f.rating > 0 ? `${f.rating}/5` : 'Tap a star'}</span>
                      </div>
                    </div>

                    {/* Step 5: Approve / Reject */}
                    <div>
                      <p className="flex items-center gap-2 mb-2 text-sm font-medium">
                        <span className="h-6 w-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs">5</span>
                        Decision
                      </p>
                      <div className="ml-8 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => updateForm(p.id, { approval: 'approved', rejectionReason: '' })}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${f.approval === 'approved' ? 'bg-green-500 text-white shadow-lg' : 'bg-oat dark:bg-secondary-800/50 text-ink-soft dark:text-cream/70 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                        >
                          <CheckCircle className="h-4 w-4" /> Approved
                        </button>
                        <button
                          type="button"
                          onClick={() => updateForm(p.id, { approval: 'rejected' })}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${f.approval === 'rejected' ? 'bg-red-500 text-white shadow-lg' : 'bg-oat dark:bg-secondary-800/50 text-ink-soft dark:text-cream/70 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                        >
                          <XCircle className="h-4 w-4" /> Rejected
                        </button>
                      </div>
                    </div>

                    {/* Step 6: Rejection reason */}
                    {f.approval === 'rejected' && (
                      <div>
                        <p className="flex items-center gap-2 mb-2 text-sm font-medium">
                          <span className="h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">6</span>
                          Rejection Reason
                        </p>
                        <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {REJECTION_REASONS.map((r) => (
                            <button
                              key={r.value}
                              type="button"
                              onClick={() => updateForm(p.id, { rejectionReason: r.value })}
                              className={`flex items-center gap-2 p-3 rounded-xl text-sm text-left transition-colors ${f.rejectionReason === r.value ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 ring-2 ring-red-400' : 'bg-oat dark:bg-secondary-800/50 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                            >
                              <div className={`h-4 w-4 rounded-full border-2 shrink-0 ${f.rejectionReason === r.value ? 'border-red-500 bg-red-500' : 'border-linen dark:border-secondary-600'}`} />
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extra details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-ink-soft dark:text-cream/60 mb-1 block">Freshness</label>
                        <select value={f.freshness} onChange={(e) => updateForm(p.id, { freshness: e.target.value as InspectionForm['freshness'] })} className="input-field text-sm">
                          <option value="fresh">Fresh</option>
                          <option value="good">Good</option>
                          <option value="average">Average</option>
                          <option value="stale">Stale</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-ink-soft dark:text-cream/60 mb-1 block">Packaging</label>
                        <select value={f.packaging} onChange={(e) => updateForm(p.id, { packaging: e.target.value as InspectionForm['packaging'] })} className="input-field text-sm">
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-ink-soft dark:text-cream/60 mb-1 block">Temperature (°C)</label>
                        <input type="number" value={f.temperature} onChange={(e) => updateForm(p.id, { temperature: e.target.value })} placeholder="e.g. 4" className="input-field text-sm" />
                      </div>
                    </div>

                    <textarea value={f.notes} onChange={(e) => updateForm(p.id, { notes: e.target.value })} placeholder="Additional inspection notes..." rows={2} className="input-field text-sm resize-none" />

                    {/* Step 8: Submit */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <RippleButton onClick={() => submitInspection(p)} variant="primary" disabled={submitting === p.id} className="flex-1">
                        {submitting === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        Submit Inspection Report
                      </RippleButton>
                      <RippleButton onClick={() => setActiveId(isActive ? null : p.id)} variant="ghost" className="text-xs">
                        {isActive ? 'Hide' : 'Inspect'}
                      </RippleButton>
                    </div>
                  </div>
                )}

                {p.donation && (isActive || started) && (
                  <div className="mt-4 pt-4 border-t border-linen dark:border-secondary-800">
                    <DonationStatusTracker donation={p.donation} pickup={p} compact />
                  </div>
                )}
              </motion.div>
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
            gray: isActive ? 'bg-ink-soft text-white' : 'bg-oat text-ink-soft dark:bg-secondary-800 dark:text-cream/60',
          };
          return (
            <button key={opt.value} onClick={() => update(opt.value)} disabled={saving} className={`glass-card p-5 text-left transition-all ${isActive ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md'}`}>
              <div className={`h-12 w-12 rounded-xl ${colorMap[opt.color]} flex items-center justify-center mb-3`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="font-medium">{opt.label}</p>
              <p className="text-xs text-ink-soft dark:text-cream/60 mt-0.5">{opt.desc}</p>
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
            <p className="text-sm text-ink-soft dark:text-cream/60">Volunteer</p>
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
            <p className="text-xs text-ink-soft dark:text-cream/60">{profile?.total_deliveries ?? 0} / 50</p>
          </div>
          <div className="h-3 bg-oat dark:bg-secondary-800 rounded-full overflow-hidden">
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
