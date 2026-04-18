import { Fish, AlertTriangle, Star, Crown } from 'lucide-react';
import { ReactNode } from 'react';

type BadgeVariant =
  | 'reefSafe'
  | 'reefUnsafe'
  | 'PEZ'
  | 'CORAL'
  | 'INVERTEBRADO'
  | 'REEFMASTER'
  | 'FREE'
  | 'MARINO_PECES'
  | 'MARINO_ARRECIFE';

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

const BADGE_MAP: Record<BadgeVariant, BadgeConfig> = {
  reefSafe: {
    label: 'Reef Safe',
    classes: 'bg-reef-safe/15 text-reef-safe border-reef-safe/30',
    icon: <Fish className="w-3 h-3" />,
  },
  reefUnsafe: {
    label: 'No Reef Safe',
    classes: 'bg-reef-unsafe/15 text-reef-unsafe border-reef-unsafe/30',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  PEZ: {
    label: 'Pez',
    classes: 'bg-cyan/15 text-cyan border-cyan/30',
    icon: <Fish className="w-3 h-3" />,
  },
  CORAL: {
    label: 'Coral',
    classes: 'bg-coral/15 text-coral border-coral/30',
  },
  INVERTEBRADO: {
    label: 'Invertebrado',
    classes: 'bg-reef-warning/15 text-reef-warning border-reef-warning/30',
  },
  REEFMASTER: {
    label: 'REEFMASTER',
    classes: 'bg-gradient-to-r from-cyan/20 to-coral/20 text-cyan border-cyan/30',
    icon: <Crown className="w-3 h-3" />,
  },
  FREE: {
    label: 'FREE',
    classes: 'bg-text-muted/20 text-text-secondary border-text-muted/30',
    icon: <Star className="w-3 h-3" />,
  },
  MARINO_PECES: {
    label: 'Peces',
    classes: 'bg-cyan/15 text-cyan border-cyan/30',
  },
  MARINO_ARRECIFE: {
    label: 'Arrecife',
    classes: 'bg-reef-safe/15 text-reef-safe border-reef-safe/30',
  },
};

export default function Badge({ variant, label, className = '' }: BadgeProps) {
  const config = BADGE_MAP[variant];
  const text = label ?? config.label;

  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5',
        'rounded-full border text-xs font-mono',
        config.classes,
        className,
      ].join(' ')}
    >
      {config.icon}
      {text}
    </span>
  );
}
