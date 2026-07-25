import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, Clock, UtensilsCrossed, Hotel, Package, ChevronLeft, ChevronRight, Flame, X, CheckCircle2, Loader2, Navigation, Crosshair, Ruler } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { FoodDonation, FoodCategory } from '@/types';
import { useToast } from '@/context/ToastContext';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { LeafletMap, haversineKm, estimateTravelTimeMin, type MapPoint } from '@/components/LeafletMap';
import { useGeolocation, getRoute, type RouteInfo } from '@/lib/geo';
import { FoodQualityBadge } from '@/components/FoodQualityBadge';
import { DonationImage } from '@/components/Illustration';
import type { FreshnessStatus } from '@/types';

const categories: { value: FoodCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'cooked', label: 'Cooked' },
  { value: 'raw', label: 'Raw' },
  { value: 'packaged', label: 'Packaged' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'other', label: 'Other' },
];

const PAGE_SIZE = 6;

function FoodCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-800" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-16" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-20" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
      </div>
    </div>
  );
}

import { PageNav } from '@/components/PageNav';
export function AvailableFoodPage() {
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FoodCategory | 'all'>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<FoodDonation | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptedId, setAcceptedId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [radius, setRadius] = useState(10);
  const [freshnessFilter, setFreshnessFilter] = useState<FreshnessStatus | 'all'>('all');
  const [selectedMapPoint, setSelectedMapPoint] = useState<MapPoint | null>(null);
  const { position, loading: geoLoading, error: geoError, request: requestGeo } = useGeolocation();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const generateRoute = async (donation: FoodDonation) => {
    if (!position) { toast('Enable location first to generate a route', 'info'); return; }
    if (donation.latitude == null || donation.longitude == null) { toast('This donation has no map coordinates', 'error'); return; }
    setRouteLoading(true);
    const r = await getRoute([position.lat, position.lng], [donation.latitude, donation.longitude]);
    setRouteLoading(false);
    if (r) { setRoute(r); setShowMap(true); toast(`Route: ${r.distanceKm.toFixed(1)} km, ~${Math.round(r.durationMin)} min`, 'success'); }
    else toast('Could not generate route. Please try again.', 'error');
  };

  const acceptPickup = async (donation: FoodDonation) => {
    if (!user) {
      toast('Please login as a volunteer to accept pickups', 'info');
      navigate('/login', { state: { from: '/available-food' } });
      return;
    }
    if (profile?.role !== 'volunteer' && profile?.role !== 'admin') {
      toast('Only volunteer accounts can accept pickups', 'error');
      return;
    }
    setAccepting(true);
    const { error } = await supabase.from('pickups').insert({
      donation_id: donation.id,
      volunteer_id: user.id,
      status: 'accepted',
      points_earned: donation.is_urgent ? 50 : 25,
    });
    if (error) {
      setAccepting(false);
      toast('Could not accept this pickup. It may already be claimed.', 'error');
      return;
    }
    await supabase.from('food_donations').update({ status: 'claimed' }).eq('id', donation.id);
    setAccepting(false);
    setAcceptedId(donation.id);
    setDonations((d) => d.filter((x) => x.id !== donation.id));
    toast('Pickup accepted! Redirecting to your dashboard...', 'success');
    setTimeout(() => {
      setSelected(null);
      setAcceptedId(null);
      navigate('/volunteer');
    }, 1800);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('food_donations')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      if (error) {
        toast('Could not load donations', 'error');
      } else {
        setDonations((data as FoodDonation[]) ?? []);
      }
      setLoading(false);
    };
    load();
  }, [toast]);

  const filtered = useMemo(() => {
    return donations.filter((d) => {
      const matchSearch =
        !search ||
        d.food_name.toLowerCase().includes(search.toLowerCase()) ||
        d.organization.toLowerCase().includes(search.toLowerCase()) ||
        d.city.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'all' || d.category === category;
      const matchNearby = !position || (d.latitude != null && d.longitude != null && haversineKm([position.lat, position.lng], [d.latitude!, d.longitude!]) <= radius);
      const matchFresh = freshnessFilter === 'all' || d.freshness_status === freshnessFilter;
      return matchSearch && matchCat && matchNearby && matchFresh;
    }).sort((a, b) => {
      if (!position) return 0;
      const da = a.latitude != null && a.longitude != null ? haversineKm([position.lat, position.lng], [a.latitude!, a.longitude!]) : Infinity;
      const db = b.latitude != null && b.longitude != null ? haversineKm([position.lat, position.lng], [b.latitude!, b.longitude!]) : Infinity;
      return da - db;
    });
  }, [donations, search, category, position, radius, freshnessFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  useEffect(() => { setPage(1); }, [search, category, freshnessFilter]);

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const diff = date.getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours < 0) return 'Expired';
    return `${hours}h ${mins}m left`;
  };

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <PageNav crumbs={[{ label: 'Available Food', icon: UtensilsCrossed }]} />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="badge bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 mb-4">
            <UtensilsCrossed className="h-3.5 w-3.5" /> Available Now
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold">Available Food Donations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-xl mx-auto">Browse surplus food available for pickup near you. Claim a donation and deliver it to someone in need.</p>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by food, hotel, or city..."
              className="input-field pl-12"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <Filter className="h-5 w-5 text-gray-400 shrink-0" />
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  category === c.value
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Freshness Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs text-gray-400 shrink-0 font-medium">Quality:</span>
          {([
            { value: 'all', label: 'All', dot: 'bg-gray-400' },
            { value: 'fresh', label: 'Fresh', dot: 'bg-green-500' },
            { value: 'consume_soon', label: 'Consume Soon', dot: 'bg-amber-500' },
            { value: 'expired', label: 'Expired', dot: 'bg-red-500' },
          ] as { value: FreshnessStatus | 'all'; label: string; dot: string }[]).map((f) => (
            <button
              key={f.value}
              onClick={() => setFreshnessFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                freshnessFilter === f.value
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${f.dot}`} />
              {f.label}
            </button>
          ))}
        </div>

        {/* Geolocation bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <RippleButton onClick={requestGeo} variant={position ? 'ghost' : 'secondary'} className="text-sm" disabled={geoLoading}>
              {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
              {position ? 'Location Active' : 'Find Nearby'}
            </RippleButton>
            {geoError && <span className="text-xs text-red-500">{geoError}</span>}
            {position && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Radius:</span>
                <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="text-xs px-2 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                </select>
              </div>
            )}
          </div>
          <RippleButton onClick={() => setShowMap((s) => !s)} variant="ghost" className="text-sm">
            <MapPin className="h-4 w-4" /> {showMap ? 'Hide Map' : 'Show Map'}
          </RippleButton>
        </div>

        {/* Map view */}
        {showMap && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8">
            <LeafletMap
              points={[
                ...(position ? [{ lat: position.lat, lng: position.lng, type: 'user' as const, popup: '<strong>Volunteer Location</strong><br/>You are here' }] : []),
                ...current.filter((d) => d.latitude != null && d.longitude != null).map((d) => ({ lat: d.latitude!, lng: d.longitude!, type: 'donor' as const, popup: `<div style='min-width:180px'><strong>${d.food_name}</strong><br/><span style='color:#666'>${d.organization}</span><br/><br/><b>Quantity:</b> ${d.quantity} ${d.quantity_unit}<br/><b>Pickup:</b> ${new Date(d.pickup_time).toLocaleString()}<br/><b>Address:</b> ${d.address}, ${d.city}${position ? `<br/><b>Distance:</b> ${haversineKm([position.lat, position.lng], [d.latitude!, d.longitude!]).toFixed(1)} km` : ''}</div>` })),
              ]}
              showRoute={!!route}
              routeCoords={route?.coordinates ?? []}
              height="h-80"
              selectedPoint={selectedMapPoint}
            />
            {route && (
              <div className="mt-2 flex items-center justify-between text-sm bg-primary-50 dark:bg-primary-900/20 rounded-xl p-3">
                <span className="font-medium flex items-center gap-2"><Ruler className="h-4 w-4 text-primary-500" /> Route: {route.distanceKm.toFixed(1)} km • ~{Math.round(route.durationMin)} min</span>
                <button onClick={() => setRoute(null)} className="text-xs text-gray-500 hover:text-gray-700">Clear route</button>
              </div>
            )}
          </motion.div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <FoodCardSkeleton key={i} />)}
          </div>
        ) : current.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No donations match your search. Try different filters.</p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {current.map((d) => (
              <motion.div
                key={d.id}
                variants={fadeInUp}
                whileHover={{ y: -6 }}
                onClick={() => setSelected(d)}
                className="card overflow-hidden cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <DonationImage src={d.image_url} alt={d.food_name} variant="donation" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {d.is_urgent && (
                    <span className="absolute top-3 left-3 badge bg-red-500 text-white">
                      <Flame className="h-3 w-3" /> Urgent
                    </span>
                  )}
                  <span className="absolute top-3 right-3 badge bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-200 backdrop-blur-md capitalize">
                    {d.category}
                  </span>
                  {d.freshness_status && (
                    <div className="absolute bottom-3 left-3">
                      <FoodQualityBadge freshness={d.freshness_status} score={d.quality_score} size="sm" showScore />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display font-semibold text-lg mb-1">{d.food_name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                    <Hotel className="h-3.5 w-3.5" /> {d.organization}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                      <Package className="h-3 w-3" /> {d.quantity} {d.quantity_unit}
                    </span>
                    <span className="badge bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300">
                      <Clock className="h-3 w-3" /> {formatTime(d.expiry_time)}
                    </span>
                    {d.freshness_status && <FoodQualityBadge freshness={d.freshness_status} size="sm" />}
                    {position && d.latitude != null && d.longitude != null && (() => {
                      const dist = haversineKm([position.lat, position.lng], [d.latitude!, d.longitude!]);
                      const ttm = estimateTravelTimeMin(dist);
                      return (
                        <span className="badge bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          <MapPin className="h-3 w-3" /> {dist.toFixed(1)} km • ~{Math.round(ttm)} min
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" />
                    <span>{d.address}, {d.city}</span>
                  </p>
                  {d.latitude != null && d.longitude != null && (
                    <div className="mt-3">
                      <RippleButton onClick={(e) => { e.stopPropagation(); setShowMap(true); setSelectedMapPoint({ lat: d.latitude!, lng: d.longitude!, type: 'donor', popup: `<strong>${d.food_name}</strong><br/>${d.organization}` }); }} variant="ghost" className="text-xs px-3 py-1.5">
                        <MapPin className="h-3 w-3" /> View on Map
                      </RippleButton>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-full glass disabled:opacity-40 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`h-10 w-10 rounded-full font-medium text-sm transition-all ${
                  page === i + 1 ? 'bg-primary-600 text-white shadow-lg' : 'glass hover:bg-primary-50 dark:hover:bg-primary-900/30'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-full glass disabled:opacity-40 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </section>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="relative h-56">
                <DonationImage src={selected.image_url} alt={selected.food_name} variant="donation" className="w-full h-full object-cover" />
                <button onClick={() => setSelected(null)} className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <h2 className="font-display text-2xl font-bold mb-2">{selected.food_name}</h2>
                <p className="text-gray-500 mb-4">{selected.organization} - {selected.organization_type}</p>
                {selected.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{selected.description}</p>}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="card p-3"><p className="text-gray-400 text-xs">Quantity</p><p className="font-semibold">{selected.quantity} {selected.quantity_unit}</p></div>
                  <div className="card p-3"><p className="text-gray-400 text-xs">Category</p><p className="font-semibold capitalize">{selected.category}</p></div>
                  <div className="card p-3"><p className="text-gray-400 text-xs">Pickup Time</p><p className="font-semibold">{new Date(selected.pickup_time).toLocaleString()}</p></div>
                  <div className="card p-3"><p className="text-gray-400 text-xs">Expiry</p><p className="font-semibold">{new Date(selected.expiry_time).toLocaleString()}</p></div>
                  <div className="card p-3 col-span-2"><p className="text-gray-400 text-xs">Address</p><p className="font-semibold">{selected.address}, {selected.city}</p></div>
                  {selected.contact_phone && <div className="card p-3 col-span-2"><p className="text-gray-400 text-xs">Contact</p><p className="font-semibold">{selected.contact_phone}</p></div>}
                </div>
                {selected.freshness_status && (
                  <div className="mt-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-400 mb-2">Food Quality Assessment</p>
                    <FoodQualityBadge freshness={selected.freshness_status} score={selected.quality_score} priority={selected.priority_level} size="md" showScore showPriority />
                    {selected.estimated_meals != null && selected.estimated_meals > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-white dark:bg-gray-800/70"><p className="text-gray-400">Est. Meals</p><p className="font-semibold">{selected.estimated_meals}</p></div>
                        <div className="p-2 rounded-xl bg-white dark:bg-gray-800/70"><p className="text-gray-400">Recipient</p><p className="font-semibold">{selected.recommended_recipient || '-'}</p></div>
                      </div>
                    )}
                  </div>
                )}
                {acceptedId === selected.id ? (
                  <div className="mt-6 flex items-center justify-center gap-2 py-3 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium">
                    <CheckCircle2 className="h-5 w-5" /> Accepted! Redirecting...
                  </div>
                ) : (
                  <div className="mt-6 space-y-2">
                    <RippleButton onClick={() => acceptPickup(selected)} variant="primary" fullWidth disabled={accepting}>
                      {accepting ? <><Loader2 className="h-4 w-4 animate-spin" /> Accepting...</> : 'Accept Pickup'}
                    </RippleButton>
                    {position && selected.latitude != null && selected.longitude != null && (
                      <RippleButton onClick={() => generateRoute(selected)} variant="ghost" fullWidth disabled={routeLoading}>
                        {routeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />} {routeLoading ? 'Calculating...' : 'Get Route'}
                      </RippleButton>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
