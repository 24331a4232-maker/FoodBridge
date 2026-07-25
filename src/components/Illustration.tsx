import type { CSSProperties } from 'react';

type Variant =
  | 'donation'
  | 'volunteers'
  | 'delivery'
  | 'community'
  | 'bridge'
  | 'quality'
  | 'shelter'
  | 'empty-plate';

interface IllustrationProps {
  variant: Variant;
  className?: string;
  style?: CSSProperties;
}

const palette = {
  primary: '#16A34A',
  primaryLight: '#BBF7D0',
  primarySoft: '#F0FDF4',
  secondary: '#437E5C',
  secondaryLight: '#BCD5C4',
  secondarySoft: '#DCEAE0',
  accent: '#F97316',
  accentLight: '#FFEDD5',
  ink: '#1F2937',
  inkSoft: '#6B7280',
  cream: '#FFFDF8',
};

function Blob({ className = '', fill = palette.primarySoft }: { className?: string; fill?: string }) {
  return (
    <path
      className={className}
      d="M40-20c30 10 50 35 50 65s-20 55-50 65-55-5-65-35 5-75 25-85 10-25 40-15z"
      fill={fill}
      opacity="0.55"
    />
  );
}

function Circle({ cx, cy, r, fill, opacity = 1 }: { cx: number; cy: number; r: number; fill: string; opacity?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill={fill} opacity={opacity} />;
}

function Hand({ x, y, color = palette.secondary, flip = false }: { x: number; y: number; color?: string; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) ${flip ? 'scale(-1 1)' : ''}`}>
      <path
        d="M0 30c0-4 3-7 7-7h14c4 0 7 3 7 7v18c0 4-3 7-7 7H7c-4 0-7-3-7-7V30z"
        fill={color}
      />
      <path d="M3 28c0-3 2-5 5-5h12c3 0 5 2 5 5" fill="none" stroke={color} strokeWidth="2" />
    </g>
  );
}

function Box({ x, y, color = palette.accent, label }: { x: number; y: number; color?: string; label?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 12l16-8 16 8v20l-16 8-16-8V12z" fill={color} opacity="0.9" />
      <path d="M0 12l16-8 16 8-16 8-16-8z" fill={color} />
      <path d="M16 4v8m-16 0l16 8 16-8" fill="none" stroke={palette.cream} strokeWidth="1.4" opacity="0.5" />
      {label && (
        <text x="16" y="26" textAnchor="middle" fontSize="7" fill={palette.cream} fontFamily="Inter, sans-serif" fontWeight="600">
          {label}
        </text>
      )}
    </g>
  );
}

function Person({ x, y, shirt = palette.primary, skin = '#E8C9A8', hair = palette.ink }: { x: number; y: number; shirt?: string; skin?: string; hair?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="-6" r="6.5" fill={skin} />
      <path d="M-6.5 -8a6.5 6.5 0 0 1 13 0c0-4-3-7-6.5-7s-6.5 3-6.5 7z" fill={hair} />
      <path d="M-9 4c0-5 4-8 9-8s9 3 9 8v14c0 3-2 5-5 5h-8c-3 0-5-2-5-5V4z" fill={shirt} />
    </g>
  );
}

function Heart({ x, y, size = 1, color = palette.primary }: { x: number; y: number; size?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <path
        d="M0 6c-4-4-10-2-10 4 0 5 6 8 10 12 4-4 10-7 10-12 0-6-6-8-10-4z"
        fill={color}
      />
    </g>
  );
}

function Leaf({ x, y, size = 1, color = palette.secondary }: { x: number; y: number; size?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <path d="M0 0c8 2 14 8 14 16 0 6-4 10-10 10-6 0-10-4-10-10 0-6 2-12 6-16z" fill={color} />
      <path d="M0 0c2 6 4 12 4 18" fill="none" stroke={palette.cream} strokeWidth="1.2" opacity="0.6" />
    </g>
  );
}

export function Illustration({ variant, className = '', style }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {variant === 'donation' && (
        <g>
          <Blob fill={palette.primarySoft} />
          <Circle cx="100" cy="100" r="62" fill={palette.cream} />
          <Circle cx="100" cy="100" r="62" fill="none" stroke={palette.primaryLight} strokeWidth="2" />
          <Hand x="60" y="95" color={palette.secondary} />
          <Hand x="120" y="95" color={palette.primary} flip />
          <Box x="84" y="78" color={palette.accent} />
          <Heart x="100" y="120" size="0.7" color={palette.primary} />
        </g>
      )}

      {variant === 'volunteers' && (
        <g>
          <Blob fill={palette.secondarySoft} />
          <Circle cx="100" cy="100" r="64" fill={palette.cream} />
          <Circle cx="100" cy="100" r="64" fill="none" stroke={palette.secondaryLight} strokeWidth="2" />
          <Person x="70" y="95" shirt={palette.secondary} />
          <Person x="100" y="92" shirt={palette.primary} />
          <Person x="130" y="95" shirt={palette.accent} />
          <path d="M70 118c10 6 50 6 60 0" stroke={palette.secondary} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          <Heart x="100" y="138" size="0.6" color={palette.primary} />
        </g>
      )}

      {variant === 'delivery' && (
        <g>
          <Blob fill={palette.accentLight} />
          <Circle cx="100" cy="100" r="64" fill={palette.cream} />
          <Circle cx="100" cy="100" r="64" fill="none" stroke={palette.accentLight} strokeWidth="2" />
          <g transform="translate(55 88)">
            <path d="M0 22h44l8 8v14H0V22z" fill={palette.secondary} />
            <path d="M44 22l8 8H44V22z" fill={palette.secondary} opacity="0.7" />
            <rect x="6" y="26" width="14" height="10" fill={palette.cream} opacity="0.5" rx="1" />
            <Circle cx="16" cy="44" r="6" fill={palette.ink} />
            <Circle cx="16" cy="44" r="3" fill={palette.cream} />
            <Circle cx="40" cy="44" r="6" fill={palette.ink} />
            <Circle cx="40" cy="44" r="3" fill={palette.cream} />
          </g>
          <Box x="92" y="78" color={palette.accent} />
          <path d="M120 96l8-4 6 6" stroke={palette.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M128 92l4 8" stroke={palette.primary} strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {variant === 'community' && (
        <g>
          <Blob fill={palette.primarySoft} />
          <Circle cx="100" cy="100" r="64" fill={palette.cream} />
          <Circle cx="100" cy="100" r="64" fill="none" stroke={palette.primaryLight} strokeWidth="2" />
          <Person x="100" y="78" shirt={palette.primary} />
          <Person x="74" y="98" shirt={palette.secondary} />
          <Person x="126" y="98" shirt={palette.secondary} />
          <Person x="84" y="120" shirt={palette.accent} />
          <Person x="116" y="120" shirt={palette.accent} />
          <Heart x="100" y="108" size="0.45" color={palette.cream} />
        </g>
      )}

      {variant === 'bridge' && (
        <g>
          <Blob fill={palette.secondarySoft} />
          <Circle cx="100" cy="100" r="64" fill={palette.cream} />
          <Circle cx="100" cy="100" r="64" fill="none" stroke={palette.secondaryLight} strokeWidth="2" />
          <path d="M48 108h104v8H48z" fill={palette.primary} />
          <path d="M48 108c0-20 26-32 52-32s52 12 52 32" fill="none" stroke={palette.primary} strokeWidth="4" />
          <path d="M58 116v10M74 116v10M90 116v10M106 116v10M122 116v10M138 116v10" stroke={palette.primary} strokeWidth="3" strokeLinecap="round" />
          <path d="M48 116c-6 0-10-4-10-10M152 116c6 0 10-4 10-10" stroke={palette.secondary} strokeWidth="3" strokeLinecap="round" fill="none" />
          <Leaf x="44" y="124" size="0.7" color={palette.secondary} />
          <Leaf x="150" y="124" size="0.7" color={palette.secondary} />
          <Heart x="100" y="84" size="0.5" color={palette.accent} />
        </g>
      )}

      {variant === 'quality' && (
        <g>
          <Blob fill={palette.accentLight} />
          <Circle cx="100" cy="100" r="64" fill={palette.cream} />
          <Circle cx="100" cy="100" r="64" fill="none" stroke={palette.accentLight} strokeWidth="2" />
          <path d="M100 70l22 12v24c0 14-10 22-22 28-12-6-22-14-22-28V82l22-12z" fill={palette.secondary} />
          <path d="M90 108l8 8 14-16" stroke={palette.cream} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      )}

      {variant === 'shelter' && (
        <g>
          <Blob fill={palette.primarySoft} />
          <Circle cx="100" cy="100" r="64" fill={palette.cream} />
          <Circle cx="100" cy="100" r="64" fill="none" stroke={palette.primaryLight} strokeWidth="2" />
          <path d="M70 110l30-22 30 22v4H70v-4z" fill={palette.primary} />
          <path d="M78 114v18h44v-18" fill={palette.secondary} />
          <rect x="92" y="120" width="16" height="12" fill={palette.cream} opacity="0.6" rx="1" />
          <Person x="100" y="100" shirt={palette.accent} />
          <Heart x="100" y="140" size="0.5" color={palette.primary} />
        </g>
      )}

      {variant === 'empty-plate' && (
        <g>
          <Blob fill={palette.secondarySoft} />
          <Circle cx="100" cy="100" r="64" fill={palette.cream} />
          <Circle cx="100" cy="100" r="64" fill="none" stroke={palette.secondaryLight} strokeWidth="2" />
          <Circle cx="100" cy="104" r="34" fill="none" stroke={palette.secondary} strokeWidth="3" />
          <Circle cx="100" cy="104" r="24" fill="none" stroke={palette.secondary} strokeWidth="2" opacity="0.5" />
          <path d="M100 70v8M100 130v8M66 104h8M126 104h8" stroke={palette.secondary} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          <Heart x="100" y="104" size="0.4" color={palette.primary} />
        </g>
      )}
    </svg>
  );
}

export function IllustrationBackdrop({ variant = 'bridge', className = '' }: { variant?: Variant; className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute -top-24 -right-20 h-80 w-80 opacity-[0.12]">
        <Illustration variant={variant} className="w-full h-full" />
      </div>
      <div className="absolute -bottom-28 -left-24 h-72 w-72 opacity-[0.08]">
        <Illustration variant={variant} className="w-full h-full" />
      </div>
    </div>
  );
}

interface DonationImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  variant?: Variant;
}

export function DonationImage({ src, alt, className = '', variant = 'donation' }: DonationImageProps) {
  if (src) {
    return <img src={src} alt={alt} className={className} loading="lazy" />;
  }
  return (
    <div className={`flex items-center justify-center bg-cream dark:bg-secondary-900 ${className}`}>
      <Illustration variant={variant} className="w-3/4 h-3/4" />
    </div>
  );
}
