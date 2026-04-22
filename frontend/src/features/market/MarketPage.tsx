import { ShoppingBag } from 'lucide-react';
import ComingSoonView from '../common/ComingSoonView';

export default function MarketPage() {
  return (
    <ComingSoonView
      title="Market"
      description="Compra y vende equipamiento, livestock y corales con otros acuaristas de la comunidad."
      icon={<ShoppingBag size={28} className="text-[#59D3FF]" />}
    />
  );
}
