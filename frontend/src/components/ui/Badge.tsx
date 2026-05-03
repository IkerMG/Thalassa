import { Fish, AlertTriangle, Star, Crown } from 'lucide-react';
import { ReactNode } from 'react';

// Variants aligned to Master Plan enums (English) + semantic states
type BadgeVariant =
  | 'reefSafe'
  | 'reefUnsafe'
  | 'FISH'
  | 'CORAL'
  | 'INVERTEBRATE'
  | 'REEF'
  | 'FISH_ONLY'
  | 'MIXED'
  | 'REEFMASTER'
  | 'FREE';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

interface BadgeConfig {
  label: string;
  classes: string;
  icon?: ReactNode;
}

// Master Plan §5.5 badge specs
const BADGE_MAP: Record<BadgeVariant, BadgeConfig> = {
  reefSafe: {
    label: 'Reef Safe',
    classes:
      'bg-[rgba(52,211,153,0.12)] text-[#34D399] border border-[rgba(52,211,153,0.25)]',
    icon: <Fish className="w-3 h-3" />,
  },
  reefUnsafe: {
    label: 'Not Reef Safe',
    classes:
      'bg-[rgba(248,113,113,0.12)] text-[#F87171] border border-[rgba(248,113,113,0.25)]',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  FISH: {
    label: 'Fish',
    classes:
      'bg-[rgba(89,211,255,0.12)] text-[#59D3FF] border border-[rgba(89,211,255,0.25)]',
    icon: <Fish className="w-3 h-3" />,
  },
  CORAL: {
    label: 'Coral',
    classes:
      'bg-[rgba(251,191,36,0.12)] text-[#FBBF24] border border-[rgba(251,191,36,0.25)]',
  },
  INVERTEBRATE: {
    label: 'Invertebrate',
    classes:
      'bg-[rgba(160,160,160,0.12)] text-[#A0A0A0] border border-[rgba(160,160,160,0.20)]',
  },
  REEF: {
    label: 'Reef',
    classes:
      'bg-[rgba(52,211,153,0.12)] text-[#34D399] border border-[rgba(52,211,153,0.25)]',
  },
  FISH_ONLY: {
    label: 'Fish Only',
    classes:
      'bg-[rgba(89,211,255,0.12)] text-[#59D3FF] border border-[rgba(89,211,255,0.25)]',
  },
  MIXED: {
    label: 'Mixed',
    classes:
      'bg-[rgba(251,191,36,0.12)] text-[#FBBF24] border border-[rgba(251,191,36,0.25)]',
  },
  REEFMASTER: {
    label: 'ReefMaster',
    classes:
      'bg-[rgba(89,211,255,0.12)] text-[#59D3FF] border border-[rgba(89,211,255,0.40)]',
    icon: <Crown className="w-3 h-3" />,
  },
  FREE: {
    label: 'Free',
    classes:
      'bg-[rgba(102,102,102,0.15)] text-[#A0A0A0] border border-[rgba(102,102,102,0.25)]',
    icon: <Star className="w-3 h-3" />,
  },
};

export default function Badge({ variant, label, className = '' }: BadgeProps) {
  const config = BADGE_MAP[variant];
  const text = label ?? config.label;

  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5',
        'rounded-full text-xs font-mono',
        config.classes,
        className,
      ].join(' ')}
    >
      {config.icon}
      {text}
    </span>
  );
}
