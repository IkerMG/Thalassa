import type { ReactNode } from 'react';
import { Construction } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export default function ComingSoonView({ title, description, icon }: Props) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[rgba(89,211,255,0.08)] border border-[rgba(89,211,255,0.15)] flex items-center justify-center mb-5">
        {icon ?? <Construction size={28} className="text-[#59D3FF]" />}
      </div>
      <h1 className="text-xl font-bold text-white mb-2">{title}</h1>
      <p className="text-sm text-[#555] max-w-xs leading-relaxed">
        {description ?? 'Este módulo estará disponible próximamente.'}
      </p>
      <span className="mt-5 text-[10px] font-mono tracking-widest text-[#59D3FF] border border-[rgba(89,211,255,0.25)] rounded-full px-3 py-1">
        COMING SOON
      </span>
    </div>
  );
}
