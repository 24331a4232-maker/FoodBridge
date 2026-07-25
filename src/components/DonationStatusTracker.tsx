import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, ShieldCheck, CheckCircle2, UserCheck, PackageCheck, Truck,
  HandHeart, Award, BadgeCheck, type LucideIcon,
} from 'lucide-react';
import type { FoodDonation, Pickup, Certificate } from '@/types';

export type TrackerStepStatus = 'completed' | 'current' | 'pending';

export interface TrackerStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  timestamp?: string | null;
  status: TrackerStepStatus;
}

interface ResolvedTracker {
  steps: TrackerStep[];
  currentIndex: number;
}

const STEP_DEFS = [
  { id: 'submitted', title: 'Donation Submitted', description: 'Your donation has been listed on FoodBridge.', icon: FileText },
  { id: 'quality', title: 'Food Quality Verification', description: 'Freshness, temperature, and hygiene checked.', icon: ShieldCheck },
  { id: 'approved', title: 'Donation Approved', description: 'Verified and approved for redistribution.', icon: CheckCircle2 },
  { id: 'assigned', title: 'Volunteer Assigned', description: 'A volunteer has accepted the pickup.', icon: UserCheck },
  { id: 'picked_up', title: 'Pickup Completed', description: 'Volunteer has collected the food.', icon: PackageCheck },
  { id: 'on_the_way', title: 'On the Way', description: 'Food is en route to the recipient.', icon: Truck },
  { id: 'delivered', title: 'Food Delivered', description: 'The recipient has received the food.', icon: HandHeart },
  { id: 'certificate', title: 'Certificate Generated', description: 'A volunteer appreciation certificate is ready.', icon: Award },
  { id: 'verified', title: 'Certificate Verified', description: 'The certificate is verified and valid.', icon: BadgeCheck },
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

export function resolveTracker(
  donation: FoodDonation,
  pickup?: Pickup | null,
  certificate?: Certificate | null,
): ResolvedTracker {
  const cancelled = donation.status === 'cancelled' || donation.status === 'expired';
  const isDelivered = donation.status === 'delivered' || pickup?.status === 'delivered';
  const isPickedUp = !!pickup?.picked_up_at || pickup?.status === 'in_progress' || isDelivered;
  const isOnTheWay = pickup?.status === 'in_progress' || isDelivered;
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
    pickup?.picked_up_at ?? (isPickedUp ? donation.updated_at : null),
    isOnTheWay ? (pickup?.picked_up_at ?? donation.updated_at) : null,
    pickup?.delivered_at ?? (isDelivered ? donation.updated_at : null),
    certificate?.issue_date ?? (hasCert ? donation.updated_at : null),
    certVerified ? certificate?.issue_date ?? null : null,
  ];

  const flags = [
    true,
    isQualityDone,
    isApproved,
    isAssigned,
    isPickedUp,
    isOnTheWay,
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
    else if (i < currentIndex) status = 'completed';
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      timestamp: fmt(timestamps[i]),
      status,
    };
  });

  if (cancelled) {
    steps[Math.min(currentIndex, steps.length - 1)].status = 'current';
  }

  return { steps, currentIndex };
}

interface DonationStatusTrackerProps {
  donation: FoodDonation;
  pickup?: Pickup | null;
  certificate?: Certificate | null;
  compact?: boolean;
}

export function DonationStatusTracker({ donation, pickup, certificate, compact = false }: DonationStatusTrackerProps) {
  const { steps, currentIndex } = resolveTracker(donation, pickup, certificate);
  const cancelled = donation.status === 'cancelled' || donation.status === 'expired';

  return (
    <div className={`relative ${compact ? 'pl-8' : 'pl-10'}`}>
      {/* Vertical line */}
      <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-linen dark:bg-secondary-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary-500 to-primary-400"
        />
      </div>

      <ol className="space-y-5">
        {steps.map((step, i) => (
          <StepItem key={step.id} step={step} index={i} compact={compact} cancelled={cancelled && i === currentIndex} />
        ))}
      </ol>
    </div>
  );
}

function StepItem({ step, index, compact, cancelled }: { step: TrackerStep; index: number; compact: boolean; cancelled: boolean }) {
  const Icon = step.icon;
  const isCompleted = step.status === 'completed';
  const isCurrent = step.status === 'current';

  const nodeClasses = isCompleted
    ? 'bg-primary-600 text-cream ring-primary-100 dark:ring-primary-900'
    : isCurrent
      ? cancelled
        ? 'bg-red-500 text-cream ring-red-100 dark:ring-red-900'
        : 'bg-accent-500 text-cream ring-accent-100 dark:ring-accent-900'
      : 'bg-oat dark:bg-secondary-800 text-ink-soft dark:text-cream/40 ring-linen dark:ring-secondary-700';

  const titleClasses = isCompleted
    ? 'text-ink dark:text-cream'
    : isCurrent
      ? cancelled ? 'text-red-600 dark:text-red-400' : 'text-accent-600 dark:text-accent-400'
      : 'text-ink-soft dark:text-cream/40';

  return (
    <motion.li
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      className="relative"
    >
      {/* Node */}
      <div className="absolute -left-10 top-0">
        <motion.div
          initial={false}
          animate={isCurrent ? { scale: [1, 1.12, 1] } : { scale: 1 }}
          transition={isCurrent ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
          className={`relative flex items-center justify-center rounded-full ${compact ? 'h-7 w-7' : 'h-8 w-8'} ring-4 ${nodeClasses} shadow-soft`}
        >
          <Icon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={2} />
          {isCurrent && !cancelled && (
            <motion.span
              className="absolute inset-0 rounded-full bg-accent-400"
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 1.8 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </motion.div>
      </div>

      {/* Content */}
      <div className="pt-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className={`font-display ${compact ? 'text-sm' : 'text-base'} font-semibold ${titleClasses}`}>
            {step.title}
          </h4>
          {isCompleted && (
            <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px]">
              Done
            </span>
          )}
          {isCurrent && (
            <span className={`badge text-[10px] ${cancelled ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'}`}>
              {cancelled ? 'Cancelled' : 'In Progress'}
            </span>
          )}
        </div>

        <AnimatePresence>
          {(isCurrent || isCompleted) && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`text-sm text-ink-soft dark:text-cream/50 mt-1 ${compact ? 'leading-snug' : 'leading-relaxed'}`}
            >
              {step.description}
            </motion.p>
          )}
        </AnimatePresence>

        {step.timestamp && (isCompleted || isCurrent) && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs text-ink-soft/70 dark:text-cream/40 mt-1.5 flex items-center gap-1.5"
          >
            <span className="h-1 w-1 rounded-full bg-current opacity-40" />
            {step.timestamp}
          </motion.p>
        )}
      </div>
    </motion.li>
  );
}
