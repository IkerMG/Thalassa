import { Fish, Tag, User, Wrench } from 'lucide-react';

type EntityType = 'livestock' | 'equipment' | 'wishlist' | 'avatar';

const ICON_MAP: Record<EntityType, React.ReactNode> = {
  livestock: <Fish size={28} className="text-white/20" />,
  equipment: <Wrench size={28} className="text-white/20" />,
  wishlist: <Tag size={28} className="text-white/20" />,
  avatar: <User size={28} className="text-white/20" />,
};

interface ImagePlaceholderProps {
  entityType: EntityType;
  className?: string;
}

export default function ImagePlaceholder({ entityType, className = '' }: ImagePlaceholderProps) {
  return (
    <div
      className={`flex items-center justify-center bg-white/[0.03] ${className}`}
      aria-hidden="true"
    >
      {ICON_MAP[entityType]}
    </div>
  );
}
