import { useState, useMemo, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, MapPin, UtensilsCrossed, Hotel, Calendar, Package, CheckCircle2, Sparkles, Image as ImageIcon, Loader2, Crosshair, Hand, Locate,
  ShieldCheck, AlertTriangle, XCircle, Thermometer, Snowflake, Clock, ChefHat, Heart, Baby, Home, Zap, Flame, Info,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useNotifications } from '@/context/NotificationContext';
import type { OrganizationType, FoodCategory, StorageMethod, FoodCondition, FoodDonation } from '@/types';
import { createHandoverForDonation } from '@/lib/handover';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { Link } from 'react-router-dom';
import { LeafletMap, type MapPoint } from '@/components/LeafletMap';
import { geocodeAddress, reverseGeocode } from '@/lib/geo';
import { calculateFoodQuality, getScoreGradient, type QualityResult } from '@/lib/foodQuality';

const orgTypes: { value: OrganizationType; label: string }[] = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'event', label: 'Event / Marriage Hall' },
  { value: 'caterer', label: 'Caterer' },
  { value: 'other', label: 'Other' },
];

const foodCategories: { value: FoodCategory; label: string }[] = [
  { value: 'cooked', label: 'Cooked Food' },
  { value: 'raw', label: 'Raw' },
  { value: 'packaged', label: 'Packaged' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'other', label: 'Other' },
];

const storageMethods: { value: StorageMethod; label: string; icon: typeof Snowflake }[] = [
  { value: 'room_temperature', label: 'Room Temperature', icon: Thermometer },
  { value: 'refrigerated', label: 'Refrigerated', icon: Snowflake },
  { value: 'frozen', label: 'Frozen', icon: Snowflake },
];

const foodConditions: { value: FoodCondition; label: string }[] = [
  { value: 'fresh', label: 'Fresh' },
  { value: 'good', label: 'Good' },
  { value: 'average', label: 'Average' },
];

const recipientIcons: Record<string, typeof ChefHat> = {
  ChefHat, Heart, Baby, Home,
};

