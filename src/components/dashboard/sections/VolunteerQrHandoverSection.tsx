import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, ScanLine, Loader2, Package, MapPin, Phone, Clock, Calendar,
  ShieldCheck, CheckCircle2, XCircle, Star, Camera, User, FileText, Truck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useNotifications } from '@/context/NotificationContext';
import { RippleButton } from '@/components/ui/RippleButton';
import { DashboardSectionHeader, StatCard } from '@/components/dashboard/DashboardLayout';
import { QrScanner } from '@/components/QrScanner';
import { DonationImage } from '@/components/Illustration';
import {
  verifyQrForHandover, submitQualityReport, confirmPickup, assignVolunteerToHandover,
  QUALITY_CHECKLIST, REJECTION_REASONS, type QualityReportInput,
} from '@/lib/handover';
import type { FoodDonation, DonationHandover, Profile, QrPayload } from '@/types';

type Phase = 'scan' | 'details' | 'inspection' | 'pickup' | 'done';

export function VolunteerQrHandoverSection() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { pushToast, pushNotification } = useNotifications();
  const [showScanner, setShowScanner] = useState(false);
  const [phase, setPhase] = useState<Phase>('scan');
  const [donation, setDonation] = useState<FoodDonation | null>(null);
  const [donor, setDonor] = useState<Profile | null>(null);
  const [handover, setHandover] = useState<DonationHandover | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [scanError, setScanError] = useState('');

  // inspection form
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [rating, setRating] = useState(0);
  const [approval, setApproval] = useState<'approved' | 'rejected'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // available donations (waiting for volunteer)
  const [available, setAvailable] = useState<FoodDonation[]>([]);
  const [loadingAvail, setLoadingAvail] = useState(true);

  const loadAvailable = useCallback(async () => {
    const { data } = await supabase
      .from('food_donations')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });
    setAvailable((data as FoodDonation[]) ?? []);
    setLoadingAvail(false);
  }, []);

  useEffect(() => {
    loadAvailable();
    const ch = supabase.channel('vol-avail').on('postgres_changes', { event: '*', schema: 'public', table: 'food_donations' }, loadAvailable).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadAvailable]);

  const handleScan = useCallback(async (payload: QrPayload) => {
    setShowScanner(false);
    setVerifying(true);
    setScanError('');
    const { data: don } = await supabase.from('food_donations').select('*').eq('id', payload.donationId).maybeSingle();
    if (!don) {
      setScanError('Donation not found in database.');
      setVerifying(false);
      return;
    }
    const { data: ho } = await supabase.from('donation_handovers').select('*').eq('donation_id', payload.donationId).maybeSingle();
    if (!ho) {
      setScanError('No handover record found for this donation.');
      setVerifying(false);
      return;
    }
    const handoverRec = ho as DonationHandover;
    if (handoverRec.pickup_confirmed) {
      setScanError('This QR code has already been used for pickup and is now invalid.');
      setVerifying(false);
      return;
    }
    if (user) {
      await verifyQrForHandover(payload.donationId, user.id);
    }
    const { data: donorData } = await supabase.from('profiles').select('*').eq('id', payload.donorId).maybeSingle();
    setDonation(don as FoodDonation);
    setDonor((donorData as Profile) ?? null);
    setHandover({ ...handoverRec, qr_verified: true, qr_verified_at: new Date().toISOString(), handover_status: 'qr_verified' });
    setPhase('details');
    setVerifying(false);
    pushToast('QR verified successfully', 'success');
  }, [user, pushToast]);

  const handleAccept = async (d: FoodDonation) => {
    if (!user) return;
    await assignVolunteerToHandover(d.id, user.id);
    await supabase.from('pickups').insert({
      donation_id: d.id,
      volunteer_id: user.id,
      status: 'accepted',
      points_earned: d.is_urgent ? 50 : 25,
    });
    await supabase.from('food_donations').update({ status: 'claimed' }).eq('id', d.id);
    toast('Donation accepted! Show this to the donor to get the QR scanned.', 'success');
    loadAvailable();
  };

  const handlePhoto = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${user.id}/handover-${donation?.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('food-photos').upload(path, file, { cacheControl: '3600', upsert: true });
    if (upErr) {
      toast('Photo upload failed', 'error');
      setUploading(false);
      return;
    }
    const { data: pub } = supabase.storage.from('food-photos').getPublicUrl(path);
    setPhotoUrl(pub.publicUrl);
    setUploading(false);
    toast('Photo uploaded', 'success');
  };

  const submitInspection = async () => {
    if (!donation) return;
    if (rating === 0) { toast('Please rate the food quality (1-5 stars)', 'error'); return; }
    if (approval === 'rejected' && !rejectionReason) { toast('Please select a rejection reason', 'error'); return; }
    if (!photoUrl) { toast('Please upload a pickup photo', 'error'); return; }
    const allChecked = QUALITY_CHECKLIST.every((c) => checklist[c.key]);
    if (approval === 'approved' && !allChecked) { toast('Please complete every checklist item', 'error'); return; }
    setSubmitting(true);
    const report: QualityReportInput = {
      checklist,
      freshness: '',
      packaging: '',
      temperature: '',
      rating,
      approval,
      rejectionReason,
      notes,
    };
    const updated = await submitQualityReport(donation.id, report, photoUrl);
    setHandover(updated);
    await supabase.from('donation_events').insert({
      donation_id: donation.id,
      event_type: approval === 'approved' ? 'food_quality_approved' : 'food_quality_rejected',
      actor_name: profile?.full_name ?? 'Volunteer',
      actor_role: 'volunteer',
      notes: approval === 'approved'
        ? `Approved - ${rating}/5 stars. ${notes}`
        : `Rejected - ${REJECTION_REASONS.find((r) => r.value === rejectionReason)?.label ?? rejectionReason}. ${notes}`,
    });
    if (approval === 'approved') {
      setPhase('pickup');
      pushToast('Inspection approved - proceed to pickup', 'success');
    } else {
      pushToast('Inspection submitted - donation rejected', 'error');
      setPhase('done');
    }
    setSubmitting(false);
  };

  const handleConfirmPickup = async () => {
    if (!donation) return;
    setConfirming(true);
    const updated = await confirmPickup(donation.id);
    setHandover(updated);
    await supabase.from('pickups').update({ status: 'in_progress', tracking_status: 'pickup_completed', picked_up_at: new Date().toISOString() }).eq('donation_id', donation.id);
    await supabase.from('donation_events').insert({
      donation_id: donation.id,
      event_type: 'pickup_started',
      actor_name: profile?.full_name ?? 'Volunteer',
      actor_role: 'volunteer',
      notes: 'Pickup confirmed by volunteer. Food collected from donor.',
    });
    pushToast('Pickup confirmed! Food collected successfully.', 'success');
    pushNotification({
      type: 'pickup_confirmed',
      title: 'Pickup Confirmed',
      description: `You picked up ${donation.food_name}. Deliver it to the recipient now.`,
      actionUrl: '/dashboard/volunteer',
    });
    setPhase('done');
    setConfirming(false);
  };

  const reset = () => {
    setPhase('scan');
    setDonation(null);
    setDonor(null);
    setHandover(null);
    setChecklist({});
    setRating(0);
    setApproval('approved');
    setRejectionReason('');
    setNotes('');
    setPhotoUrl('');
    setScanError('');
  };

  return (
    <div>
      <DashboardSectionHeader title="QR Handover" description="Scan the donor's QR code to verify the donation, inspect food quality, and confirm pickup." />

      {/* Available donations */}
      <div className="glass-card p-4 mb-6">
        <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2"><Package className="h-4 w-4 text-primary-500" /> Available Donations</h3>
        {loadingAvail ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
        ) : available.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No donations waiting for a volunteer right now.</p>
        ) : (
          <div className="space-y-2">
            {available.slice(0, 5).map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="h-9 w-9 rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center shrink-0"><Package className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{d.food_name}</p>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1"><MapPin className="h-3 w-3" /> {d.address ?? d.city}</p>
                </div>
                <RippleButton onClick={() => handleAccept(d)} variant="primary" className="text-xs px-3 py-1.5 shrink-0">Accept</RippleButton>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scan button */}
      {phase === 'scan' && (
        <div className="glass-card p-8 text-center">
          {scanError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-xs text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
              <XCircle className="h-4 w-4" /> {scanError}
            </div>
          )}
          <div className="h-16 w-16 rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center mx-auto mb-4">
            <QrCode className="h-8 w-8" />
          </div>
          <h3 className="font-display font-bold mb-1">Scan Donor QR Code</h3>
          <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">When you reach the donor, ask them to show their QR code and scan it here to verify the donation.</p>
          <RippleButton onClick={() => setShowScanner(true)} variant="primary">
            <ScanLine className="h-4 w-4" /> Open Scanner
          </RippleButton>
          {verifying && <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Verifying QR...</div>}
        </div>
      )}

      {/* Details phase */}
      {phase === 'details' && donation && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs"><CheckCircle2 className="h-3 w-3" /> QR Verified</span>
              <span className="text-xs text-gray-400">Donor is Ready to Donate Food</span>
            </div>
            {/* Donor details */}
            <h4 className="font-display font-bold text-sm mb-2 flex items-center gap-2"><User className="h-4 w-4 text-primary-500" /> Donor Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-sm">
              <div><span className="text-xs text-gray-400">Name</span><p className="font-medium">{donor?.full_name ?? donation.donor_name}</p></div>
              <div><span className="text-xs text-gray-400">Phone</span><p className="font-medium flex items-center gap-1"><Phone className="h-3 w-3" /> {donor?.phone ?? donation.contact_phone ?? 'N/A'}</p></div>
              <div className="sm:col-span-2"><span className="text-xs text-gray-400">Address</span><p className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" /> {donation.address ?? ''}{donation.city ? ', ' + donation.city : ''}</p></div>
            </div>
            {/* Food details */}
            <h4 className="font-display font-bold text-sm mb-2 flex items-center gap-2"><Package className="h-4 w-4 text-primary-500" /> Food Details</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 text-sm">
              <div><span className="text-xs text-gray-400">Food Name</span><p className="font-medium">{donation.food_name}</p></div>
              <div><span className="text-xs text-gray-400">Category</span><p className="font-medium capitalize">{donation.category}</p></div>
              <div><span className="text-xs text-gray-400">Quantity</span><p className="font-medium">{donation.quantity} {donation.quantity_unit}</p></div>
              <div><span className="text-xs text-gray-400">Cooked Time</span><p className="font-medium">{donation.preparation_time ? new Date(donation.preparation_time).toLocaleString() : 'N/A'}</p></div>
              <div><span className="text-xs text-gray-400">Expiry Time</span><p className="font-medium">{donation.expiry_time ? new Date(donation.expiry_time).toLocaleString() : 'N/A'}</p></div>
            </div>
            {donation.image_url && <DonationImage src={donation.image_url} alt={donation.food_name} className="h-40 w-full object-cover rounded-xl mb-4" />}
            {/* Donation details */}
            <h4 className="font-display font-bold text-sm mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-primary-500" /> Donation Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div><span className="text-xs text-gray-400">Donation ID</span><p className="font-mono text-xs">{donation.id.slice(0, 8)}</p></div>
              <div><span className="text-xs text-gray-400">Pickup Time</span><p className="font-medium">{new Date(donation.pickup_time).toLocaleString()}</p></div>
              {donation.description && <div className="col-span-2"><span className="text-xs text-gray-400">Special Instructions</span><p className="text-sm">{donation.description}</p></div>}
            </div>
            <RippleButton onClick={() => setPhase('inspection')} variant="primary" fullWidth>
              <ShieldCheck className="h-4 w-4" /> Proceed to Food Quality Inspection
            </RippleButton>
          </div>
        </motion.div>
      )}

      {/* Inspection phase */}
      {phase === 'inspection' && donation && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-5">
          <h3 className="font-display font-bold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary-500" /> Food Quality Inspection</h3>
          {/* Checklist */}
          <div>
            <p className="text-sm font-medium mb-2">Quality Checklist</p>
            <div className="space-y-2">
              {QUALITY_CHECKLIST.map((c) => {
                const checked = !!checklist[c.key];
                return (
                  <button key={c.key} type="button" onClick={() => setChecklist((p) => ({ ...p, [c.key]: !checked }))}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-colors ${checked ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${checked ? 'bg-primary-500 text-white' : 'border-2 border-gray-300 dark:border-gray-600'}`}>
                      {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Photo */}
          <div>
            <p className="text-sm font-medium mb-2">Upload Pickup Photo</p>
            <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-primary-400 transition-colors">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                : photoUrl ? <img src={photoUrl} alt="Pickup" className="h-32 w-full object-cover rounded-lg" />
                : <><Camera className="h-8 w-8 text-gray-400" /><span className="text-xs text-gray-500">Tap to add a photo</span></>}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f); }} />
            </label>
          </div>
          {/* Rating */}
          <div>
            <p className="text-sm font-medium mb-2">Rating</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} className="p-1">
                  <Star className={`h-7 w-7 transition-colors ${n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">{rating > 0 ? `${rating}/5` : 'Tap a star'}</span>
            </div>
          </div>
          {/* Decision */}
          <div>
            <p className="text-sm font-medium mb-2">Decision</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => { setApproval('approved'); setRejectionReason(''); }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${approval === 'approved' ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-green-50'}`}>
                <CheckCircle2 className="h-4 w-4" /> Approved
              </button>
              <button type="button" onClick={() => setApproval('rejected')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${approval === 'rejected' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-red-50'}`}>
                <XCircle className="h-4 w-4" /> Rejected
              </button>
            </div>
          </div>
          {/* Rejection reason */}
          {approval === 'rejected' && (
            <div>
              <p className="text-sm font-medium mb-2">Rejection Reason</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REJECTION_REASONS.map((r) => (
                  <button key={r.value} type="button" onClick={() => setRejectionReason(r.value)}
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm text-left transition-colors ${rejectionReason === r.value ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 ring-2 ring-red-400' : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-red-50'}`}>
                    <div className={`h-4 w-4 rounded-full border-2 shrink-0 ${rejectionReason === r.value ? 'border-red-500 bg-red-500' : 'border-gray-300'}`} />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} className="input-field text-sm resize-none" />
          <RippleButton onClick={submitInspection} variant="primary" fullWidth disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Submit Inspection Report
          </RippleButton>
        </motion.div>
      )}

      {/* Pickup confirmation */}
      {phase === 'pickup' && donation && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 text-center">
          <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="h-7 w-7 text-green-500" />
          </div>
          <h3 className="font-display font-bold mb-1">Food Quality Approved</h3>
          <p className="text-xs text-gray-500 mb-4">Confirm that you have collected the food from the donor.</p>
          <RippleButton onClick={handleConfirmPickup} variant="primary" fullWidth disabled={confirming}>
            {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
            Confirm Pickup
          </RippleButton>
        </motion.div>
      )}

      {/* Done */}
      {phase === 'done' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 text-center">
          <div className={`h-14 w-14 rounded-full ${handover?.handover_status === 'quality_rejected' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'} flex items-center justify-center mx-auto mb-3`}>
            {handover?.handover_status === 'quality_rejected'
              ? <XCircle className="h-7 w-7 text-red-500" />
              : <CheckCircle2 className="h-7 w-7 text-green-500" />}
          </div>
          <h3 className="font-display font-bold mb-1">{handover?.handover_status === 'quality_rejected' ? 'Donation Rejected' : 'Pickup Confirmed'}</h3>
          <p className="text-xs text-gray-500 mb-4">
            {handover?.handover_status === 'quality_rejected'
              ? 'The donation was rejected due to food quality issues.'
              : 'The donor has been notified that their food was collected successfully.'}
          </p>
          <RippleButton onClick={reset} variant="primary">Scan Another Donation</RippleButton>
        </motion.div>
      )}

      <AnimatePresence>
        {showScanner && <QrScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      </AnimatePresence>
    </div>
  );
}
