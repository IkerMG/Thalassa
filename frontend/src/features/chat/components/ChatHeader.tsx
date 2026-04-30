import { Bot, X } from 'lucide-react';
import type { AquariumSummary } from '../../../types/aquarium';
import QuestionCounter from './QuestionCounter';

interface ChatHeaderProps {
  onClose: () => void;
  aquariums: AquariumSummary[];
  selectedAquariumId: number | '';
  onAquariumChange: (id: number | '') => void;
  used: number;
  limit: number;
}

export default function ChatHeader({
  onClose,
  aquariums,
  selectedAquariumId,
  onAquariumChange,
  used,
  limit,
}: ChatHeaderProps) {
  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-3 border-b border-[rgba(255,255,255,0.08)] shrink-0">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[rgba(89,211,255,0.08)] border border-[rgba(89,211,255,0.20)] flex items-center justify-center shrink-0">
            <Bot size={18} className="text-[#59D3FF]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">Thalassa AI</h2>
            <p className="text-xs text-[#555]">Asistente de acuariofilia marina</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <QuestionCounter used={used} limit={limit} />
          <button
            onClick={onClose}
            aria-label="Cerrar chat"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Aquarium context selector */}
      {aquariums.length > 0 && (
        <select
          value={selectedAquariumId}
          onChange={(e) => onAquariumChange(e.target.value ? Number(e.target.value) : '')}
          className="w-full bg-[#111] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors cursor-pointer"
        >
          <option value="">Sin contexto de acuario</option>
          {aquariums.map((aq) => (
            <option key={aq.id} value={aq.id}>
              {aq.name} · {aq.liters} L
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
