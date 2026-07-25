import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef, useEffect, useRef, useState } from 'react';
import {
  FileText, ShieldCheck, CheckCircle2, UserCheck, MapPin, PackageCheck, Truck,
  MapPinned, HandHeart, Award, BadgeCheck, ChevronDown, Sparkles, Clock, User, Route, ShieldAlert, type LucideIcon,
} from 'lucide-react';
import type { FoodDonation, Pickup, Certificate, Profile } from '@/types';
import { Confetti } from '@/components/Confetti';
import { supabase } from '@/lib/supabase';
import { haversineKm } from '@/components/LeafletMap';

export type TrackerStepStatus = 'completed' | 'current' | 'pending';

export interface TrackerStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  emoji: string;
  timestamp?: string | null;
  status: TrackerStepStatus;
  details?: {
    label: string;
    value: string;
  }[];
}

interface ResolvedTracker {
  steps: TrackerStep[];
  currentIndex: number;
  progress: number;
  delivered: boolean;
  cancelled: boolean;
}

const STEP_DEFS = [
  { id: 'submitted', title: 'Donation Submitted', description: 'Your donation has been listed on FoodBridge and is awaiting review.', icon: FileText, emoji: '🍱' },
  { id: 'quality', title: 'AI Food Quality Inspection', description: 'Freshness, temperature, and hygiene verified by our quality system.', icon: ShieldCheck, emoji: '🛡' },
  { id: 'approved', title: 'Donation Approved', description: 'Verified and approved for redistribution to those in need.', icon: CheckCircle2, emoji: '✅' },
  { id: 'assigned', title: 'Volunteer Accepted Request', description: 'A volunteer has accepted the pickup and is on the way.', icon: UserCheck, emoji: '🙋' },
  { id: 'reached_pickup', title: 'Volunteer Reached Pickup Location', description: 'The volunteer has arrived at the pickup address.', icon: MapPin, emoji: '📍' },
  { id: 'picked_up', title: 'Food Collected', description: 'The food has been collected from the donor.', icon: PackageCheck, emoji: '📦' },
  { id: 'on_the_way', title: 'Delivery In Progress', description: 'The volunteer is en route to the recipient location.', icon: Truck, emoji: '🚚' },
  { id: 'reached_dest', title: 'Reached Destination', description: 'The volunteer has arrived at the delivery location.', icon: MapPinned, emoji: '📍' },
  { id: 'delivered', title: 'Food Successfully Delivered', description: 'The recipient has received the food. Thank you for your contribution!', icon: HandHeart, emoji: '❤' },
  { id: 'certificate', title: 'Digital Certificate Generated', description: 'A volunteer appreciation certificate has been issued.', icon: Award, emoji: '🏆' },
  { id: 'verified', title: 'QR Certificate Verified', description: 'The certificate has been verified and is now valid.', icon: BadgeCheck, emoji: '✅' },
] as const;

