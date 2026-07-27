import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import {
  ArrowLeft, Download, Share2, ShieldCheck, Loader2, UserCircle, MapPin, Award,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Profile } from '@/types';

export function DonorQrPage() {
  const { username } = useParams<{ username: string }>();
  const { profile: me } = useAuth();
  const { showToast } = useToast();
  const [donor, setDonor] = useState<Profile | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ donations: 0, meals: 0, deliveries: 0 });

  useEffect(() => {
    if (!username) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      if (!data) {
        setLoading(false);
        return;
      }
      setDonor(data as Profile);

      const donorUrl = `${window.location.origin}/donor/${username}`;
      try {
        const qr = await QRCode.toDataURL(donorUrl, {
          width: 480,
          margin: 2,
          color: { dark: '#1B4332', light: '#ffffff' },
          errorCorrectionLevel: 'H',
        });
        setQrDataUrl(qr);
      } catch {
        setQrDataUrl('');
      }

      const { count: donations } = await supabase
        .from('food_donations')
        .select('*', { count: 'exact', head: true })
        .eq('donor_id', data.id);
      const { count: delivered } = await supabase
        .from('food_donations')
        .select('*', { count: 'exact', head: true })
        .eq('donor_id', data.id)
        .eq('status', 'delivered');
      setStats({
        donations: donations ?? 0,
        meals: (delivered ?? 0) * 25,
        deliveries: delivered ?? 0,
      });

      setLoading(false);
    })();
  }, [username]);

  const downloadQr = () => {
    if (!qrDataUrl || !donor) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `FoodBridge-QR-${donor.username}.png`;
    a.click();
    showToast('QR code downloaded', 'success');
  };

  const shareQr = async () => {
    if (!donor) return;
    const url = `${window.location.origin}/donor/${donor.username}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${donor.full_name}'s FoodBridge QR`, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard', 'success');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <UserCircle className="h-16 w-16 text-ink-soft/40 dark:text-cream/30 mb-4" />
        <h1 className="text-2xl font-display font-bold mb-2">Donor not found</h1>
        <p className="text-ink-soft dark:text-cream/60 mb-6">We couldn't find a donor with that username.</p>
        <Link to="/" className="px-5 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition">
          Back home
        </Link>
      </div>
    );
  }

  const isOwner = me?.id === donor.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-cream to-primary-50/30 dark:from-secondary-950 dark:via-secondary-950 dark:to-primary-950/20 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Link to="/dashboard/donor" className="inline-flex items-center gap-1.5 text-sm text-ink-soft dark:text-cream/60 hover:text-primary-600 transition mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-6 sm:p-10 text-center"
        >
          {/* Donor identity */}
          <div className="flex flex-col items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-2xl font-bold mb-3 shadow-lg">
              {donor.full_name?.[0]?.toUpperCase() ?? 'D'}
            </div>
            <h1 className="text-2xl font-display font-bold">{donor.full_name}</h1>
            <p className="text-sm text-ink-soft dark:text-cream/60">@{donor.username}</p>
            {donor.organization && (
              <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-1">{donor.organization}</p>
            )}
            {donor.is_verified && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                <ShieldCheck className="h-3 w-3" /> Verified Donor
              </span>
            )}
          </div>

          {/* QR code */}
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-3 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-3xl blur-xl" />
            <div className="relative bg-white p-4 rounded-2xl shadow-xl ring-1 ring-black/5">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`QR code for ${donor.full_name}`} className="w-56 h-56 sm:w-64 sm:h-64" />
              ) : (
                <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-ink-soft/60 dark:text-cream/40" />
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-ink-soft dark:text-cream/60 mb-1 max-w-sm mx-auto">
            {isOwner
              ? 'Show this code to a volunteer when they arrive for pickup — they scan it to confirm your identity.'
              : 'Scan this code with your phone camera to view this donor on FoodBridge.'}
          </p>
          <p className="text-xs text-ink-soft/60 dark:text-cream/40 mb-6 font-mono break-all">{`${window.location.origin}/donor/${donor.username}`}</p>

          {/* Actions */}
          {isOwner && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={downloadQr}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition shadow-sm"
              >
                <Download className="h-4 w-4" /> Download
              </button>
              <button
                onClick={shareQr}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass font-medium text-sm hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-linen/60 dark:border-secondary-800/60">
            <div>
              <p className="text-2xl font-display font-bold text-primary-600 dark:text-primary-400">{stats.donations}</p>
              <p className="text-xs text-ink-soft dark:text-cream/60 mt-0.5">Donations</p>
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-accent-600 dark:text-accent-400">{stats.meals}</p>
              <p className="text-xs text-ink-soft dark:text-cream/60 mt-0.5">Meals Saved</p>
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-blue-600 dark:text-blue-400">{stats.deliveries}</p>
              <p className="text-xs text-ink-soft dark:text-cream/60 mt-0.5">Delivered</p>
            </div>
          </div>
        </motion.div>

        {/* Info strip for volunteers */}
        {!isOwner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 glass-card p-4 flex items-start gap-3"
          >
            <MapPin className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
            <p className="text-sm text-ink-soft dark:text-cream/70">
              You're viewing a FoodBridge donor's public QR page. If you're a volunteer on pickup duty, confirm this donor's identity before collecting the food.
            </p>
          </motion.div>
        )}

        {isOwner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 glass-card p-4 flex items-start gap-3"
          >
            <Award className="h-5 w-5 text-accent-500 shrink-0 mt-0.5" />
            <p className="text-sm text-ink-soft dark:text-cream/70">
              Keep this code handy. Each donation you create is linked to your account — a volunteer scanning this code instantly sees your verified donor profile.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
