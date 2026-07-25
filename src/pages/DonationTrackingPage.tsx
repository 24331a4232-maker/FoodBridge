import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, Clock, MapPin, CheckCircle2, Truck, Loader2, ArrowRight, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { FoodDonation, Pickup, Certificate } from '@/types';
import { fadeInUp, staggerContainer, SectionHeading } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { LeafletMap, haversineKm, type MapPoint } from '@/components/LeafletMap';
import { useGeolocation } from '@/lib/geo';
import { DonationStatusTracker } from '@/components/DonationStatusTracker';

const statusConfig: Record<string, { label: string; color: string; icon: typeof Package }> = {
  available: { label: 'Available', color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300', icon: Package },
  claimed: { label: 'Claimed', color: 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300', icon: CheckCircle2 },
};

import { PageNav } from '@/components/PageNav';
export function DonationTrackingPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { position, loading: geoLoading, request: requestGeo } = useGeolocation();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Pickup | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from('pickups')
        .select('*, donation:food_donations(*)')
        .eq('volunteer_id', user.id)
        .order('created_at', { ascending: false });
      setPickups((data as Pickup[]) ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  const active = pickups.filter((p) => p.status === 'accepted' || p.status === 'in_progress');
  const completed = pickups.filter((p) => p.status === 'delivered');

  const mapPoints: MapPoint[] = [];
  if (position) mapPoints.push({ lat: position.lat, lng: position.lng, type: 'user', popup: '<b>Your Location</b>' });
  pickups.forEach((p) => {
    if (p.donation?.latitude != null && p.donation?.longitude != null) {
      mapPoints.push({
        lat: p.donation.latitude,
        lng: p.donation.longitude,
        type: p.status === 'delivered' ? 'ngo' : 'donor',
        popup: `<b>${p.donation.food_name}</b><br/>${p.donation.organization}<br/>Status: ${statusConfig[p.status]?.label ?? p.status}`,
      });
    }
  });

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <PageNav crumbs={[{ label: 'Tracking' }, { label: 'Donation Tracking', icon: Package }]} />

      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <SectionHeading badge="Tracking" title="Donation Tracking" subtitle="Track every donation from pickup to delivery in real time." center={false} />

        {!user ? (
          <div className="card p-8 text-center mt-8">
            <p className="text-gray-500 mb-4">Please sign in to track your donations.</p>
            <Link to="/login"><RippleButton variant="primary">Sign In</RippleButton></Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-3 gap-4 mt-8 mb-8">
              {[
                { label: 'Active', value: active.length, color: 'from-gold-500 to-accent-500', icon: Truck },
                { label: 'Completed', value: completed.length, color: 'from-primary-500 to-primary-600', icon: CheckCircle2 },
                { label: 'Total', value: pickups.length, color: 'from-secondary-500 to-secondary-500', icon: Package },
              ].map((s) => (
                <motion.div key={s.label} variants={fadeInUp} className="card p-4 sm:p-5 text-center">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <p className="font-display text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Map */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary-500" /> Live Map</h3>
                  {!position && (
                    <RippleButton onClick={requestGeo} variant="ghost" className="text-xs">
                      {geoLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />} Enable Location
                    </RippleButton>
                  )}
                </div>
                <LeafletMap points={mapPoints} center={position ? [position.lat, position.lng] : [20.5937, 78.9629]} zoom={position ? 13 : 5} height="h-80" />
              </motion.div>

              {/* Pickup list */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
                <h3 className="font-display font-bold mb-4">Your Pickups</h3>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
                  </div>
                ) : pickups.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No pickups yet. <Link to="/services/available-food" className="text-primary-500 underline">Browse donations</Link>.</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {pickups.map((p) => {
                      const cfg = statusConfig[p.status] ?? statusConfig.available;
                      const dist = position && p.donation?.latitude != null && p.donation?.longitude != null
                        ? haversineKm([position.lat, position.lng], [p.donation.latitude, p.donation.longitude]) : null;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelected(selected?.id === p.id ? null : p)}
                          className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl transition-colors ${selected?.id === p.id ? 'bg-primary-50 dark:bg-primary-900/30' : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-primary-50/50 dark:hover:bg-primary-900/20'}`}
                        >
                          <div className={`h-10 w-10 rounded-xl ${cfg.color} flex items-center justify-center shrink-0`}>
                            <cfg.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{p.donation?.food_name ?? 'Unknown donation'}</p>
                            <p className="text-xs text-gray-500 truncate">{p.donation?.organization}</p>
                          </div>
                          {dist != null && <span className="text-xs text-gray-400 shrink-0">{dist.toFixed(1)} km</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Selected detail */}
            {selected && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mt-6">
                <h3 className="font-display font-bold mb-3 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary-500" /> Pickup Details
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-xs text-gray-400">Food</p><p className="font-medium">{selected.donation?.food_name}</p></div>
                  <div><p className="text-xs text-gray-400">Donor</p><p className="font-medium">{selected.donation?.organization}</p></div>
                  <div><p className="text-xs text-gray-400">Quantity</p><p className="font-medium">{selected.donation?.quantity} {selected.donation?.quantity_unit}</p></div>
                  <div><p className="text-xs text-gray-400">Status</p><span className={`badge ${statusConfig[selected.status]?.color}`}>{statusConfig[selected.status]?.label}</span></div>
                </div>
                {selected.donation?.address && (
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {selected.donation.address}, {selected.donation.city}</p>
                )}

                {/* Donation status timeline */}
                <div className="mt-6 pt-6 border-t border-linen dark:border-secondary-800">
                  <h4 className="font-display font-semibold mb-4 flex items-center gap-2">
                    <Award className="h-4 w-4 text-accent-500" /> Donation Journey
                  </h4>
                  <DonationStatusTracker donation={selected.donation!} pickup={selected} />
                </div>
              </motion.div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