function fmt(date?: string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

function buildDetails(
  defId: string,
  donation: FoodDonation,
  pickup?: Pickup | null,
  certificate?: Certificate | null,
): { label: string; value: string }[] {
  const details: { label: string; value: string }[] = [];
  switch (defId) {
    case 'submitted':
      details.push({ label: 'Food', value: donation.food_name });
      details.push({ label: 'Quantity', value: `${donation.quantity} ${donation.quantity_unit}` });
      details.push({ label: 'Category', value: donation.category });
      if (donation.organization) details.push({ label: 'Organization', value: donation.organization });
      break;
    case 'quality':
      if (donation.quality_score != null) details.push({ label: 'Quality Score', value: `${donation.quality_score}/100` });
      if (donation.freshness_status) details.push({ label: 'Freshness', value: donation.freshness_status.replace('_', ' ') });
      if (donation.food_condition) details.push({ label: 'Condition', value: donation.food_condition });
      if (donation.food_temperature != null) details.push({ label: 'Temperature', value: `${donation.food_temperature}°C` });
      break;
    case 'approved':
      if (donation.estimated_meals != null) details.push({ label: 'Estimated Meals', value: String(donation.estimated_meals) });
      if (donation.recommended_recipient) details.push({ label: 'Recommended Recipient', value: donation.recommended_recipient });
      if (donation.priority_level) details.push({ label: 'Priority', value: donation.priority_level });
      break;
    case 'assigned':
      if (pickup?.volunteer_id) details.push({ label: 'Volunteer ID', value: pickup.volunteer_id.slice(0, 8) });
      if (pickup?.recipient_name) details.push({ label: 'Recipient', value: pickup.recipient_name });
      break;
    case 'reached_pickup':
      if (donation.address) details.push({ label: 'Pickup Address', value: `${donation.address}, ${donation.city ?? ''}` });
      if (donation.contact_phone) details.push({ label: 'Contact', value: donation.contact_phone });
      break;
    case 'picked_up':
      if (pickup?.picked_up_at) details.push({ label: 'Collected At', value: fmt(pickup.picked_up_at) ?? '-' });
      if (pickup?.delivery_notes) details.push({ label: 'Notes', value: pickup.delivery_notes });
      break;
    case 'on_the_way':
      if (pickup?.recipient_name) details.push({ label: 'Recipient', value: pickup.recipient_name });
      if (pickup?.recipient_org) details.push({ label: 'Recipient Org', value: pickup.recipient_org });
      break;
    case 'reached_dest':
      if (pickup?.recipient_name) details.push({ label: 'Recipient', value: pickup.recipient_name });
      if (pickup?.recipient_org) details.push({ label: 'Organization', value: pickup.recipient_org });
      break;
    case 'delivered':
      if (pickup?.delivered_at) details.push({ label: 'Delivered At', value: fmt(pickup.delivered_at) ?? '-' });
      if (pickup?.recipient_name) details.push({ label: 'Received By', value: pickup.recipient_name });
      if (pickup?.delivery_notes) details.push({ label: 'Notes', value: pickup.delivery_notes });
      break;
    case 'certificate':
      if (certificate?.certificate_number) details.push({ label: 'Certificate #', value: certificate.certificate_number });
      if (certificate?.volunteer_name) details.push({ label: 'Volunteer', value: certificate.volunteer_name });
      if (certificate?.total_meals) details.push({ label: 'Total Meals', value: String(certificate.total_meals) });
      break;
    case 'verified':
      if (certificate?.unique_id) details.push({ label: 'Certificate ID', value: certificate.unique_id });
      if (certificate?.is_valid != null) details.push({ label: 'Status', value: certificate.is_valid ? 'Verified & Valid' : 'Pending' });
      break;
  }
  return details;
}

export function resolveTracker(
  donation: FoodDonation,
  pickup?: Pickup | null,
  certificate?: Certificate | null,
): ResolvedTracker {
  const cancelled = donation.status === 'cancelled' || donation.status === 'expired';
  const isDelivered = donation.status === 'delivered' || pickup?.status === 'delivered';
  const isReachedDest = isDelivered;
  const isOnTheWay = pickup?.status === 'in_progress' || isReachedDest;
  const isPickedUp = !!pickup?.picked_up_at || isOnTheWay;
  const isReachedPickup = isPickedUp;
  const isAssigned = !!pickup || donation.status === 'claimed';
  const isApproved = donation.quality_score != null && !cancelled;
  const isQualityDone = donation.quality_score != null;
  const hasCert = !!certificate;
  const certVerified = !!certificate?.is_valid;

  const timestamps: (string | null)[] = [
    donation.created_at,
    donation.updated_at,
    isApproved ? donation.updated_at : null,
    pickup?.accepted_at ?? (isAssigned ? donation.updated_at : null),
    isReachedPickup ? (pickup?.accepted_at ?? donation.updated_at) : null,
    pickup?.picked_up_at ?? (isPickedUp ? donation.updated_at : null),
    isOnTheWay ? (pickup?.picked_up_at ?? donation.updated_at) : null,
    isReachedDest ? (pickup?.delivered_at ?? donation.updated_at) : null,
    pickup?.delivered_at ?? (isDelivered ? donation.updated_at : null),
    certificate?.issue_date ?? (hasCert ? donation.updated_at : null),
    certVerified ? certificate?.issue_date ?? null : null,
  ];

  const flags = [
    true,
    isQualityDone,
    isApproved,
    isAssigned,
    isReachedPickup,
    isPickedUp,
    isOnTheWay,
    isReachedDest,
    isDelivered,
    hasCert,
    certVerified,
  ];

  let currentIndex = 0;
  for (let i = 0; i < flags.length; i++) {
    if (flags[i]) currentIndex = i;
    else break;
  }
  if (cancelled) currentIndex = Math.min(currentIndex, 1);

  const steps: TrackerStep[] = STEP_DEFS.map((def, i) => {
    let status: TrackerStepStatus = 'pending';
    if (i < currentIndex) status = 'completed';
    else if (i === currentIndex && !cancelled) status = 'current';
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      emoji: def.emoji,
      timestamp: fmt(timestamps[i]),
      status,
      details: buildDetails(def.id, donation, pickup, certificate),
    };
  });

  if (cancelled) {
    steps[Math.min(currentIndex, steps.length - 1)].status = 'current';
  }

  const progress = Math.round((currentIndex / (STEP_DEFS.length - 1)) * 100);

  return {
    steps,
    currentIndex,
    progress,
    delivered: isDelivered,
    cancelled,
  };
}

