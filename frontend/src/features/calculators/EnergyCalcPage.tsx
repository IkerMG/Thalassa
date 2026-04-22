import { Zap } from 'lucide-react';
import ComingSoonView from '../common/ComingSoonView';

export default function EnergyCalcPage() {
  return (
    <ComingSoonView
      title="Energy Calculator"
      description="Estima el consumo energético mensual de todos los equipos de tu acuario."
      icon={<Zap size={28} className="text-[#59D3FF]" />}
    />
  );
}
