import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import {
  ArrowLeft,
  Plus,
  Fish,
  Wrench,
  Trash2,
  Layers,
  Waves,
  TriangleAlert,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { aquariumApi } from '../../api/aquariumApi';
import { parameterApi } from '../../api/parameterApi';
import type { AquariumDetail, AquariumType, LivestockCategory, EquipmentCategory, EquipmentItem, LivestockItem } from '../../types/aquarium';
import type { WaterParameter, ParameterKey, WaterParameterRequest } from '../../types/parameter';
import {
  PARAMETER_KEYS,
  PARAMETER_RANGES,
  getParameterStatus,
  formatParamValue,
  type ParameterStatus,
} from '../../utils/parameterRanges';
import { formatDate, filterByTimeRange, type TimeRange } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/shared/EmptyState';
import ReefSafeBadge from '../../components/shared/ReefSafeBadge';
import PlanGate from '../../components/shared/PlanGate';
import ParameterLineChart from '../../components/charts/ParameterLineChart';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<AquariumType, string> = {
  REEF: 'Reef',
  FISH_ONLY: 'Fish Only',
  MIXED: 'Mixed',
};

const CATEGORY_COLORS: Record<LivestockCategory, string> = {
  FISH: 'text-[#59D3FF] bg-[rgba(89,211,255,0.10)] border-[rgba(89,211,255,0.25)]',
  CORAL: 'text-[#FBBF24] bg-[rgba(251,191,36,0.10)] border-[rgba(251,191,36,0.25)]',
  INVERTEBRATE: 'text-[#34D399] bg-[rgba(52,211,153,0.10)] border-[rgba(52,211,153,0.25)]',
};

const EQUIP_CATEGORY_COLORS: Record<EquipmentCategory, string> = {
  LIGHT: 'text-[#FBBF24] bg-[rgba(251,191,36,0.10)]',
  PUMP: 'text-[#59D3FF] bg-[rgba(89,211,255,0.10)]',
  SKIMMER: 'text-[#A78BFA] bg-[rgba(167,139,250,0.10)]',
  HEATER: 'text-[#F87171] bg-[rgba(248,113,113,0.10)]',
  OTHER: 'text-[#A0A0A0] bg-[rgba(160,160,160,0.10)]',
};

const STATUS_CONFIG: Record<
  ParameterStatus,
  { color: string; icon: React.ReactNode }
> = {
  good:    { color: 'text-[#34D399]', icon: <CheckCircle2 size={12} /> },
  warning: { color: 'text-[#FBBF24]', icon: <TriangleAlert size={12} /> },
  danger:  { color: 'text-[#F87171]', icon: <TriangleAlert size={12} /> },
  unknown: { color: 'text-[#666]',    icon: <Clock size={12} /> },
};

// ── Log Measurement Modal ─────────────────────────────────────────────────────

interface LogModalProps {
  open: boolean;
  onClose: () => void;
  aquariumId: number;
  onLogged: (p: WaterParameter) => void;
}

function LogMeasurementModal({ open, onClose, aquariumId, onLogged }: LogModalProps) {
  const [values, setValues] = useState<Partial<Record<ParameterKey, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => { setValues({}); setError(''); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload: WaterParameterRequest = {};
      for (const key of PARAMETER_KEYS) {
        const v = values[key];
        if (v !== undefined && v !== '') {
          (payload as Record<string, number>)[key] = parseFloat(v);
        }
      }
      const logged = await parameterApi.log(aquariumId, payload);
      onLogged(logged);
      handleClose();
    } catch {
      setError('Failed to save measurement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Log New Measurement" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit}>
        <p className="text-xs text-[#666] mb-4">All fields are optional — log only what you've measured.</p>
        <div className="grid grid-cols-2 gap-3">
          {PARAMETER_KEYS.map((key) => {
            const r = PARAMETER_RANGES[key];
            return (
              <Input
                key={key}
                label={`${r.label}${r.unit ? ` (${r.unit})` : ''}`}
                type="number"
                step="any"
                placeholder={`${r.min}–${r.max}`}
                value={values[key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              />
            );
          })}
        </div>
        {error && <p className="text-xs text-[#F87171] mt-3">{error}</p>}
        <div className="flex gap-3 justify-end mt-5">
          <Button type="button" variant="ghost" size="md" onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="md" disabled={loading}>
            {loading ? 'Saving…' : 'Save Measurement'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Add Livestock Modal ───────────────────────────────────────────────────────

interface AddLivestockModalProps {
  open: boolean;
  onClose: () => void;
  aquariumId: number;
  aquariumType: AquariumType;
  onAdded: (item: LivestockItem, warning?: string | null) => void;
}

function AddLivestockModal({ open, onClose, aquariumId, aquariumType, onAdded }: AddLivestockModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<LivestockCategory>('FISH');
  const [reefSafe, setReefSafe] = useState(true);
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => { setName(''); setCategory('FISH'); setReefSafe(true); setQuantity('1'); setError(''); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await aquariumApi.addLivestock(aquariumId, {
        name: name.trim(), category, reefSafe, quantity: Number(quantity),
      });
      onAdded(res.livestock, res.warning);
      handleClose();
    } catch {
      setError('Failed to add livestock.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Animal">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Name" placeholder="e.g. Clownfish" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as LivestockCategory)}
            className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors cursor-pointer"
          >
            <option value="FISH">Fish</option>
            <option value="CORAL">Coral</option>
            <option value="INVERTEBRATE">Invertebrate</option>
          </select>
        </div>
        <Input label="Quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={reefSafe}
            onChange={(e) => setReefSafe(e.target.checked)}
            className="w-4 h-4 accent-[#59D3FF]"
          />
          <span className="text-sm text-[#A0A0A0]">Reef Safe</span>
        </label>
        {aquariumType === 'REEF' && !reefSafe && (
          <div className="flex items-start gap-2 bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.20)] rounded-lg p-3">
            <TriangleAlert size={14} className="text-[#F87171] mt-0.5 shrink-0" />
            <p className="text-xs text-[#F87171]">
              This species is not reef safe. It may harm corals or invertebrates in your reef aquarium.
            </p>
          </div>
        )}
        {error && <p className="text-xs text-[#F87171]">{error}</p>}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" size="md" onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="md" disabled={loading}>
            {loading ? 'Adding…' : 'Add Animal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Add Equipment Modal ───────────────────────────────────────────────────────

interface AddEquipmentModalProps {
  open: boolean;
  onClose: () => void;
  aquariumId: number;
  onAdded: (item: EquipmentItem) => void;
}

function AddEquipmentModal({ open, onClose, aquariumId, onAdded }: AddEquipmentModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('OTHER');
  const [watts, setWatts] = useState('');
  const [hours, setHours] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => { setName(''); setCategory('OTHER'); setWatts(''); setHours(''); setError(''); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !watts || !hours) return;
    setLoading(true);
    setError('');
    try {
      const item = await aquariumApi.addEquipment(aquariumId, {
        name: name.trim(), category, powerWatts: Number(watts), hoursPerDay: Number(hours),
      });
      onAdded(item);
      handleClose();
    } catch {
      setError('Failed to add equipment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Equipment">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Name" placeholder="e.g. LED Light" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
            className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors cursor-pointer"
          >
            <option value="LIGHT">Light</option>
            <option value="PUMP">Pump</option>
            <option value="SKIMMER">Skimmer</option>
            <option value="HEATER">Heater</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Power (W)" type="number" min={1} placeholder="e.g. 100" value={watts} onChange={(e) => setWatts(e.target.value)} required />
          <Input label="Hours / day" type="number" min={0.1} max={24} step={0.5} placeholder="e.g. 10" value={hours} onChange={(e) => setHours(e.target.value)} required />
        </div>
        {error && <p className="text-xs text-[#F87171]">{error}</p>}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" size="md" onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="md" disabled={loading}>
            {loading ? 'Adding…' : 'Add Equipment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Tab: Overview ─────────────────────────────────────────────────────────────

interface OverviewTabProps {
  aquarium: AquariumDetail;
  lastParam: WaterParameter | null;
  onLogClick: () => void;
}

function OverviewTab({ aquarium, lastParam, onLogClick }: OverviewTabProps) {
  const fishCount = aquarium.livestock.filter((l) => l.category === 'FISH').reduce((a, l) => a + l.quantity, 0);
  const coralCount = aquarium.livestock.filter((l) => l.category === 'CORAL').reduce((a, l) => a + l.quantity, 0);
  const invertCount = aquarium.livestock.filter((l) => l.category === 'INVERTEBRATE').reduce((a, l) => a + l.quantity, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Parameters snapshot */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Current Parameters</h3>
          <Button variant="secondary" size="sm" onClick={onLogClick}>
            <Plus size={14} className="mr-1" />
            Log Measurement
          </Button>
        </div>
        {!lastParam ? (
          <div className="border border-dashed border-[rgba(255,255,255,0.08)] rounded-xl py-10 text-center">
            <p className="text-[#666] text-sm">No measurements yet.</p>
            <button onClick={onLogClick} className="text-[#59D3FF] text-sm mt-1 hover:underline cursor-pointer">
              Log your first measurement →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PARAMETER_KEYS.map((key) => {
              const value = lastParam[key];
              const status = getParameterStatus(key, value);
              const sc = STATUS_CONFIG[status];
              const r = PARAMETER_RANGES[key];
              return (
                <div
                  key={key}
                  className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4"
                >
                  <div className={`flex items-center gap-1 mb-1 ${sc.color}`}>
                    {sc.icon}
                    <span className="text-[10px] font-medium uppercase tracking-wide">{r.label}</span>
                  </div>
                  <p className={`font-mono text-xl font-medium ${value !== null ? 'text-white' : 'text-[#444]'}`}>
                    {formatParamValue(key, value)}
                    {value !== null && r.unit && (
                      <span className="text-xs text-[#666] ml-1">{r.unit}</span>
                    )}
                  </p>
                  <p className="text-[10px] text-[#444] mt-1">
                    {r.min}–{r.max} {r.unit}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        {lastParam && (
          <p className="text-[11px] text-[#444] mt-2">
            Last logged: {formatDate(lastParam.measuredAt)}
          </p>
        )}
      </div>

      {/* Quick stats */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Quick Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Fish', value: fishCount, color: 'text-[#59D3FF]' },
            { label: 'Corals', value: coralCount, color: 'text-[#FBBF24]' },
            { label: 'Invertebrates', value: invertCount, color: 'text-[#34D399]' },
            { label: 'Equipment', value: aquarium.equipment.length, color: 'text-[#A0A0A0]' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4 text-center">
              <p className={`font-mono text-2xl font-medium ${color}`}>{value}</p>
              <p className="text-xs text-[#666] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Parameters ───────────────────────────────────────────────────────────

interface ParametersTabProps {
  aquariumId: number;
  parameters: WaterParameter[];
  onLogged: (p: WaterParameter) => void;
}

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '7d': '7 days',
  '30d': '30 days',
  '3m': '3 months',
  'all': 'All time',
};

function ParametersTab({ aquariumId, parameters, onLogged }: ParametersTabProps) {
  const [activeParam, setActiveParam] = useState<ParameterKey>('temperature');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [logOpen, setLogOpen] = useState(false);

  const filtered = filterByTimeRange(parameters, timeRange);
  const r = PARAMETER_RANGES[activeParam];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {PARAMETER_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setActiveParam(key)}
              className={[
                'text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer',
                activeParam === key
                  ? 'bg-[rgba(89,211,255,0.10)] border-[rgba(89,211,255,0.40)] text-[#59D3FF]'
                  : 'bg-transparent border-[rgba(255,255,255,0.08)] text-[#A0A0A0] hover:border-[rgba(255,255,255,0.15)] hover:text-white',
              ].join(' ')}
            >
              {PARAMETER_RANGES[key].label}
            </button>
          ))}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setLogOpen(true)}>
          <Plus size={14} className="mr-1" />
          Log
        </Button>
      </div>

      {/* Time filter */}
      <div className="flex items-center gap-2">
        {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((tr) => (
          <button
            key={tr}
            onClick={() => setTimeRange(tr)}
            className={[
              'text-xs px-3 py-1 rounded-lg transition-all cursor-pointer',
              timeRange === tr
                ? 'text-white bg-[rgba(255,255,255,0.08)]'
                : 'text-[#666] hover:text-[#A0A0A0]',
            ].join(' ')}
          >
            {TIME_RANGE_LABELS[tr]}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-white">{r.label}</span>
          {r.unit && <span className="text-xs text-[#666]">({r.unit})</span>}
          <span className="text-[10px] text-[#444] ml-auto">
            Optimal: {r.min}–{r.max}
          </span>
        </div>
        <ParameterLineChart parameters={filtered} paramKey={activeParam} />
      </div>

      {/* History table */}
      {parameters.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Measurement History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left py-2 pr-4 text-[#666] font-medium">Date</th>
                  {PARAMETER_KEYS.map((k) => (
                    <th key={k} className="text-right py-2 px-2 text-[#666] font-medium whitespace-nowrap">
                      {PARAMETER_RANGES[k].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parameters.slice(0, 20).map((p) => (
                  <tr key={p.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="py-2 pr-4 text-[#A0A0A0] whitespace-nowrap">{formatDate(p.measuredAt)}</td>
                    {PARAMETER_KEYS.map((k) => {
                      const val = p[k];
                      const st = getParameterStatus(k, val);
                      return (
                        <td
                          key={k}
                          className={[
                            'py-2 px-2 text-right font-mono',
                            st === 'good' ? 'text-[#34D399]' :
                            st === 'warning' ? 'text-[#FBBF24]' :
                            st === 'danger' ? 'text-[#F87171]' :
                            'text-[#444]',
                          ].join(' ')}
                        >
                          {formatParamValue(k, val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <LogMeasurementModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        aquariumId={aquariumId}
        onLogged={(p) => { onLogged(p); setLogOpen(false); }}
      />
    </div>
  );
}

// ── Tab: Livestock ────────────────────────────────────────────────────────────

interface LivestockTabProps {
  aquarium: AquariumDetail;
  onLivestockChange: (updated: LivestockItem[]) => void;
}

function LivestockTab({ aquarium, onLivestockChange }: LivestockTabProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await aquariumApi.deleteLivestock(id);
      onLivestockChange(aquarium.livestock.filter((l) => l.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdded = (item: LivestockItem, warn?: string | null) => {
    onLivestockChange([...aquarium.livestock, item]);
    if (warn) setWarning(warn);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          {aquarium.livestock.length} animal{aquarium.livestock.length !== 1 ? 's' : ''}
        </h3>
        <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} className="mr-1" />
          Add Animal
        </Button>
      </div>

      {warning && (
        <div className="flex items-start gap-2 bg-[rgba(251,191,36,0.08)] border border-[rgba(251,191,36,0.20)] rounded-lg p-3">
          <TriangleAlert size={14} className="text-[#FBBF24] mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-[#FBBF24]">{warning}</p>
          </div>
          <button onClick={() => setWarning(null)} className="text-[#666] hover:text-white text-xs cursor-pointer">✕</button>
        </div>
      )}

      {aquarium.livestock.length === 0 ? (
        <EmptyState
          icon={Fish}
          title="No animals yet"
          description="Add the fish, corals, and invertebrates living in this aquarium."
          action={
            <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
              <Plus size={14} className="mr-1" />
              Add Animal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {aquarium.livestock.map((item) => (
            <div
              key={item.id}
              className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  <p className="text-xs text-[#666] mt-0.5">×{item.quantity}</p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="text-[#444] hover:text-[#F87171] transition-colors p-1 cursor-pointer disabled:opacity-40"
                >
                  {deletingId === item.id ? <Spinner size={14} /> : <Trash2 size={14} />}
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[item.category]}`}>
                  {item.category}
                </span>
                <ReefSafeBadge reefSafe={item.reefSafe} />
              </div>
            </div>
          ))}
        </div>
      )}

      <AddLivestockModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        aquariumId={aquarium.id}
        aquariumType={aquarium.type}
        onAdded={handleAdded}
      />
    </div>
  );
}

// ── Tab: Equipment ────────────────────────────────────────────────────────────

interface EquipmentTabProps {
  aquarium: AquariumDetail;
  onEquipmentChange: (updated: EquipmentItem[]) => void;
}

function EquipmentTab({ aquarium, onEquipmentChange }: EquipmentTabProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const totalWatts = aquarium.equipment.reduce((a, e) => a + e.powerWatts, 0);
  const totalKwhMonth = aquarium.equipment.reduce(
    (a, e) => a + (e.powerWatts / 1000) * e.hoursPerDay * 30,
    0
  );

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await aquariumApi.deleteEquipment(id);
      onEquipmentChange(aquarium.equipment.filter((e) => e.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          {aquarium.equipment.length} device{aquarium.equipment.length !== 1 ? 's' : ''}
        </h3>
        <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} className="mr-1" />
          Add Equipment
        </Button>
      </div>

      {/* Energy summary — ReefMaster only */}
      {aquarium.equipment.length > 0 && (
        <PlanGate feature="calculator_energy">
          <div className="grid grid-cols-2 gap-3 bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
            <div>
              <p className="text-[#666] text-xs mb-1">Total Power</p>
              <p className="font-mono text-xl text-white">{totalWatts}<span className="text-xs text-[#666] ml-1">W</span></p>
            </div>
            <div>
              <p className="text-[#666] text-xs mb-1">Est. Monthly</p>
              <p className="font-mono text-xl text-white">{totalKwhMonth.toFixed(1)}<span className="text-xs text-[#666] ml-1">kWh</span></p>
            </div>
          </div>
        </PlanGate>
      )}

      {aquarium.equipment.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No equipment yet"
          description="Add lights, pumps, skimmers, and heaters to track energy consumption."
          action={
            <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
              <Plus size={14} className="mr-1" />
              Add Equipment
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {aquarium.equipment.map((item) => {
            const kwhDay = (item.powerWatts / 1000) * item.hoursPerDay;
            return (
              <div
                key={item.id}
                className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                    {item.category && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${EQUIP_CATEGORY_COLORS[item.category]}`}>
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#666] mt-0.5 font-mono">
                    {item.powerWatts}W · {item.hoursPerDay}h/day · {kwhDay.toFixed(2)} kWh/day
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="text-[#444] hover:text-[#F87171] transition-colors p-1 cursor-pointer disabled:opacity-40 shrink-0"
                >
                  {deletingId === item.id ? <Spinner size={14} /> : <Trash2 size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <AddEquipmentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        aquariumId={aquarium.id}
        onAdded={(item) => onEquipmentChange([...aquarium.equipment, item])}
      />
    </div>
  );
}

// ── Main AquariumDetailPage ───────────────────────────────────────────────────

export default function AquariumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const aquariumId = Number(id);

  const [aquarium, setAquarium] = useState<AquariumDetail | null>(null);
  const [parameters, setParameters] = useState<WaterParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [logOpen, setLogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!aquariumId) return;
    try {
      const [aq, params] = await Promise.all([
        aquariumApi.detail(aquariumId),
        parameterApi.getHistory(aquariumId),
      ]);
      setAquarium(aq);
      setParameters(params);
    } catch {
      navigate('/dashboard', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [aquariumId, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogged = (p: WaterParameter) => setParameters((prev) => [p, ...prev]);

  if (loading || !aquarium) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  const lastParam = parameters[0] ?? null;

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.08)] px-6 py-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-[#A0A0A0] hover:text-white text-sm mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Dashboard
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">{aquarium.name}</h1>
          <span className="text-[10px] font-medium text-[#59D3FF] border border-[rgba(89,211,255,0.30)] rounded px-2 py-0.5">
            {TYPE_LABELS[aquarium.type]}
          </span>
          <span className="text-xs text-[#666]">{aquarium.liters} L</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="overview" className="flex flex-col flex-1">
        <Tabs.List className="flex border-b border-[rgba(255,255,255,0.08)] px-6 overflow-x-auto shrink-0">
          {[
            { value: 'overview', label: 'Overview', icon: <Layers size={14} /> },
            { value: 'parameters', label: 'Parameters', icon: <Waves size={14} /> },
            { value: 'livestock', label: 'Livestock', icon: <Fish size={14} /> },
            { value: 'equipment', label: 'Equipment', icon: <Wrench size={14} /> },
          ].map(({ value, label, icon }) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className="
                flex items-center gap-1.5 px-4 py-3 text-sm whitespace-nowrap
                text-[#A0A0A0] border-b-2 border-transparent -mb-px
                data-[state=active]:text-[#59D3FF] data-[state=active]:border-[#59D3FF]
                hover:text-white transition-all cursor-pointer outline-none
              "
            >
              {icon}{label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="overview" className="flex-1 outline-none">
          <OverviewTab
            aquarium={aquarium}
            lastParam={lastParam}
            onLogClick={() => setLogOpen(true)}
          />
        </Tabs.Content>

        <Tabs.Content value="parameters" className="flex-1 outline-none">
          <ParametersTab
            aquariumId={aquarium.id}
            parameters={parameters}
            onLogged={handleLogged}
          />
        </Tabs.Content>

        <Tabs.Content value="livestock" className="flex-1 outline-none">
          <LivestockTab
            aquarium={aquarium}
            onLivestockChange={(updated) =>
              setAquarium((a) => a ? { ...a, livestock: updated } : a)
            }
          />
        </Tabs.Content>

        <Tabs.Content value="equipment" className="flex-1 outline-none">
          <EquipmentTab
            aquarium={aquarium}
            onEquipmentChange={(updated) =>
              setAquarium((a) => a ? { ...a, equipment: updated } : a)
            }
          />
        </Tabs.Content>
      </Tabs.Root>

      <LogMeasurementModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        aquariumId={aquarium.id}
        onLogged={(p) => { handleLogged(p); setLogOpen(false); }}
      />
    </div>
  );
}
