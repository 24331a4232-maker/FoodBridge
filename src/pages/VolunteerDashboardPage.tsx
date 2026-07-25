import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Package, CheckCircle2, Clock, Award, MapPin, Trophy, Star, Medal, Flame, Download, ArrowRight, Zap, Target, Navigation, Loader2, X, Ruler,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { FoodDonation, Pickup, Profile } from '@/types';
import { fadeInUp, staggerContainer, AnimatedCounter } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { LeafletMap, haversineKm, estimateTravelTimeMin, type MapPoint } from '@/components/LeafletMap';
import { useGeolocation, getRoute, type RouteInfo } from '@/lib/geo';
import { createCertificateRecord } from '@/lib/certificate';
import { FoodQualityBadge } from '@/components/FoodQualityBadge';

interface LeaderboardEntry {
  name: string;
  points: number;
  deliveries: number;
  avatar: string;
  isMe?: boolean;
}

const achievements = [
  { icon: Flame, title: 'First Delivery', desc: 'Complete your first pickup', color: 'from-orange-500 to-red-500' },
  { icon: Medal, title: '10 Deliveries', desc: 'Reach 10 successful deliveries', color: 'from-primary-500 to-primary-600' },
  { icon: Star, title: '50 Deliveries', desc: 'Reach 50 successful deliveries', color: 'from-yellow-500 to-amber-500' },
  { icon: Trophy, title: 'Top Volunteer', desc: 'Reach top 3 on leaderboard', color: 'from-accent-500 to-accent-600' },
];

const badges = ['First Step', 'Hunger Hero', 'Green Guardian', 'Community Star', 'Fast Mover'];

