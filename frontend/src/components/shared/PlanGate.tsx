import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface PlanGateProps {
  feature: 'calculator_energy' | 'calculator_dosage' | 'aquarium_create' | 'chat_unlimited';
  children: React.ReactNode;
}

export default function PlanGate({ feature, children }: PlanGateProps) {
  const plan = useAuthStore((s) => s.user?.plan ?? 'FREE');

  if (plan === 'REEFMASTER') return <>{children}</>;

  const labels: Record<PlanGateProps['feature'], string> = {
    calculator_energy: 'Energy Calculator',
    calculator_dosage: 'Dosing Calculator',
    aquarium_create: 'Multiple Aquariums',
    chat_unlimited: 'Unlimited AI Chat',
  };

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[3px] opacity-40">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 rounded-xl backdrop-blur-[1px]">
        <div className="w-10 h-10 rounded-full bg-[rgba(89,211,255,0.08)] border border-[rgba(89,211,255,0.20)] flex items-center justify-center">
          <Lock size={18} className="text-[#59D3FF]" />
        </div>
        <div className="text-center px-4">
          <p className="text-sm font-semibold text-white mb-1">{labels[feature]}</p>
          <p className="text-xs text-[#666]">Available on ReefMaster plan</p>
        </div>
        <Link
          to="/dashboard/profile"
          className="text-xs font-semibold bg-[#59D3FF] text-black px-4 py-2 rounded-lg hover:bg-[#3DC5F5] transition-colors"
        >
          Upgrade to ReefMaster
        </Link>
      </div>
    </div>
  );
}