import { PageNav } from '@/components/PageNav';
export function DonateFoodPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { pushNotification, pushToast } = useNotifications();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);
  const [pickMode, setPickMode] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState('');
  const [form, setForm] = useState({
    donor_name: profile?.full_name ?? '',
    organization: '',
    organization_type: 'hotel' as OrganizationType,
    food_name: '',
    category: 'cooked' as FoodCategory,
    quantity: '',
    quantity_unit: 'servings',
    pickup_time: '',
    expiry_time: '',
    preparation_time: '',
    storage_method: 'room_temperature' as StorageMethod,
    food_temperature: '',
    food_condition: 'good' as FoodCondition,
    address: '',
    city: '',
    description: '',
    contact_phone: '',
    is_urgent: false,
    image_url: '',
  });

  const quality: QualityResult | null = useMemo(() => {
    if (!form.preparation_time || !form.expiry_time) return null;
    return calculateFoodQuality({
      category: form.category,
      preparationTime: form.preparation_time,
      expiryTime: form.expiry_time,
      storageMethod: form.storage_method,
      foodTemperature: form.food_temperature ? parseFloat(form.food_temperature) : null,
      foodCondition: form.food_condition,
      quantity: parseFloat(form.quantity) || 0,
      quantityUnit: form.quantity_unit,
    });
  }, [form.preparation_time, form.expiry_time, form.storage_method, form.food_temperature, form.food_condition, form.quantity, form.quantity_unit, form.category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setForm((f) => ({ ...f, image_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const useCurrentLocation = () => {
    setGeoError('');
    setLocating(true);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please pick a location on the map.');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setMapPoints([{ lat: latitude, lng: longitude, type: 'donor', popup: '<strong>Donor Location</strong><br/>Your current location' }]);
        setLocating(false);
        setGeocoding(true);
        const addr = await reverseGeocode(latitude, longitude);
        setGeocoding(false);
        if (addr) {
          setForm((f) => ({ ...f, address: addr }));
          toast('Location detected and address filled automatically.', 'success');
        } else {
          toast('Location detected. Please fill the address manually.', 'info');
        }
      },
      (err) => {
        setLocating(false);
        let msg = 'Could not get your location. ';
        if (err.code === err.PERMISSION_DENIED) msg += 'Permission denied. You can pick a location on the map instead.';
        else if (err.code === err.POSITION_UNAVAILABLE) msg += 'Position unavailable. Try picking on the map.';
        else if (err.code === err.TIMEOUT) msg += 'Request timed out. Try again or pick on the map.';
        setGeoError(msg);
        toast(msg, 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleMapClick = async (lat: number, lng: number) => {
    if (!pickMode) return;
    setCoords({ lat, lng });
    setMapPoints([{ lat, lng, type: 'donor', popup: '<strong>Donor Location</strong><br/>Selected on map' }]);
    setGeocoding(true);
    const addr = await reverseGeocode(lat, lng);
    setGeocoding(false);
    if (addr) {
      setForm((f) => ({ ...f, address: addr }));
      toast('Location selected and address filled automatically.', 'success');
    } else {
      toast('Location selected. Please fill the address manually.', 'info');
    }
    setPickMode(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Please login to donate food', 'error');
      return;
    }
    if (!form.food_name || !form.organization || !form.pickup_time || !form.expiry_time || !form.address) {
      toast('Please fill all required fields', 'error');
      return;
    }
    if (quality?.isExpired) {
      toast('This food is expired and cannot be donated. Please check the preparation and expiry times.', 'error');
      return;
    }
    setSubmitting(true);
    let lat = coords?.lat;
    let lng = coords?.lng;
    if (lat == null || lng == null) {
      setGeocoding(true);
      const fullAddress = `${form.address}, ${form.city}`.trim().replace(/,$/, '');
      const geo = await geocodeAddress(fullAddress);
      setGeocoding(false);
      if (!geo) {
        toast('Could not find this address on the map. Please check the address or use the map to pick a location.', 'error');
        setSubmitting(false);
        return;
      }
      lat = geo.lat;
      lng = geo.lng;
      setMapPoints([{ lat, lng, type: 'donor', popup: `<strong>${form.organization}</strong><br/>${form.food_name}` }]);
    }
    const { data: inserted, error } = await supabase.from('food_donations').insert({
      donor_id: user.id,
      donor_name: form.donor_name || profile?.full_name || '',
      organization: form.organization,
      organization_type: form.organization_type,
      food_name: form.food_name,
      category: form.category,
      quantity: form.quantity,
      quantity_unit: form.quantity_unit,
      pickup_time: new Date(form.pickup_time).toISOString(),
      expiry_time: new Date(form.expiry_time).toISOString(),
      preparation_time: form.preparation_time ? new Date(form.preparation_time).toISOString() : null,
      storage_method: form.storage_method,
      food_temperature: form.food_temperature ? parseFloat(form.food_temperature) : null,
      food_condition: form.food_condition,
      quality_score: quality?.score ?? 0,
      freshness_status: quality?.freshness ?? 'fresh',
      estimated_meals: quality?.estimatedMeals ?? 0,
      recommended_recipient: quality?.recommendedRecipient ?? '',
      priority_level: quality?.priority ?? 'medium',
      address: form.address,
      city: form.city,
      latitude: lat,
      longitude: lng,
      description: form.description,
      contact_phone: form.contact_phone,
      is_urgent: form.is_urgent || quality?.isCloseToExpiry || false,
      image_url: form.image_url || null,
    }).select('id').single();
    setSubmitting(false);
    if (error) {
      toast('Could not submit donation. Please try again.', 'error');
    } else {
      if (inserted?.id) {
        await supabase.from('donation_events').insert({
          donation_id: inserted.id,
          event_type: 'submitted',
          actor_name: profile?.full_name ?? 'Donor',
          actor_role: profile?.role ?? 'donor',
          notes: `${form.food_name} from ${form.organization}`,
        });
        const fullDonation: FoodDonation = {
          id: inserted.id,
          donor_id: user.id,
          donor_name: form.donor_name || profile?.full_name || '',
          organization: form.organization,
          organization_type: form.organization_type,
          food_name: form.food_name,
          category: form.category,
          quantity: form.quantity,
          quantity_unit: form.quantity_unit,
          pickup_time: new Date(form.pickup_time).toISOString(),
          expiry_time: new Date(form.expiry_time).toISOString(),
          preparation_time: form.preparation_time ? new Date(form.preparation_time).toISOString() : null,
          storage_method: form.storage_method,
          food_temperature: form.food_temperature ? parseFloat(form.food_temperature) : null,
          food_condition: form.food_condition,
          quality_score: quality?.score ?? 0,
          freshness_status: quality?.freshness ?? 'fresh',
          estimated_meals: quality?.estimatedMeals ?? 0,
          recommended_recipient: quality?.recommendedRecipient ?? '',
          priority_level: quality?.priority ?? 'medium',
          address: form.address,
          city: form.city,
          latitude: lat,
          longitude: lng,
          description: form.description,
          contact_phone: form.contact_phone,
          is_urgent: form.is_urgent || quality?.isCloseToExpiry || false,
          image_url: form.image_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'available',
          delivery_time: null,
          quality_result: null,
          certificate_id: null,
          qr_verified: false,
          donation_code: null,
          handover_status: 'waiting_volunteer',
          pickup_confirmed_at: null,
        } as FoodDonation;
        await createHandoverForDonation(fullDonation, form.donor_name || profile?.full_name || '');
      }
      setSuccess(true);
      pushToast('Donation Submitted Successfully', 'success');
      pushNotification({
        type: 'new_donation',
        title: 'New Food Donation Listed',
        description: `${form.food_name} from ${form.organization} is now available for pickup.`,
        actionUrl: '/services/available-food',
      });
    }
  };

  if (success) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4 gradient-bg-soft">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/40"
          >
            <CheckCircle2 className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold mb-3">Thank You!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Your donation has been listed. Nearby volunteers will be notified to pick it up soon.</p>
          <div className="flex flex-col gap-3">
            <Link to="/services/available-food"><RippleButton variant="primary" fullWidth>View Available Food</RippleButton></Link>
            <button onClick={() => { setSuccess(false); setForm({ ...form, food_name: '', quantity: '', description: '' }); setMapPoints([]); setCoords(null); }} className="btn-ghost">
              Donate More
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen gradient-bg-soft">
      <PageNav crumbs={[{ label: 'Donate Food', icon: UtensilsCrossed }]} />
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="badge bg-primary-100/80 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 mb-4 border border-primary-200/50 dark:border-primary-800/50">
            <Sparkles className="h-3.5 w-3.5" /> Make a Difference
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold">Donate Surplus Food</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-xl mx-auto">List your surplus food and our volunteer network will redistribute it to those in need.</p>
        </motion.div>

        {!user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 mb-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You need to be logged in to donate. <Link to="/login" className="text-primary-600 font-semibold hover:underline">Login here</Link> or <Link to="/register" className="text-primary-600 font-semibold hover:underline">Register</Link>.
            </p>
          </motion.div>
        )}

        <motion.form
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="glass-card p-6 sm:p-8 space-y-6"
        >
          {/* Donor info */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Your Name *</label>
              <input name="donor_name" value={form.donor_name} onChange={handleChange} className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Contact Phone</label>
              <input name="contact_phone" value={form.contact_phone} onChange={handleChange} className="input-field" placeholder="+91 98765 43210" />
            </div>
          </motion.div>

          {/* Organization */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><Hotel className="h-4 w-4 text-primary-500" /> Organization Name *</label>
              <input name="organization" value={form.organization} onChange={handleChange} className="input-field" placeholder="The Grand Hotel" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Organization Type *</label>
              <select name="organization_type" value={form.organization_type} onChange={handleChange} className="input-field">
                {orgTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </motion.div>

          {/* Food details */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><UtensilsCrossed className="h-4 w-4 text-primary-500" /> Food Name *</label>
              <input name="food_name" value={form.food_name} onChange={handleChange} className="input-field" placeholder="Biryani & Curry" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Food Type / Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                {foodCategories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><Package className="h-4 w-4 text-primary-500" /> Quantity *</label>
              <input name="quantity" value={form.quantity} onChange={handleChange} className="input-field" placeholder="50" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Unit</label>
              <select name="quantity_unit" value={form.quantity_unit} onChange={handleChange} className="input-field">
                <option value="servings">Servings</option>
                <option value="kg">Kilograms</option>
                <option value="packets">Packets</option>
                <option value="boxes">Boxes</option>
                <option value="liters">Liters</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-3">
                <input type="checkbox" name="is_urgent" checked={form.is_urgent} onChange={handleChange} className="h-5 w-5 rounded text-primary-600 focus:ring-primary-500" />
                <span className="text-sm font-medium">Mark as Urgent</span>
              </label>
            </div>
          </motion.div>

          {/* Food Quality Check Section */}
          <motion.div variants={fadeInUp} className="rounded-2xl border-2 border-primary-200 dark:border-primary-800 p-5 bg-primary-50/30 dark:bg-primary-900/10">
            <h3 className="font-display text-lg font-bold mb-1 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary-500" /> Food Quality Check
            </h3>
            <p className="text-xs text-gray-500 mb-4">Enter food details to automatically assess quality and freshness. All calculations update in real-time.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary-500" /> Preparation Date & Time *</label>
                <input type="datetime-local" name="preparation_time" value={form.preparation_time} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><Calendar className="h-4 w-4 text-accent-500" /> Expiry Date & Time *</label>
                <input type="datetime-local" name="expiry_time" value={form.expiry_time} onChange={handleChange} className="input-field" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Storage Method *</label>
                <select name="storage_method" value={form.storage_method} onChange={handleChange} className="input-field">
                  {storageMethods.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><Thermometer className="h-4 w-4 text-accent-500" /> Food Temp (°C, optional)</label>
                <input type="number" name="food_temperature" value={form.food_temperature} onChange={handleChange} className="input-field" placeholder="e.g. 4" step="0.1" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Food Condition *</label>
                <select name="food_condition" value={form.food_condition} onChange={handleChange} className="input-field">
                  {foodConditions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Pickup time */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary-500" /> Pickup Time *</label>
              <input type="datetime-local" name="pickup_time" value={form.pickup_time} onChange={handleChange} className="input-field" required />
            </div>

            {/* Quality Assessment Result */}
            <AnimatePresence>
              {quality && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Freshness Badge + Score */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-400 mb-2">Freshness Status</p>
                      <div className="flex items-center gap-2">
                        {quality.isExpired ? (
                          <span className="badge bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                            <XCircle className="h-4 w-4" /> Expired
                          </span>
                        ) : quality.isCloseToExpiry ? (
                          <span className="badge bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300">
                            <AlertTriangle className="h-4 w-4" /> Consume Soon
                          </span>
                        ) : (
                          <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                            <ShieldCheck className="h-4 w-4" /> Fresh
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{quality.freshnessDescription}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-400 mb-2">Quality Score</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-1">
                            <span className={`font-display text-3xl font-bold ${quality.score >= 80 ? 'text-primary-600' : quality.score >= 60 ? 'text-gold-600' : quality.score >= 40 ? 'text-accent-600' : 'text-red-600'}`}>
                              {quality.score}%
                            </span>
                            <span className="text-xs text-gray-400">
                              {quality.score >= 80 ? 'Excellent' : quality.score >= 60 ? 'Good' : quality.score >= 40 ? 'Fair' : 'Poor'}
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${quality.score}%` }}
                              className={`h-full bg-gradient-to-r ${getScoreGradient(quality.score)} rounded-full`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* High Priority Banner */}
                  {quality.isCloseToExpiry && !quality.isExpired && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-2xl bg-gradient-to-r from-gold-500 to-accent-500 text-white flex items-center gap-3"
                    >
                      <Flame className="h-6 w-6 shrink-0" />
                      <div>
                        <p className="font-bold">High Priority Donation</p>
                        <p className="text-sm opacity-90">This food is close to expiry. Donate quickly to ensure it reaches someone in need.</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Expired Warning */}
                  {quality.isExpired && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 flex items-center gap-3"
                    >
                      <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                      <div>
                        <p className="font-bold text-red-700 dark:text-red-300">Expired — Not Eligible for Donation</p>
                        <p className="text-sm text-red-600 dark:text-red-400">This food has passed its expiry time and cannot be donated. Please adjust the expiry time or dispose of the food safely.</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Safety Tips */}
                  <div className="p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-100 dark:border-secondary-800">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Info className="h-4 w-4 text-secondary-500" /> Food Safety Tips</p>
                    <ul className="space-y-1.5">
                      {quality.safetyTips.map((tip, i) => (
                        <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <ShieldCheck className="h-3.5 w-3.5 text-secondary-500 shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* AI-Inspired Food Recommendations */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-100 dark:border-primary-800">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-primary-500" /> AI-Inspired Food Recommendations
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Estimated Meals */}
                      <div className="p-3 rounded-xl bg-white dark:bg-gray-800/70 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center shrink-0">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Est. Meals</p>
                          <p className="font-display text-lg font-bold">{quality.estimatedMeals}</p>
                        </div>
                      </div>
                      {/* Recommended Recipient */}
                      <div className="p-3 rounded-xl bg-white dark:bg-gray-800/70 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-500 text-white flex items-center justify-center shrink-0">
                          {(() => {
                            const Icon = recipientIcons[quality.recipientIcon] ?? Home;
                            return <Icon className="h-5 w-5" />;
                          })()}
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Recipient</p>
                          <p className="font-semibold text-sm">{quality.recommendedRecipient}</p>
                        </div>
                      </div>
                      {/* Priority Level */}
                      <div className="p-3 rounded-xl bg-white dark:bg-gray-800/70 flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl text-white flex items-center justify-center shrink-0 ${quality.priority === 'high' ? 'bg-gradient-to-br from-red-500 to-red-500' : quality.priority === 'medium' ? 'bg-gradient-to-br from-gold-500 to-yellow-500' : 'bg-gradient-to-br from-primary-500 to-primary-500'}`}>
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Priority</p>
                          <p className="font-semibold text-sm capitalize">{quality.priority}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Location section */}
          <motion.div variants={fadeInUp}>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary-500" /> Location *</label>
            <div className="flex flex-wrap gap-2 mb-3">
              <RippleButton type="button" onClick={useCurrentLocation} variant="secondary" className="text-sm" disabled={locating}>
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
                Use My Current Location
              </RippleButton>
              <RippleButton type="button" onClick={() => { setPickMode((m) => !m); }} variant={pickMode ? 'primary' : 'ghost'} className="text-sm">
                {pickMode ? <Locate className="h-4 w-4" /> : <Hand className="h-4 w-4" />}
                {pickMode ? 'Click on map to pick...' : 'Pick Location on Map'}
              </RippleButton>
            </div>
            {geoError && (
              <div className="mb-3 p-3 rounded-xl bg-gold-50 dark:bg-gold-900/20 text-gold-700 dark:text-gold-300 text-sm flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{geoError}</span>
              </div>
            )}
            {pickMode && (
              <div className="mb-3 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm">
                Click anywhere on the map below to set your donor location.
              </div>
            )}
            <LeafletMap
              points={mapPoints}
              onMapClick={handleMapClick}
              height="h-64"
              fitBounds={false}
              zoom={12}
            />
            {coords && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary-500" />
                Coordinates: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </p>
            )}
          </motion.div>

          {/* Address */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary-500" /> Address *</label>
              <input name="address" value={form.address} onChange={handleChange} className="input-field" placeholder="12 MG Road" required />
              {geocoding && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Looking up address...</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">City</label>
              <input name="city" value={form.city} onChange={handleChange} className="input-field" placeholder="Bangalore" />
            </div>
          </motion.div>

          {/* Description */}
          <motion.div variants={fadeInUp}>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-field resize-none" placeholder="Describe the food items, packaging, etc." />
          </motion.div>

          {/* Image upload */}
          <motion.div variants={fadeInUp}>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><ImageIcon className="h-4 w-4 text-primary-500" /> Food Image</label>
            <label className="block border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all">
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />
                  <p className="text-xs text-gray-400 mt-2">Click to change image</p>
                </div>
              ) : (
                <div>
                  <Upload className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload a photo of the food</p>
                </div>
              )}
            </label>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <RippleButton type="submit" variant="primary" fullWidth disabled={submitting || geocoding || !user || quality?.isExpired}>
              {submitting || geocoding ? <><Loader2 className="h-4 w-4 animate-spin" /> {geocoding ? 'Locating address...' : 'Submitting...'}</> : quality?.isExpired ? 'Expired — Cannot Donate' : 'Submit Donation'}
            </RippleButton>
            {quality?.isExpired && (
              <p className="text-xs text-red-500 text-center mt-2">This food is expired and cannot be submitted for donation.</p>
            )}
          </motion.div>
        </motion.form>
      </section>
    </div>
  );
}
