import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Fish, Wrench, Layers, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAquariumStore } from '../../store/aquariumStore';
import { aquariumApi } from '../../api/aquariumApi';
import { dashboardApi, type DashboardSummary } from '../../api/dashboardApi';
import type { AquariumSummary, AquariumType, AquariumRequest } from '../../types/aquarium';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/shared/EmptyState';

const TYPE_LABELS: Record<AquariumType, string> = {
  REEF: 'Reef',
  FISH_ONLY: 'Fish Only',
  MIXED: 'Mixed',
};

// ── Aquarium card ─────────────────────────────────────────────────────────────

function AquariumCard({ aq }: { aq: AquariumSummary }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/dashboard/aquarium/${aq.id}`)}
      className="
        group text-left w-full
        bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-5
        hover:border-[rgba(255,255,255,0.15)] transition-all duration-200
        cursor-pointer
      "
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-semibold text-sm">{aq.name}</p>
          <p className="text-[#666] text-xs mt-0.5">{aq.liters} L</p>
        </div>
        <span className="text-[10px] font-medium text-[#59D3FF] border border-[rgba(89,211,255,0.30)] rounded px-2 py-0.5">
          {TYPE_LABELS[aq.type]}
        </span>
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-[#A0A0A0] text-xs">View details</span>
        <ChevronRight size={14} className="text-[#666] group-hover:text-[#59D3FF] transition-colors" />
      </div>
    </button>
  );
}

// ── Create Aquarium modal ─────────────────────────────────────────────────────

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (aq: AquariumSummary) => void;
}

function CreateAquariumModal({ open, onClose, onCreated }: CreateModalProps) {
  const [name, setName] = useState('');
  const [liters, setLiters] = useState('');
  const [type, setType] = useState<AquariumType>('REEF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => { setName(''); setLiters(''); setType('REEF'); setError(''); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !liters) return;
    setLoading(true);
    setError('');
    try {
      const data: AquariumRequest = { name: name.trim(), liters: Number(liters), type };
      const created = await aquariumApi.create(data);
      onCreated(created);
      handleClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to create aquarium.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="New Aquarium">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          placeholder="e.g. My Reef Tank"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Volume (liters)"
          type="number"
          placeholder="e.g. 200"
          min={1}
          value={liters}
          onChange={(e) => setLiters(e.target.value)}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
            Ecosystem Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AquariumType)}
            className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors cursor-pointer"
          >
            <option value="REEF">Reef</option>
            <option value="FISH_ONLY">Fish Only</option>
            <option value="MIXED">Mixed</option>
          </select>
        </div>
        {error && <p className="text-xs text-[#F87171]">{error}</p>}
        <div className="flex gap-3 justify-end pt-1">
          <Button type="button" variant="ghost" size="md" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={loading}>
            {loading ? 'Creating…' : 'Create Aquarium'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardView() {
  const user = useAuthStore((s) => s.user);
  const { aquariums, setAquariums, addAquarium } = useAquariumStore();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const isFree = user?.plan === 'FREE';
  const canCreate = !isFree || aquariums.length === 0;

  useEffect(() => {
    Promise.all([aquariumApi.list(), dashboardApi.getSummary()])
      .then(([list, sum]) => {
        setAquariums(list);
        setSummary(sum);
      })
      .finally(() => setLoading(false));
  }, [setAquariums]);

  const handleCreated = (aq: AquariumSummary) => {
    addAquarium(aq);
    setSummary((s) =>
      s ? { ...s, aquariumCount: s.aquariumCount + 1 } : s
    );
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">
            Welcome back, <span className="text-white">{user?.username}</span>
          </p>
        </div>
        {canCreate && (
          <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
            <Plus size={16} className="mr-1" />
            New Aquarium
          </Button>
        )}
      </div>

      {/* Global stats */}
      {summary && aquariums.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Layers, label: 'Aquariums', value: summary.aquariumCount },
            { icon: Fish, label: 'Total Livestock', value: summary.totalLivestock },
            { icon: Wrench, label: 'Total Equipment', value: summary.totalEquipment },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-[rgba(89,211,255,0.08)] flex items-center justify-center">
                <Icon size={16} className="text-[#59D3FF]" />
              </div>
              <div>
                <p className="font-mono text-xl font-medium text-white">{value}</p>
                <p className="text-[#666] text-xs">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aquariums grid */}
      {aquariums.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No aquariums yet"
          description="Create your first aquarium to start tracking parameters, livestock, and equipment."
          action={
            <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
              <Plus size={16} className="mr-1" />
              New Aquarium
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {aquariums.map((aq) => (
            <AquariumCard key={aq.id} aq={aq} />
          ))}
          {canCreate && (
            <button
              onClick={() => setCreateOpen(true)}
              className="
                border border-dashed border-[rgba(89,211,255,0.25)] rounded-xl p-5
                flex flex-col items-center justify-center gap-2 min-h-[100px]
                text-[#59D3FF] hover:border-[rgba(89,211,255,0.50)] hover:bg-[rgba(89,211,255,0.03)]
                transition-all duration-200 cursor-pointer
              "
            >
              <Plus size={20} />
              <span className="text-sm font-medium">New Aquarium</span>
            </button>
          )}
        </div>
      )}

      <CreateAquariumModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
