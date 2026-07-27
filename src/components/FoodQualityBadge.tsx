import { ShieldCheck, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import type { FreshnessStatus, PriorityLevel } from '@/types';
import { getFreshnessColor, getFreshnessDot, getScoreColor } from '@/lib/foodQuality';

interface FoodQualityBadgeProps {
  freshness: FreshnessStatus | null | undefined;
  score?: number | null;
  priority?: PriorityLevel | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  showPriority?: boolean;
  className?: string;
}

export function FoodQualityBadge({
  freshness,
  score,
  priority,
  size = 'sm',
  showScore = false,
  showPriority = false,
  className = '',
}: FoodQualityBadgeProps) {
  if (!freshness) return null;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1',
    lg: 'text-sm px-3 py-1.5 gap-1.5',
  };

  const iconSize = size === 'sm' ? 'h-2.5 w-2.5' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4';

  const Icon = freshness === 'fresh' ? ShieldCheck : freshness === 'consume_soon' ? AlertTriangle : XCircle;
  const colorClass = getFreshnessColor(freshness);
  const dotClass = getFreshnessDot(freshness);

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className={`badge ${colorClass} ${sizeClasses[size]} inline-flex items-center`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
        <Icon className={iconSize} />
        {freshness === 'fresh' ? 'Fresh' : freshness === 'consume_soon' ? 'Consume Soon' : 'Expired'}
      </span>
      {showScore && score != null && (
        <span className={`badge bg-oat dark:bg-secondary-800 ${sizeClasses[size]} inline-flex items-center font-semibold ${getScoreColor(score)}`}>
          <Sparkles className={iconSize} />
          {score}%
        </span>
      )}
      {showPriority && priority && (
        <span className={`badge ${priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : priority === 'medium' ? 'bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'} ${sizeClasses[size]} inline-flex items-center`}>
          {priority === 'high' ? 'High Priority' : priority === 'medium' ? 'Medium' : 'Low'}
        </span>
      )}
    </div>
  );
}
