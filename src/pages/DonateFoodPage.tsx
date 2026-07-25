import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Upload, MapPin, UtensilsCrossed, Hotel, Calendar, Package, CheckCircle2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { OrganizationType, FoodCategory } from '@/types';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { RippleButton } from '@/components/ui/RippleButton';
import { Link } from 'react-router-dom';

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

export function DonateFoodPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
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
    address: '',
    city: '',
    description: '',
    contact_phone: '',
    is_urgent: false,
    image_url: '',
  });

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
    setSubmitting(true);
    const { error } = await supabase.from('food_donations').insert({
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
      address: form.address,
      city: form.city,
      description: form.description,
      contact_phone: form.contact_phone,
      is_urgent: form.is_urgent,
      image_url: form.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    });
    setSubmitting(false);
    if (error) {
      toast('Could not submit donation. Please try again.', 'error');
    } else {
      setSuccess(true);
      toast('Donation listed successfully! Volunteers will be notified.', 'success');
    }
  };

  if (success) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4 gradient-bg">
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
            <Link to="/available-food"><RippleButton variant="primary" fullWidth>View Available Food</RippleButton></Link>
            <button onClick={() => { setSuccess(false); setForm({ ...form, food_name: '', quantity: '', description: '' }); }} className="btn-ghost">
              Donate More
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen gradient-bg">
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="badge bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 mb-4">
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
              <label className="block text-sm font-medium mb-1.5">Category *</label>
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

          {/* Times */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary-500" /> Pickup Time *</label>
              <input type="datetime-local" name="pickup_time" value={form.pickup_time} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><Calendar className="h-4 w-4 text-accent-500" /> Expiry Time *</label>
              <input type="datetime-local" name="expiry_time" value={form.expiry_time} onChange={handleChange} className="input-field" required />
            </div>
          </motion.div>

          {/* Address */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary-500" /> Address *</label>
              <input name="address" value={form.address} onChange={handleChange} className="input-field" placeholder="12 MG Road" required />
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

          {/* Map placeholder */}
          <motion.div variants={fadeInUp}>
            <label className="block text-sm font-medium mb-1.5">Location Preview</label>
            <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 h-48 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-gray-800 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-grid-pattern opacity-50" />
              <div className="relative text-center">
                <MapPin className="h-8 w-8 text-primary-500 mx-auto mb-2 animate-bounce" />
                <p className="text-sm text-gray-500">Map preview - enter address to set location</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <RippleButton type="submit" variant="primary" fullWidth disabled={submitting || !user}>
              {submitting ? 'Submitting...' : 'Submit Donation'}
            </RippleButton>
          </motion.div>
        </motion.form>
      </section>
    </div>
  );
}
