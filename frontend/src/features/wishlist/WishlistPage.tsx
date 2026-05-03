import { Heart } from 'lucide-react';
import ComingSoonView from '../common/ComingSoonView';

export default function WishlistPage() {
  return (
    <ComingSoonView
      title="Wishlist"
      description="Guarda las especies y equipos que quieres añadir a tus acuarios en el futuro."
      icon={<Heart size={28} className="text-[#59D3FF]" />}
    />
  );
}
