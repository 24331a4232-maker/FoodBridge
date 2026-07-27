import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Loader2, MapPin, Star, Phone, Mail, Truck, X, Search,
  Navigation, Clock, CheckCircle2, QrCode, ShieldCheck, Package,
  User, Camera, Calendar, Route,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNotifications } from '@/context/NotificationContext';
import { LeafletMap, type MapPoint, haversineKm, estimateTravelTimeMin } from '@/components/LeafletMap';
import type { Profile, FoodDonation, Pickup, DonationHandover } from '@/types';

/* ---------- Workflow definition ---------- */
export type TrackingStage =
  | 'available'
  | 'accepted'
  | 'verified'
  | 'quality_approved'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'completed';

const STAGE_ORDER: TrackingStage[] = [
  'available', 'accepted', 'verified', 'quality_approved',
  'picked_up', 'in_transit', 'delivered', 'completed',
];

const STAGE_META: Record<TrackingStage, { label: string; color: string; dot: string; icon: typeof Radio }> = {
  available:        { label: 'Available',        color: 'bg-oat text-ink-soft dark:bg-secondary-800 dark:text-cream/60',         dot: 'bg-ink-soft/40 dark:bg-cream/40',   icon: Radio },
  accepted:         { label: 'Accepted',          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',       dot: 'bg-blue-500',   icon: CheckCircle2 },
  verified:         { label: 'Verified',          color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', dot: 'bg-purple-500', icon: QrCode },
  quality_approved: { label: 'Quality Approved',  color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', dot: 'bg-orange-500', icon: ShieldCheck },
  picked_up:        { label: 'Picked Up',         color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',       dot: 'bg-cyan-500',   icon: Package },
  in_transit:       { label: 'In Transit',         color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', dot: 'bg-yellow-500', icon: Truck },
  delivered:        { label: 'Delivered',         color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',   dot: 'bg-green-500',  icon: CheckCircle2 },
  completed:        { label: 'Completed',         color: 'bg-emerald-800 text-white dark:bg-emerald-900 dark:text-emerald-100',   dot: 'bg-emerald-700',icon: CheckCircle2 },
};

const TIMELINE_STEPS: { stage: TrackingStage; label: string; icon: typeof Radio }[] = [
  { stage: 'accepted',        label: 'Accepted',        icon: CheckCircle2 },
  { stage: 'verified',        label: 'QR Verified',     icon: QrCode },
  { stage: 'quality_approved',label: 'Quality Checked', icon: ShieldCheck },
  { stage: 'picked_up',       label: 'Picked Up',       icon: Package },
  { stage: 'in_transit',      label: 'Travelling',      icon: Truck },
  { stage: 'delivered',       label: 'Delivered',       icon: CheckCircle2 },
  { stage: 'completed',       label: 'Completed',       icon: CheckCircle2 },
];

/* ---------- Row type ---------- */
interface VolunteerRow {
  volunteer: Profile;
  pickup: Pickup | null;
  donation: FoodDonation | null;
  handover: DonationHandover | null;
  donor: Profile | null;
  stage: TrackingStage;
  lastUpdated: string | null;
}

/* ---------- Helpers ---------- */
function deriveStage(v: Profile, p: Pickup | null, h: DonationHandover | null): TrackingStage {
  if (p?.status === 'delivered' || p?.tracking_status === 'delivered') return 'completed';
  if (h?.handover_status === 'delivered') return 'delivered';
  if (p?.tracking_status === 'on_the_way') return 'in_transit';
  if (p?.tracking_status === 'picked_up' || h?.handover_status === 'picked_up') return 'picked_up';
  if (h?.handover_status === 'quality_approved') return 'quality_approved';
  if (h?.qr_verified) return 'verified';
  if (p?.status === 'accepted' || h?.handover_status === 'volunteer_assigned') return 'accepted';
  return 'available';
}

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmt(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ---------- Component ---------- */
export function VolunteerTrackingSystem() {
  const { pushToast } = useNotifications();
  const [rows, setRows] = useState<VolunteerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<TrackingStage | 'all'>('all');
  const [selectedVol, setSelectedVol] = useState<string | null>(null);
  const [detailRow, setDetailRow] = useState<VolunteerRow | null>(null);
  const prevStageRef = useRef<Record<string, TrackingStage>>({});

  const load = useCallback(async () => {
    const { data: vols } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'volunteer')
      .order('created_at', { ascending: false });
    const volunteers = (vols as Profile[]) ?? [];

    const { data: pickups } = await supabase
      .from('pickups')
      .select('*, donation:food_donations(*), donor:profiles!donor_id(*)')
      .order('created_at', { ascending: false });
    const allPickups = (pickups as unknown as Array<Pickup & { donation: FoodDonation | null; donor: Profile | null }>) ?? [];

    const { data: handovers } = await supabase
      .from('donation_handovers')
      .select('*')
      .order('created_at', { ascending: false });
    const allHandovers = (handovers as DonationHandover[]) ?? [];

    const built: VolunteerRow[] = volunteers.map((vol) => {
      const pickup = allPickups.find((p) => p.volunteer_id === vol.id) ?? null;
      const donation = pickup?.donation ?? null;
      const donor = pickup?.donor ?? null;
      const handover = donation ? allHandovers.find((h) => h.donation_id === donation.id) ?? null : null;
      const stage = deriveStage(vol, pickup, handover);
      const lastUpdated =
        pickup?.delivered_at ?? pickup?.on_the_way_at ?? pickup?.picked_up_at ?? pickup?.accepted_at
        ?? handover?.updated_at ?? handover?.pickup_confirmed_at ?? handover?.qr_verified_at
        ?? vol.updated_at ?? vol.created_at;
      return { volunteer: vol, pickup, donation, handover, donor, stage, lastUpdated };
    });

    // Fire notifications on stage transitions
    const prev = prevStageRef.current;
    built.forEach((r) => {
      const id = r.volunteer.id;
      const old = prev[id];
      if (old && old !== r.stage) {
        const meta = STAGE_META[r.stage];
        pushToast(`${r.volunteer.full_name} → ${meta.label}`, 'info');
      }
      prev[id] = r.stage;
    });

    setRows(built);
    setLoading(false);
  }, [pushToast]);

  useEffect(() => {
    load();
    const ch = supabase
      .channel('admin-volunteer-tracking')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pickups' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donation_handovers' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_donations' }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (stageFilter !== 'all' && r.stage !== stageFilter) return false;
      if (!q) return true;
      return (
        r.volunteer.full_name?.toLowerCase().includes(q) ||
        r.volunteer.email?.toLowerCase().includes(q) ||
        r.volunteer.phone?.toLowerCase().includes(q) ||
        r.donation?.food_name?.toLowerCase().includes(q) ||
        r.donor?.full_name?.toLowerCase().includes(q)
      );
    });
  }, [rows, search, stageFilter]);

  /* ---------- Map points ---------- */
  const mapPoints: MapPoint[] = useMemo(() => {
    const pts: MapPoint[] = [];
    filtered.forEach((r) => {
      if (r.volunteer.current_location_lat != null && r.volunteer.current_location_lng != null) {
        pts.push({
          lat: r.volunteer.current_location_lat as number,
          lng: r.volunteer.current_location_lng as number,
          type: 'volunteer',
          label: r.volunteer.full_name,
          popup: `<strong>${r.volunteer.full_name}</strong><br/>${STAGE_META[r.stage].label}<br/>${r.volunteer.total_deliveries} deliveries`,
        });
      }
      if (r.donation?.latitude != null && r.donation?.longitude != null) {
        pts.push({
          lat: r.donation.latitude as number,
          lng: r.donation.longitude as number,
          type: 'donor',
          label: r.donor?.full_name ?? 'Donor',
          popup: `<strong>Pickup</strong><br/>${r.donation.food_name ?? ''}<br/>${r.donation.address ?? ''}`,
        });
      }
    });
    return pts;
  }, [filtered]);

  const selectedPoint: MapPoint | null = useMemo(() => {
    const r = filtered.find((x) => x.volunteer.id === selectedVol);
    if (!r || r.volunteer.current_location_lat == null) return null;
    return {
      lat: r.volunteer.current_location_lat as number,
      lng: r.volunteer.current_location_lng as number,
      type: 'volunteer',
      label: r.volunteer.full_name,
    };
  }, [filtered, selectedVol]);

  /* ---------- Stats ---------- */
  const activeCount = rows.filter((r) => r.stage !== 'available' && r.stage !== 'completed').length;
  const liveCount = rows.filter((r) => r.volunteer.current_location_lat != null).length;
  const deliveredCount = rows.filter((r) => r.stage === 'completed' || r.stage === 'delivered').length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary-500" /> Real-Time Volunteer Tracking
          </h2>
          <p className="text-sm text-ink-soft dark:text-cream/60 mt-1">Monitor every volunteer from pickup to delivery — live.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass">
          <span className={`h-2 w-2 rounded-full ${liveCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-ink-soft/40 dark:bg-cream/40'}`} />
          <span className="text-xs font-medium text-ink-soft dark:text-cream/70">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : `${liveCount} live · ${activeCount} active`}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatMini icon={Radio} label="Total Volunteers" value={rows.length} color="from-blue-500 to-cyan-500" />
        <StatMini icon={Navigation} label="Active Deliveries" value={activeCount} color="from-amber-500 to-orange-500" />
        <StatMini icon={MapPin} label="Live Locations" value={liveCount} color="from-green-500 to-emerald-500" />
        <StatMini icon={CheckCircle2} label="Delivered" value={deliveredCount} color="from-emerald-600 to-green-700" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-soft/60 dark:text-cream/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search volunteer, donor, or donation..." className="input-field pl-12" />
        </div>
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value as TrackingStage | 'all')} className="input-field sm:w-52">
          <option value="all">All Stages</option>
          {STAGE_ORDER.map((s) => <option key={s} value={s}>{STAGE_META[s].label}</option>)}
        </select>
      </div>

      {/* Map + Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Map */}
        <div className="xl:col-span-1 glass-card p-4 flex flex-col">
          <h3 className="font-display font-bold mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary-500" /> Live Map</h3>
          <div className="h-[400px] rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-ink-soft/60 dark:text-cream/40" /></div>
            ) : mapPoints.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MapPin className="h-10 w-10 text-ink-soft/40 dark:text-cream/30 mb-2" />
                <p className="text-sm text-ink-soft dark:text-cream/60">No live locations right now.</p>
              </div>
            ) : (
              <LeafletMap points={mapPoints} selectedPoint={selectedPoint} height="h-full" />
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            <Legend dot="bg-emerald-700" label="Volunteer" />
            <Legend dot="bg-primary-600" label="Donor / Pickup" />
            <Legend dot="bg-teal-600" label="Destination" />
          </div>
        </div>

        {/* Table */}
        <div className="xl:col-span-2 glass-card p-4 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-ink-soft/60 dark:text-cream/40" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><Radio className="h-12 w-12 text-ink-soft/40 dark:text-cream/30 mx-auto mb-3" /><p className="text-ink-soft dark:text-cream/60">No volunteers match your filters.</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-soft/60 dark:text-cream/40 border-b border-linen dark:border-secondary-800">
                  <th className="pb-2 pr-3 font-medium">Volunteer</th>
                  <th className="pb-2 pr-3 font-medium hidden md:table-cell">Current Donation</th>
                  <th className="pb-2 pr-3 font-medium hidden lg:table-cell">Donor</th>
                  <th className="pb-2 pr-3 font-medium hidden lg:table-cell">Route</th>
                  <th className="pb-2 pr-3 font-medium">Status</th>
                  <th className="pb-2 pr-3 font-medium hidden md:table-cell">Updated</th>
                  <th className="pb-2 pr-3 font-medium hidden xl:table-cell">Live</th>
                  <th className="pb-2 pr-3 font-medium hidden xl:table-cell">ETA</th>
                  <th className="pb-2 pr-3 font-medium hidden sm:table-cell">Deliveries</th>
                  <th className="pb-2 pr-3 font-medium hidden sm:table-cell">Rating</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const meta = STAGE_META[r.stage];
                  const StageIcon = meta.icon;
                  const eta = r.pickup?.current_lat != null && r.donation?.latitude != null
                    ? estimateTravelTimeMin(haversineKm([r.pickup.current_lat, r.pickup.current_lng ?? 0], [r.donation.latitude, r.donation.longitude ?? 0]))
                    : null;
                  return (
                    <tr
                      key={r.volunteer.id}
                      onClick={() => setDetailRow(r)}
                      className={`border-b border-linen dark:border-secondary-800 cursor-pointer transition-colors hover:bg-primary-50/50 dark:hover:bg-primary-900/20 ${selectedVol === r.volunteer.id ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}
                    >
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2.5">
                          {r.volunteer.avatar_url ? (
                            <img src={r.volunteer.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 flex items-center justify-center text-sm font-bold shrink-0">
                              {r.volunteer.full_name?.[0]?.toUpperCase() ?? 'V'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate text-ink dark:text-cream">{r.volunteer.full_name}</p>
                            <p className="text-xs text-ink-soft/60 dark:text-cream/40 truncate font-mono">{r.volunteer.id.slice(0, 8)}</p>
                            <p className="text-xs text-ink-soft/60 dark:text-cream/40 truncate md:hidden">{r.volunteer.phone || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3 hidden md:table-cell">
                        <p className="font-medium truncate max-w-[140px] text-ink dark:text-cream">{r.donation?.food_name ?? '—'}</p>
                        <p className="text-xs text-ink-soft/60 dark:text-cream/40 truncate max-w-[140px]">{r.donation?.pickup_address ?? ''}</p>
                      </td>
                      <td className="py-3 pr-3 hidden lg:table-cell truncate max-w-[100px] text-ink dark:text-cream">{r.donor?.full_name ?? '—'}</td>
                      <td className="py-3 pr-3 hidden lg:table-cell">
                        <div className="text-xs text-ink-soft dark:text-cream/60 space-y-0.5">
                          <p className="truncate max-w-[120px]">📍 {r.donation?.address?.split(',')[0] ?? '—'}</p>
                          <p className="truncate max-w-[120px]">🏁 {r.pickup?.recipient_org ?? r.donation?.recommended_recipient ?? '—'}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${meta.color}`}>
                          <StageIcon className="h-3 w-3" /> {meta.label}
                        </span>
                      </td>
                      <td className="py-3 pr-3 hidden md:table-cell text-xs text-ink-soft dark:text-cream/60">{timeAgo(r.lastUpdated)}</td>
                      <td className="py-3 pr-3 hidden xl:table-cell">
                        {r.volunteer.current_location_lat != null ? (
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            {r.volunteer.current_location_lat.toFixed(3)}, {r.volunteer.current_location_lng?.toFixed(3)}
                          </span>
                        ) : <span className="text-xs text-ink-soft/60 dark:text-cream/40">Offline</span>}
                      </td>
                      <td className="py-3 pr-3 hidden xl:table-cell text-xs text-ink-soft dark:text-cream/60">
                        {eta != null ? `${Math.round(eta)} min` : '—'}
                      </td>
                      <td className="py-3 pr-3 hidden sm:table-cell text-xs text-ink dark:text-cream">{r.volunteer.total_deliveries}</td>
                      <td className="py-3 pr-3 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-0.5 text-xs">
                          <Star className="h-3 w-3 text-yellow-500" />{r.volunteer.rating ?? 0}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailRow && (
          <VolunteerDetailModal row={detailRow} onClose={() => setDetailRow(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Stat mini ---------- */
function StatMini({ icon: Icon, label, value, color }: { icon: typeof Radio; label: string; value: number; color: string }) {
  return (
    <div className="glass-card p-4">
      <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-lg mb-2`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="font-display text-xl font-bold tabular-nums text-ink dark:text-cream">{value}</p>
      <p className="text-xs text-ink-soft dark:text-cream/60 leading-tight">{label}</p>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-ink-soft dark:text-cream/60">
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} /> {label}
    </span>
  );
}

/* ---------- Timeline ---------- */
function Timeline({ stage }: { stage: TrackingStage }) {
  const currentIdx = STAGE_ORDER.indexOf(stage);
  return (
    <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2">
      {TIMELINE_STEPS.map((step, i) => {
        const stepIdx = STAGE_ORDER.indexOf(step.stage);
        const done = currentIdx >= stepIdx && stage !== 'available';
        const StepIcon = step.icon;
        return (
          <div key={step.stage} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1 min-w-[64px]">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${done ? 'bg-green-500 text-white' : 'bg-oat dark:bg-secondary-800 text-ink-soft/60 dark:text-cream/40'}`}>
                <StepIcon className="h-4 w-4" />
              </div>
              <span className={`text-[10px] text-center leading-tight ${done ? 'text-green-600 dark:text-green-400 font-medium' : 'text-ink-soft/60 dark:text-cream/40'}`}>{step.label}</span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`h-0.5 w-6 sm:w-10 mx-0.5 ${done && currentIdx > stepIdx ? 'bg-green-500' : 'bg-linen dark:bg-secondary-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Detail Modal ---------- */
function VolunteerDetailModal({ row, onClose }: { row: VolunteerRow; onClose: () => void }) {
  const { volunteer: v, donation: d, donor, pickup, handover } = row;
  const meta = STAGE_META[row.stage];
  const StageIcon = meta.icon;

  const qualityReport = handover?.quality_report as { approval?: string; freshness?: string; packaging?: string; temperature?: string; notes?: string } | null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {v.avatar_url ? (
              <img src={v.avatar_url} alt="" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-primary-200 dark:ring-primary-800" />
            ) : (
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-bold bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                {v.full_name?.[0]?.toUpperCase() ?? 'V'}
              </div>
            )}
            <div>
              <h3 className="font-display text-lg font-bold text-ink dark:text-cream">{v.full_name}</h3>
              <p className="text-xs text-ink-soft/60 dark:text-cream/40 font-mono">ID: {v.id.slice(0, 8)}</p>
              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium mt-1 ${meta.color}`}>
                <StageIcon className="h-3 w-3" /> {meta.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-oat dark:hover:bg-secondary-800 text-ink-soft dark:text-cream/60"><X className="h-5 w-5" /></button>
        </div>

        {/* Timeline */}
        <div className="glass p-3 rounded-xl mb-4">
          <p className="text-xs font-medium text-ink-soft dark:text-cream/60 mb-1">Delivery Timeline</p>
          <Timeline stage={row.stage} />
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <InfoRow icon={Mail} label="Email" value={v.email} />
          <InfoRow icon={Phone} label="Phone" value={v.phone ?? '—'} />
          <InfoRow icon={Truck} label="Vehicle" value={v.vehicle ?? '—'} />
          <InfoRow icon={MapPin} label="GPS Location" value={v.current_location_lat != null ? `${v.current_location_lat.toFixed(4)}, ${v.current_location_lng?.toFixed(4)}` : 'Not sharing'} />
        </div>

        {/* Donor info */}
        <Section title="Donor Information" icon={User}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow icon={User} label="Donor Name" value={donor?.full_name ?? '—'} />
            <InfoRow icon={Phone} label="Donor Phone" value={donor?.phone ?? '—'} />
          </div>
        </Section>

        {/* Food details */}
        <Section title="Food Details" icon={Package}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <InfoRow label="Food" value={d?.food_name ?? '—'} />
            <InfoRow label="Quantity" value={d ? `${d.quantity} ${d.quantity_unit}` : '—'} />
            <InfoRow label="Category" value={d?.category ?? '—'} />
          </div>
        </Section>

        {/* Pickup & delivery times */}
        <Section title="Pickup & Delivery" icon={Calendar}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow icon={Clock} label="Pickup Time" value={fmt(pickup?.picked_up_at ?? handover?.pickup_confirmed_at)} />
            <InfoRow icon={CheckCircle2} label="Delivery Time" value={fmt(pickup?.delivered_at)} />
            <InfoRow icon={QrCode} label="QR Verified At" value={fmt(handover?.qr_verified_at)} />
            <InfoRow icon={Navigation} label="Started Travelling" value={fmt(pickup?.on_the_way_at)} />
          </div>
        </Section>

        {/* Quality check */}
        <Section title="Quality Check Result" icon={ShieldCheck}>
          {qualityReport ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <InfoRow label="Approval" value={qualityReport.approval ?? '—'} />
              <InfoRow label="Freshness" value={qualityReport.freshness ?? '—'} />
              <InfoRow label="Packaging" value={qualityReport.packaging ?? '—'} />
              <InfoRow label="Temperature" value={qualityReport.temperature ?? '—'} />
              <InfoRow label="Rating" value={handover?.inspection_rating != null ? `${handover.inspection_rating}/5` : '—'} />
            </div>
          ) : (
            <p className="text-sm text-ink-soft/60 dark:text-cream/40">No quality report submitted yet.</p>
          )}
        </Section>

        {/* Delivery proof photo */}
        <Section title="Delivery Proof Photo" icon={Camera}>
          {handover?.pickup_photo_url ? (
            <img src={handover.pickup_photo_url} alt="Delivery proof" className="w-full max-h-64 object-cover rounded-xl" />
          ) : (
            <div className="h-32 rounded-xl bg-oat dark:bg-secondary-800 flex items-center justify-center text-ink-soft/60 dark:text-cream/40">
              <Camera className="h-8 w-8" />
            </div>
          )}
        </Section>
      </motion.div>
    </motion.div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon?: typeof Radio; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-soft/60 dark:text-cream/40 mb-0.5 flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </p>
      <p className="font-medium text-sm break-words text-ink dark:text-cream">{value}</p>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Radio; children: React.ReactNode }) {
  return (
    <div className="glass p-4 rounded-xl mb-3">
      <h4 className="font-display font-semibold text-sm mb-3 flex items-center gap-2"><Icon className="h-4 w-4 text-primary-500" /> {title}</h4>
      {children}
    </div>
  );
}
