import { Crown } from 'lucide-react';

interface QuestionCounterProps {
  used: number;
  limit: number;
}

export default function QuestionCounter({ used, limit }: QuestionCounterProps) {
  if (limit === -1) return null;

  const remaining = Math.max(0, limit - used);
  const ratio = remaining / limit;

  const barColor =
    ratio > 0.4 ? 'bg-[#59D3FF]' :
    ratio > 0    ? 'bg-[#FBBF24]' :
                   'bg-[#F87171]';

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#555]">{remaining}/{limit}</span>
      <div className="w-14 h-1 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.max(0, ratio * 100)}%` }}
        />
      </div>
      <button className="flex items-center gap-1 text-xs text-[#59D3FF] border border-[rgba(89,211,255,0.25)] rounded-md px-2.5 py-1 hover:bg-[rgba(89,211,255,0.06)] transition-colors cursor-pointer">
        <Crown size={11} />
        Premium
      </button>
    </div>
  );
}
