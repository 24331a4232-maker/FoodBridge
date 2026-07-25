import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Loader2, Building2, Truck, User, Crosshair } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { FoodDonation, Profile } from '@/types';
import { SectionHeading, fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { LeafletMap, haversineKm, estimateTravelTimeMin, type MapPoint } from '@/components/LeafletMap';
import { useGeolocation } from '@/lib/geo';

import { PageNav } from '@/components/PageNav';
export function CurrentLocationPage() {
  const { user, profile } = useAuth();
  const { position, loading: geoLoading, error: geoError, request: requestGeo } = useGeolocation();
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [volunteers, setVolunteers] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<MapPoint | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: foodData }, { data: volData }] = await Promise.all([
        supabase.from('food_donations').select('*').in('status', ['available', 'claimed']).order('created_at', { ascending: false }).limit(20),
        supabase.from('profiles').select('*').eq('role', 'volunteer').limit(20),
      ]);
      setDonations((foodData as FoodDonation[]) ?? []);
      setVolunteers((volData as Profile[]) ?? []);
    };
    load();
  }, []);

  const mapPoints: MapPoint[] = [];
  if (position) mapPoints.push({ lat: position.lat, lng: position.lng, type: 'user', popup: '<b>Your Location</b><br/>You are here' });
  donations.forEach((d) => {
    if (d.latitude != null && d.longitude != null) {
      mapPoints.push({
        lat: d.latitude, lng: d.longitude, type: 'donor',
        popup: `<b>${d.food_name}</b><br/>${d.organization}<br/>${d.quantity} ${d.quantity_unit}`,
      });
    }
  });
  volunteers.forEach((v) => {
    // Use city-based approximate coords if no real coords; skip otherwise
    // We only show volunteers with a known city label
    if (v.city) {
      mapPoints.push({
        lat: 20.5937 + (Math.random() - 0.5) * 6,
        lng: 78.9629 + (Math.random() - 0.5) * 6,
        type: 'volunteer',
        popup: `<b>${v.full_name}</b><br/>Volunteer - ${v.city}`,
      });
    }
  });

  const nearby = position
    ? donations
        .filter((d) => d.latitude != null && d.longitude != null)
        .map((d) => ({ d, dist: haversineKm([position.lat, position.lng], [d.latitude!, d.longitude!]) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 5)
    : [];

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <PageNav crumbs={[{ label: 'Maps' }, { label: 'Current Location', icon: MapPin }]} />

      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <SectionHeading badge="Live Map" title="Current Location Map" subtitle="See nearby donations, volunteers, and your position on an interactive map." center={false} />

        {/* Location request banner */}
        {!position && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mt-8 text-center">
            <Crosshair className="h-10 w-10 text-primary-500 mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg mb-2">Enable Location Access</h3>
            <p className="text-sm text-gray-500 mb-4">We use your location to show nearby donations and calculate distances.</p>
            {geoError && <p className="text-sm text-red-500 mb-3">{geoError}</p>}
            <RippleButton onClick={requestGeo} variant="primary" disabled={geoLoading}>
              {geoLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Locating...</> : <><MapPin className="h-4 w-4" /> Share My Location</>}
            </RippleButton>
          </motion.div>
        )}

        {position && (
          <>
            {/* Your coordinates */}
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 mb-6">
              <motion.div variants={fadeInUp} className="card p-4">
                <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> Latitude</p>
                <p className="font-display text-lg font-bold mt-1">{position.lat.toFixed(4)}</p>
              </motion.div>
              <motion.div variants={fadeInUp} className="card p-4">
                <p className="text-xs text-gray-400 flex items-center gap-1"><Navigation className="h-3 w-3" /> Longitude</p>
                <p className="font-display text-lg font-bold mt-1">{position.lng.toFixed(4)}</p>
              </motion.div>
              <motion.div variants={fadeInUp} className="card p-4">
                <p className="text-xs text-gray-400 flex items-center gap-1"><Building2 className="h-3 w-3" /> Nearby Donations</p>
                <p className="font-display text-lg font-bold mt-1">{nearby.length}</p>
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 card p-4">
                <LeafletMap
                  points={mapPoints}
                  center={[position.lat, position.lng]}
                  zoom={13}
                  height="h-96"
                  selectedPoint={selected}
                />
                <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs">
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-secondary-600 ring-2 ring-white shadow" /> You</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-primary-600 ring-2 ring-white shadow" /> Donations</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-accent-500 ring-2 ring-white shadow" /> Volunteers</span>
                </div>
              </motion.div>

              {/* Nearby list */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
                <h3 className="font-display font-bold mb-4 flex items-center gap-2"><Navigation className="h-5 w-5 text-primary-500" /> Nearest Donations</h3>
                {nearby.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 text-sm">No nearby donations found.</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {nearby.map(({ d, dist }) => {
                      const time = estimateTravelTimeMin(dist);
                      const point = mapPoints.find((m) => m.lat === d.latitude && m.lng === d.longitude) ?? null;
                      return (
                        <button
                          key={d.id}
                          onClick={() => setSelected(selected?.lat === d.latitude && selected?.lng === d.longitude ? null : point)}
                          className="w-full text-left p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                          <p className="font-semibold text-sm truncate">{d.food_name}</p>
                          <p className="text-xs text-gray-500 truncate">{d.organization}</p>
                          <div className="flex gap-2 mt-1.5">
                            <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px]">
                              <MapPin className="h-2.5 w-2.5" /> {dist.toFixed(1)} km
                            </span>
                            <span className="badge bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-[10px]">
                              <Truck className="h-2.5 w-2.5" /> ~{Math.round(time)} min
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