export function VolunteerDashboardPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [available, setAvailable] = useState<FoodDonation[]>([]);
  const [myPickups, setMyPickups] = useState<Pickup[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { position, loading: geoLoading, error: geoError, request: requestGeo } = useGeolocation();
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeTarget, setRouteTarget] = useState<FoodDonation | null>(null);
  const [mapModalDonation, setMapModalDonation] = useState<FoodDonation | null>(null);
  const [radius, setRadius] = useState(10);

  const loadLeaderboard = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, reward_points, total_deliveries')
      .order('reward_points', { ascending: false })
      .limit(10);
    const entries: LeaderboardEntry[] = ((data as Pick<Profile, 'full_name' | 'reward_points' | 'total_deliveries'>[]) ?? [])
      .filter((p) => p.full_name)
      .map((p) => ({
        name: p.full_name,
        points: p.reward_points ?? 0,
        deliveries: p.total_deliveries ?? 0,
        avatar: p.full_name[0]?.toUpperCase() ?? 'U',
        isMe: p.full_name === profile?.full_name,
      }));
    if (entries.length < 5) {
      const fallback = [
        { name: 'Ananya K.', points: 2840, deliveries: 96, avatar: 'A' },
        { name: 'Rahul V.', points: 2310, deliveries: 78, avatar: 'R' },
        { name: 'Fatima K.', points: 1980, deliveries: 65, avatar: 'F' },
        { name: 'Vikram S.', points: 1640, deliveries: 52, avatar: 'V' },
        { name: 'Sneha P.', points: 1320, deliveries: 41, avatar: 'S' },
      ];
      setLeaderboard(fallback.slice(0, 5 - entries.length).concat(entries).slice(0, 5));
    } else {
      setLeaderboard(entries.slice(0, 5));
    }
  };

  useEffect(() => {
    const load = async () => {
      const [{ data: foodData }, { data: pickupData }] = await Promise.all([
        supabase.from('food_donations').select('*').eq('status', 'available').order('created_at', { ascending: false }).limit(6),
        user ? supabase.from('pickups').select('*, donation:food_donations(*)').eq('volunteer_id', user.id).order('created_at', { ascending: false }) : Promise.resolve({ data: null }),
      ]);
      setAvailable((foodData as FoodDonation[]) ?? []);
      setMyPickups((pickupData as Pickup[]) ?? []);
      setLoading(false);
      loadLeaderboard();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const acceptPickup = async (donation: FoodDonation) => {
    if (!user) {
      toast('Please login to accept pickups', 'error');
      return;
    }
    const { error } = await supabase.from('pickups').insert({
      donation_id: donation.id,
      volunteer_id: user.id,
      status: 'accepted',
      points_earned: donation.is_urgent ? 50 : 25,
    });
    if (error) {
      toast('Could not accept this pickup', 'error');
    } else {
      await supabase.from('food_donations').update({ status: 'claimed' }).eq('id', donation.id);
      toast('Pickup accepted! Check your tasks below.', 'success');
      setAvailable((a) => a.filter((d) => d.id !== donation.id));
      const { data } = await supabase.from('pickups').select('*, donation:food_donations(*)').eq('volunteer_id', user.id).order('created_at', { ascending: false });
      setMyPickups((data as Pickup[]) ?? []);
    }
  };

  const markDelivered = async (pickup: Pickup) => {
    const { error } = await supabase.from('pickups').update({ status: 'delivered', delivered_at: new Date().toISOString() }).eq('id', pickup.id);
    if (error) { toast('Could not update status', 'error'); return; }
    await supabase.from('food_donations').update({ status: 'delivered' }).eq('id', pickup.donation_id);
    const newDeliveries = (profile?.total_deliveries ?? 0) + 1;
    const newHours = (profile?.total_hours ?? 0) + 0.5;
    if (profile) {
      await supabase.from('profiles').update({
        total_deliveries: newDeliveries,
        total_hours: newHours,
        reward_points: (profile.reward_points ?? 0) + (pickup.points_earned ?? 25),
      }).eq('id', profile.id);
    }
    toast('Delivery completed! Points earned.', 'success');

    // Auto-generate certificate
    if (user && profile) {
      const cert = await createCertificateRecord({
        volunteerId: user.id,
        volunteerName: profile.full_name,
        organizationName: profile.organization || 'FoodBridge',
        deliveriesCount: newDeliveries,
        hoursServed: newHours,
        totalMeals: newDeliveries,
      });
      if (cert) {
        toast('A new certificate has been generated for this delivery!', 'success');
      }
    }

    if (user) {
      const { data } = await supabase.from('pickups').select('*, donation:food_donations(*)').eq('volunteer_id', user.id).order('created_at', { ascending: false });
      setMyPickups((data as Pickup[]) ?? []);
      await refreshProfile();
      loadLeaderboard();
    }
  };

  const activeTasks = myPickups.filter((p) => p.status === 'accepted' || p.status === 'in_progress');
  const completed = myPickups.filter((p) => p.status === 'delivered');
  const points = profile?.reward_points ?? 0;
  const deliveries = profile?.total_deliveries ?? 0;
  const progress = Math.min(100, (deliveries / 50) * 100);

  const mapPoints: MapPoint[] = [];
  if (position) mapPoints.push({ lat: position.lat, lng: position.lng, type: 'user', popup: 'You are here' });
  activeTasks.forEach((t) => {
    if (t.donation?.latitude != null && t.donation?.longitude != null) {
      mapPoints.push({
        lat: t.donation.latitude,
        lng: t.donation.longitude,
        type: 'donor',
        popup: `<strong>${t.donation.food_name}</strong><br/>${t.donation.organization}`,
      });
    }
  });

  const nearbyWithDistance = position
    ? available
        .filter((d) => d.latitude != null && d.longitude != null)
        .map((d) => ({ d, dist: haversineKm([position.lat, position.lng], [d.latitude!, d.longitude!]) }))
        .filter((x) => x.dist <= radius)
        .sort((a, b) => a.dist - b.dist)
    : [];

  const generateRoute = async (donation: FoodDonation) => {
    if (!position) { toast('Enable location first to generate a route', 'info'); return; }
    if (donation.latitude == null || donation.longitude == null) { toast('This donation has no map coordinates', 'error'); return; }
    setRouteLoading(true);
    setRouteTarget(donation);
    const r = await getRoute([position.lat, position.lng], [donation.latitude, donation.longitude]);
    setRouteLoading(false);
    if (r) { setRoute(r); toast(`Route ready: ${r.distanceKm.toFixed(1)} km, ~${Math.round(r.durationMin)} min`, 'success'); }
    else toast('Could not generate route. Please try again.', 'error');
  };

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">Volunteer Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Volunteer'}!</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/certificate"><RippleButton variant="primary"><Download className="h-4 w-4" /> Download Certificate</RippleButton></Link>
            <Link to="/my-certificates"><RippleButton variant="secondary"><Award className="h-4 w-4" /> My Certificates</RippleButton></Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Reward Points', value: points, icon: Zap, color: 'from-yellow-500 to-amber-500' },
            { label: 'Deliveries', value: deliveries, icon: Package, color: 'from-primary-500 to-primary-600' },
            { label: 'Active Tasks', value: activeTasks.length, icon: Clock, color: 'from-blue-500 to-primary-500' },
            { label: 'Completed', value: completed.length, icon: CheckCircle2, color: 'from-primary-600 to-emerald-500' },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeInUp} className="card p-5">
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-3 shadow-lg`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="font-display text-2xl font-bold"><AnimatedCounter value={s.value} /></p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Nearby Donations */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary-500" /> Nearby Donations</h2>
                <div className="flex items-center gap-3">
                  {position && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">Radius:</span>
                      <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="text-xs px-2 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <option value={5}>5 km</option>
                        <option value={10}>10 km</option>
                        <option value={25}>25 km</option>
                        <option value={50}>50 km</option>
                      </select>
                    </div>
                  )}
                  <Link to="/available-food" className="text-sm text-primary-600 hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
                </div>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
                </div>
              ) : available.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No donations available right now. Check back soon!</p>
              ) : (
                <div className="space-y-3">
                  {(position ? nearbyWithDistance.map((x) => x.d) : available).map((d) => {
                    const dist = position ? nearbyWithDistance.find((x) => x.d.id === d.id)?.dist : null;
                    return (
                      <motion.div key={d.id} variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                        <img src={d.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'} alt="" className="h-16 w-16 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{d.food_name}</p>
                          <p className="text-xs text-gray-500 truncate">{d.organization} - {d.city}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px]">{d.quantity} {d.quantity_unit}</span>
                            {d.is_urgent && <span className="badge bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px]"><Flame className="h-2.5 w-2.5" /> Urgent</span>}
                            {d.freshness_status && <FoodQualityBadge freshness={d.freshness_status} score={d.quality_score} size="sm" showScore />}
                            {dist != null && <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px]"><MapPin className="h-2.5 w-2.5" /> {dist.toFixed(1)} km</span>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <RippleButton onClick={() => acceptPickup(d)} variant="primary" className="text-xs px-4 py-2">Accept</RippleButton>
                          {d.latitude != null && d.longitude != null && (
                            <RippleButton onClick={() => setMapModalDonation(d)} variant="ghost" className="text-xs px-3 py-1.5">
                              <MapPin className="h-3 w-3" /> View on Map
                            </RippleButton>
                          )}
                          {position && d.latitude != null && d.longitude != null && (
                            <RippleButton onClick={() => generateRoute(d)} variant="ghost" className="text-xs px-3 py-1.5" disabled={routeLoading}>
                              <Navigation className="h-3 w-3" /> Route
                            </RippleButton>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Today's Tasks */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 mb-4"><Clock className="h-5 w-5 text-accent-500" /> Today's Tasks</h2>
              {activeTasks.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No active tasks. Accept a pickup to get started!</p>
              ) : (
                <div className="space-y-3">
                  {activeTasks.map((p) => (
                    <div key={p.id} className="flex items-center gap-4 p-3 rounded-2xl bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800">
                      <Package className="h-8 w-8 text-accent-500 shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{p.donation?.food_name ?? 'Pickup'}</p>
                        <p className="text-xs text-gray-500">{p.donation?.address ?? ''}</p>
                      </div>
                      <RippleButton onClick={() => markDelivered(p)} variant="primary" className="text-xs px-4 py-2 shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Delivered
                      </RippleButton>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Completed Deliveries Timeline */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 mb-4"><CheckCircle2 className="h-5 w-5 text-primary-500" /> Completed Deliveries</h2>
              {completed.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No completed deliveries yet.</p>
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
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-primary-500" /> Progress to 50</h3>
              <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" />
              </div>
              <p className="text-xs text-gray-500 text-right">{deliveries} / 50 deliveries</p>
            </motion.div>

            {/* Leaderboard */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" /> Leaderboard</h3>
              <div className="space-y-2">
                {leaderboard.map((l, i) => (
                  <div key={l.name + i} className={`flex items-center gap-3 p-2 rounded-xl ${i === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''} ${l.isMe ? 'ring-2 ring-primary-400' : ''}`}>
                    <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{i + 1}</span>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">{l.avatar}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{l.name}{l.isMe && <span className="text-xs text-primary-600 ml-1">(You)</span>}</p>
                      <p className="text-xs text-gray-400">{l.deliveries} deliveries</p>
                    </div>
                    <span className="text-sm font-bold text-primary-600">{l.points}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Award className="h-5 w-5 text-accent-500" /> Achievements</h3>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((a) => (
                  <div key={a.title} className="text-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${a.color} text-white flex items-center justify-center mx-auto mb-2`}>
                      <a.icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold">{a.title}</p>
                    <p className="text-[10px] text-gray-400">{a.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Badges */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Medal className="h-5 w-5 text-primary-500" /> Badges</h3>
              <div className="flex flex-wrap gap-2">
                {badges.map((b, i) => (
                  <span key={b} className={`badge ${i < Math.min(deliveries, badges.length) ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    {b}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Map & Route */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold flex items-center gap-2"><Navigation className="h-5 w-5 text-primary-500" /> Your Route</h3>
                {!position && (
                  <RippleButton onClick={requestGeo} variant="secondary" className="text-xs px-3 py-1.5" disabled={geoLoading}>
                    {geoLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />} Detect Location
                  </RippleButton>
                )}
              </div>
              {geoError && <p className="text-xs text-red-500 mb-2">{geoError}</p>}
              {position ? (
                <>
                  <LeafletMap
                    points={mapPoints}
                    showRoute={!!route}
                    routeCoords={route?.coordinates ?? []}
                    height="h-56"
                  />
                  {route && routeTarget && (
                    <div className="mt-3 flex items-center justify-between text-sm bg-primary-50 dark:bg-primary-900/20 rounded-xl p-3">
                      <div>
                        <p className="font-medium">Route to {routeTarget.food_name}</p>
                        <p className="text-xs text-gray-500">{route.distanceKm.toFixed(1)} km • ~{Math.round(route.durationMin)} min drive</p>
                      </div>
                      <a
                        href={`https://www.openstreetmap.org/directions?from=${position.lat}%2C${position.lng}&to=${routeTarget.latitude}%2C${routeTarget.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-600 hover:underline text-xs flex items-center gap-1"
                      >
                        Open in OSM <ArrowRight className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {activeTasks.length > 0 && !route && (
                    <div className="mt-3 space-y-2">
                      {activeTasks.map((t) => t.donation?.latitude != null && t.donation?.longitude != null ? (
                        <RippleButton key={t.id} onClick={() => generateRoute(t.donation!)} variant="ghost" fullWidth disabled={routeLoading}>
                          {routeLoading && routeTarget?.id === t.donation?.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                          Route to {t.donation?.food_name}
                        </RippleButton>
                      ) : null)}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl overflow-hidden h-56 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Click "Detect Location" to see your route</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Modal */}
      <AnimatePresence>
        {mapModalDonation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setMapModalDonation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary-500" /> {mapModalDonation.food_name}</h3>
                <button onClick={() => setMapModalDonation(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              <LeafletMap
                points={[
                  ...(position ? [{ lat: position.lat, lng: position.lng, type: 'user' as const, popup: '<strong>Volunteer Location</strong><br/>You are here' }] : []),
                  { lat: mapModalDonation.latitude!, lng: mapModalDonation.longitude!, type: 'donor' as const, popup: `<div style='min-width:180px'><strong>${mapModalDonation.food_name}</strong><br/><span style='color:#666'>${mapModalDonation.organization}</span><br/><br/><b>Quantity:</b> ${mapModalDonation.quantity} ${mapModalDonation.quantity_unit}<br/><b>Pickup:</b> ${new Date(mapModalDonation.pickup_time).toLocaleString()}<br/><b>Address:</b> ${mapModalDonation.address}, ${mapModalDonation.city}</div>` },
                ]}
                height="h-72"
                fitBounds={!!position}
                zoom={14}
              />
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-400">Address</p>
                  <p className="font-medium">{mapModalDonation.address}, {mapModalDonation.city}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-400">Pickup Time</p>
                  <p className="font-medium">{new Date(mapModalDonation.pickup_time).toLocaleString()}</p>
                </div>
                {position && mapModalDonation.latitude != null && mapModalDonation.longitude != null && (() => {
                  const dist = haversineKm([position.lat, position.lng], [mapModalDonation.latitude!, mapModalDonation.longitude!]);
                  const ttm = estimateTravelTimeMin(dist);
                  return (
                    <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 col-span-2 flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-primary-500" />
                      <span className="font-medium">Distance: {dist.toFixed(1)} km • Estimated travel: ~{Math.round(ttm)} min</span>
                    </div>
                  );
                })()}
              </div>
              <div className="mt-4 flex gap-2">
                <RippleButton onClick={() => acceptPickup(mapModalDonation)} variant="primary" fullWidth>Accept Pickup</RippleButton>
                {position && mapModalDonation.latitude != null && mapModalDonation.longitude != null && (
                  <RippleButton onClick={() => { generateRoute(mapModalDonation); setMapModalDonation(null); }} variant="secondary" fullWidth disabled={routeLoading}>
                    <Navigation className="h-4 w-4" /> Get Route
                  </RippleButton>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
