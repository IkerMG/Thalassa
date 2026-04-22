import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-4">
      <div className="w-14 h-14 rounded-full bg-[rgba(89,211,255,0.06)] border border-[rgba(89,211,255,0.12)] flex items-center justify-center">
        <Icon size={24} className="text-[#59D3FF] opacity-60" />
      </div>
      <div>
        <p className="text-white font-medium mb-1">{title}</p>
        <p className="text-sm text-[#666]">{description}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
