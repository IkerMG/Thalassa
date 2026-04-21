import { Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';

export default function DashboardView() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-full p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-[#A0A0A0] mt-1">
          Welcome back, <span className="text-white">{user?.username}</span>
        </p>
      </div>

      {/* Empty state — first aquarium CTA */}
      <div
        className="
          border border-dashed border-[rgba(89,211,255,0.30)] rounded-xl
          flex flex-col items-center justify-center
          py-20 px-8 text-center gap-4
        "
      >
        <div className="w-12 h-12 rounded-full bg-[rgba(89,211,255,0.08)] flex items-center justify-center">
          <Plus className="w-6 h-6 text-[#59D3FF]" />
        </div>
        <div>
          <p className="text-white font-medium mb-1">Create Your First Aquarium</p>
          <p className="text-sm text-[#666]">
            Start tracking parameters, livestock, and equipment.
          </p>
        </div>
        <Button variant="primary" size="md">
          New Aquarium
        </Button>
      </div>
    </div>
  );
}