interface DonationStatusTrackerProps {
  donation: FoodDonation;
  pickup?: Pickup | null;
  certificate?: Certificate | null;
  compact?: boolean;
}

export function DonationStatusTracker({ donation, pickup, certificate, compact = false }: DonationStatusTrackerProps) {
  const { steps, currentIndex, progress, delivered, cancelled } = resolveTracker(donation, pickup, certificate);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [volunteerName, setVolunteerName] = useState<string | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [etaMin, setEtaMin] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const hasCelebrated = useRef(false);

  // Auto-scroll to current step
  useEffect(() => {
    const target = stepRefs.current[currentIndex];
    if (target && containerRef.current) {
      const container = containerRef.current;
      const targetRect = target.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const offset = targetRect.top - containerRect.top - containerRect.height / 2 + targetRect.height / 2;
      container.scrollTo({ top: container.scrollTop + offset, behavior: 'smooth' });
    }
  }, [currentIndex]);

  // Trigger confetti when delivery completes
  useEffect(() => {
    if (delivered && !hasCelebrated.current) {
      hasCelebrated.current = true;
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(t);
    }
  }, [delivered]);

  // Fetch volunteer name and compute distance/ETA
  useEffect(() => {
    let active = true;
    if (pickup?.volunteer_id) {
      supabase.from('profiles').select('full_name').eq('id', pickup.volunteer_id).maybeSingle()
        .then(({ data }) => {
          if (active && data) setVolunteerName((data as Pick<Profile, 'full_name'>).full_name);
        });
    }
    if (donation.latitude != null && donation.longitude != null) {
      const dest: [number, number] = [donation.latitude, donation.longitude];
      if (pickup?.donation?.latitude != null && pickup?.donation?.longitude != null) {
        const d = haversineKm([pickup.donation.latitude, pickup.donation.longitude], dest);
        if (active) {
          setDistanceKm(Math.round(d * 10) / 10);
          setEtaMin(Math.max(5, Math.round(d * 3.5)));
        }
      } else {
        const d = haversineKm([donation.latitude, donation.longitude], dest);
        if (active) {
          setDistanceKm(Math.round(d * 10) / 10);
          setEtaMin(Math.max(5, Math.round(d * 3.5)));
        }
      }
    }
    return () => { active = false; };
  }, [pickup, donation]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="relative">
      <Confetti trigger={showConfetti} />

      {/* Progress header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <div className="relative h-12 w-12">
            <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-linen dark:text-secondary-800" />
              <motion.circle
                cx="22" cy="22" r="18" fill="none" stroke="url(#progressGradient)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={113.1}
                initial={{ strokeDashoffset: 113.1 }}
                animate={{ strokeDashoffset: 113.1 - (113.1 * progress) / 100 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1B4332" />
                  <stop offset="100%" stopColor="#8B5E3C" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-xs font-bold text-ink dark:text-cream">
              {progress}%
            </span>
          </div>
          <div>
            <p className="font-display text-sm font-bold text-ink dark:text-cream">Donation Journey</p>
            <p className="text-xs text-ink-soft dark:text-cream/50">
              {cancelled ? 'This donation was cancelled' : delivered ? 'Delivery complete' : `${progress}% complete`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800/40">
          <span className="relative flex h-2 w-2">
            {delivered ? (
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary-500" />
            ) : (
              <>
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
              </>
            )}
          </span>
          <span className="text-xs font-medium text-accent-700 dark:text-accent-300">
            {cancelled ? 'Cancelled' : delivered ? 'Completed' : 'Live'}
          </span>
        </div>
      </div>

      {/* Success message */}
      <AnimatePresence>
        {delivered && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="mb-5 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-500 p-4 shadow-lg shadow-primary-600/30"
          >
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-8 h-16 w-16 rounded-full bg-white/10" />
            <div className="relative flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
              >
                <CheckCircle2 className="h-6 w-6 text-white" strokeWidth={2.5} />
              </motion.div>
              <div>
                <p className="font-display text-sm font-bold text-white">This meal has successfully reached a family in need.</p>
                <p className="text-xs text-white/80 mt-0.5">Thank you for making a difference in your community.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline container */}
      <div ref={containerRef} className={`relative ${compact ? 'max-h-[420px]' : 'max-h-[560px]'} overflow-y-auto pr-2 -mr-2 scroll-smooth`}>
        <div className="relative">
          {/* Curved connecting path SVG */}
          <svg
            className="absolute left-5 top-4 bottom-4 w-3 -z-0 pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 12 100"
          >
            <path d="M 6 0 Q 0 25 6 50 Q 12 75 6 100" fill="none" stroke="currentColor" strokeWidth="2" className="text-linen dark:text-secondary-800" strokeDasharray="3 3" />
            <motion.path
              d="M 6 0 Q 0 25 6 50 Q 12 75 6 100"
              fill="none"
              stroke="url(#pathGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              pathLength={1}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress / 100 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1B4332" />
                <stop offset="100%" stopColor="#8B5E3C" />
              </linearGradient>
            </defs>
          </svg>

          <ol className="space-y-3">
            {steps.map((step, i) => (
              <StepCard
                key={step.id}
                step={step}
                index={i}
                isExpanded={expandedId === step.id}
                onToggle={() => toggleExpand(step.id)}
                ref={(el) => { stepRefs.current[i] = el; }}
                compact={compact}
                cancelled={cancelled && i === currentIndex}
              />
            ))}
          </ol>
        </div>
      </div>

      {/* Summary info panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3"
      >
        <SummaryTile icon={Clock} label="Estimated Delivery" value={delivered ? 'Delivered' : cancelled ? '-' : etaMin != null ? `${etaMin} mins` : '—'} accent="accent" />
        <SummaryTile icon={User} label="Volunteer" value={volunteerName ?? (pickup?.volunteer_id ? 'Assigned' : 'Pending')} accent="primary" />
        <SummaryTile icon={Route} label="Distance" value={distanceKm != null ? `${distanceKm} km` : '—'} accent="primary" />
        <SummaryTile icon={HandHeart} label="Meal Status" value={donation.freshness_status ? donation.freshness_status.replace('_', ' ') : 'Fresh & Safe'} accent="primary" />
        <SummaryTile icon={ShieldAlert} label="Quality Score" value={donation.quality_score != null ? `${donation.quality_score}/100` : 'Pending'} accent="accent" />
        <SummaryTile icon={PackageCheck} label="Quantity" value={`${donation.quantity} ${donation.quantity_unit}`} accent="primary" />
      </motion.div>
    </div>
  );
}

function SummaryTile({ icon: Icon, label, value, accent }: { icon: LucideIcon; label: string; value: string; accent: 'primary' | 'accent' }) {
  const iconBg = accent === 'primary' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300' : 'bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-300';
  return (
    <div className="glass-card p-3 flex items-center gap-3">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-ink-soft/60 dark:text-cream/40">{label}</p>
        <p className="text-sm font-semibold text-ink dark:text-cream capitalize truncate">{value}</p>
      </div>
    </div>
  );
}

interface StepCardProps {
  step: TrackerStep;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  compact: boolean;
  cancelled: boolean;
}

const StepCard = forwardRef<HTMLLIElement, StepCardProps>(function StepCard({
  step, index, isExpanded, onToggle, compact, cancelled,
}, _ref) {
    const Icon = step.icon;
    const isCompleted = step.status === 'completed';
    const isCurrent = step.status === 'current';

    const nodeClasses = isCompleted
      ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-600/40'
      : isCurrent
        ? cancelled
          ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-600/40'
          : 'bg-gradient-to-br from-accent-400 to-accent-500 text-white shadow-lg shadow-accent-500/40'
        : 'bg-oat dark:bg-secondary-800 text-ink-soft/50 dark:text-cream/30 border border-linen dark:border-secondary-700';

    const cardClasses = isCompleted
      ? 'glass-card border-primary-200/60 dark:border-primary-900/40'
      : isCurrent
        ? cancelled
          ? 'glass-card border-red-200/60 dark:border-red-900/40'
          : 'glass-card border-accent-300/70 dark:border-accent-800/50 ring-2 ring-accent-400/30'
        : 'bg-oat/40 dark:bg-secondary-900/30 border-linen dark:border-secondary-800';

    const titleClasses = isCompleted
      ? 'text-ink dark:text-cream'
      : isCurrent
        ? cancelled ? 'text-red-600 dark:text-red-400' : 'text-accent-600 dark:text-accent-400'
        : 'text-ink-soft/60 dark:text-cream/40';

    return (
      <motion.li
        ref={_ref}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: Math.min(index * 0.06, 0.5), duration: 0.4, ease: 'easeOut' }}
        className="relative pl-14"
      >
        {/* Node */}
        <div className="absolute left-0 top-3 z-10">
          <motion.div
            initial={false}
            animate={isCurrent && !cancelled ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={isCurrent && !cancelled ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
            className={`relative flex items-center justify-center rounded-full ${compact ? 'h-9 w-9' : 'h-10 w-10'} ${nodeClasses}`}
          >
            <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} strokeWidth={2} />
            {isCurrent && !cancelled && (
              <motion.span
                className="absolute inset-0 rounded-full bg-accent-400"
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: 0, scale: 2 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
            {isCompleted && (
              <motion.span
                className="absolute inset-0 rounded-full bg-primary-400 opacity-40 blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </motion.div>
        </div>

        {/* Card */}
        <motion.button
          onClick={onToggle}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`w-full text-left rounded-2xl border p-4 transition-colors ${cardClasses}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base leading-none">{step.emoji}</span>
                <h4 className={`font-display ${compact ? 'text-sm' : 'text-base'} font-semibold ${titleClasses}`}>
                  {step.title}
                </h4>
                {isCompleted && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px] font-medium">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Done
                  </span>
                )}
                {isCurrent && (
                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${cancelled ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'}`}>
                    {cancelled ? 'Cancelled' : 'In Progress'}
                  </span>
                )}
              </div>
              {(isCurrent || isCompleted) && (
                <p className={`text-xs text-ink-soft dark:text-cream/50 mt-1 ${compact ? 'leading-snug' : 'leading-relaxed'}`}>
                  {step.description}
                </p>
              )}
            </div>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown className="h-4 w-4 text-ink-soft/40 dark:text-cream/30 shrink-0" />
            </motion.div>
          </div>

          {/* Timestamp */}
          {step.timestamp && (isCompleted || isCurrent) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-xs text-ink-soft/70 dark:text-cream/40 mt-2 flex items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
              {step.timestamp}
            </motion.p>
          )}

          {/* Expandable details */}
          <AnimatePresence>
            {isExpanded && step.details && step.details.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-linen dark:border-secondary-800 grid grid-cols-2 gap-2">
                  {step.details.map((d) => (
                    <div key={d.label} className="text-xs">
                      <p className="text-ink-soft/60 dark:text-cream/40">{d.label}</p>
                      <p className="font-medium text-ink dark:text-cream capitalize">{d.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {isExpanded && (!step.details || step.details.length === 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="text-xs text-ink-soft/50 dark:text-cream/30 mt-3 pt-3 border-t border-linen dark:border-secondary-800 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> No additional details yet for this step.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
    </motion.li>
  );
});
