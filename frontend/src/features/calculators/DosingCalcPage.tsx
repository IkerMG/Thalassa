import { FlaskConical } from 'lucide-react';
import ComingSoonView from '../common/ComingSoonView';

export default function DosingCalcPage() {
  return (
    <ComingSoonView
      title="Dosing Calculator"
      description="Calcula las dosis exactas de aditivos para mantener los parámetros de tu arrecife."
      icon={<FlaskConical size={28} className="text-[#59D3FF]" />}
    />
  );
}
