import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Wrench, TrendingUp, ExternalLink, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { EnergyResponse } from '../../api/equipmentApi';
import { useAquariums } from '../../hooks/queries/useAquariums';
import { useEnergyCalc } from '../../hooks/queries/useEnergyCalc';
import PlanGate from '../../components/shared/PlanGate';
import Button from '../../components/ui/Button';

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcKwh(powerWatts: number, hoursPerDay: number): number {
  return (powerWatts / 1000) * hoursPerDay * 30;
}

function fmt(n: number | undefined | null, decimals = 2): string {
  if (n == null) return '—';
  return n.toFixed(decimals);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  unit,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-5 flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          accent
            ? 'bg-[rgba(89,211,255,0.08)]'
            : 'bg-[rgba(255,255,255,0.04)]'
        }`}
      >
        <Icon size={18} className={accent ? 'text-[#59D3FF]' : 'text-[#A0A0A0]'} />
      </div>
      <div>
        <p className="text-[#666] text-xs mb-0.5">{label}</p>
        <p className="text-white font-mono text-xl font-semibold leading-none">
          {value}
          <span className="text-[#A0A0A0] text-sm font-normal ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-5 h-20" />
        ))}
      </div>
      <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden">
        <div className="h-10 bg-[rgba(255,255,255,0.04)]" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 border-t border-[rgba(255,255,255,0.04)]" />
        ))}
      </div>
    </div>
  );
}

interface ResultsProps {
  data: EnergyResponse;
  aquariumId: number;
}

function EnergyResults({ data, aquariumId }: ResultsProps) {
  const { t } = useTranslation('calculators');
  const navigate = useNavigate();
  const breakdown = data.equipmentBreakdown ?? [];
  const totalKwh = breakdown.reduce(
    (sum, eq) => sum + calcKwh(eq.powerWatts ?? 0, eq.hoursPerDay ?? 0),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard
          label={t('energy.monthlyConsumption')}
          value={fmt(totalKwh, 1)}
          unit="kWh/mes"
          icon={Zap}
          accent
        />
        <SummaryCard
          label={t('energy.estimatedCost')}
          value={fmt(data.totalMonthlyCost)}
          unit={`${data.currencySymbol ?? '€'}/mes`}
          icon={TrendingUp}
          accent
        />
      </div>

      {/* Electricity price note */}
      <p className="text-xs text-[#555] -mt-2">
        Basado en{' '}
        <span className="text-[#A0A0A0]">
          {data.electricityPriceKwh != null
            ? `€${data.electricityPriceKwh.toFixed(4)}/kWh`
            : 'precio por defecto'}
        </span>
        {' · '}
        <button
          onClick={() => navigate('/dashboard/profile')}
          className="text-[#59D3FF] hover:underline cursor-pointer"
        >
          {t('energy.changeInProfile')} →
        </button>
      </p>

      {/* Breakdown table */}
      <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
          <p className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wide">
            {t('energy.breakdown')}
          </p>
        </div>

        {breakdown.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-[#555]">{t('energy.noBreakdown')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-[#555] uppercase tracking-wide">
                    Equipo
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-[#555] uppercase tracking-wide text-right">
                    W
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-[#555] uppercase tracking-wide text-right">
                    h/día
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-[#555] uppercase tracking-wide text-right">
                    kWh/mes
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-[#555] uppercase tracking-wide text-right">
                    €/mes
                  </th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((eq, i) => {
                  const kwhMonth = calcKwh(eq.powerWatts ?? 0, eq.hoursPerDay ?? 0);
                  return (
                    <tr
                      key={eq.equipmentId ?? i}
                      className="border-t border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    >
                      <td className="px-4 py-3 text-white font-medium truncate max-w-[180px]">
                        {eq.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-[#A0A0A0] text-right font-mono">
                        {eq.powerWatts ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-[#A0A0A0] text-right font-mono">
                        {eq.hoursPerDay ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-[#A0A0A0] text-right font-mono">
                        {fmt(kwhMonth, 1)}
                      </td>
                      <td className="px-4 py-3 text-white text-right font-mono font-medium">
                        {fmt(eq.monthlyCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.02)]">
                  <td className="px-4 py-3 text-[#A0A0A0] text-xs font-semibold uppercase tracking-wide" colSpan={3}>
                    Total
                  </td>
                  <td className="px-4 py-3 text-[#59D3FF] text-right font-mono font-semibold">
                    {fmt(totalKwh, 1)}
                  </td>
                  <td className="px-4 py-3 text-[#59D3FF] text-right font-mono font-semibold">
                    {fmt(data.totalMonthlyCost)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-[#444] text-center">
        Estimación basada en 30 días/mes · Fórmula: (W ÷ 1000) × h/día × 30 × €/kWh
      </p>

      <div className="flex justify-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/dashboard/aquarium/${aquariumId}`)}
        >
          <ExternalLink size={13} />
          {t('energy.manageEquipment')}
        </Button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EnergyCalcPage() {
  const { t } = useTranslation('calculators');
  const navigate = useNavigate();
  const { data: aquariums = [], isLoading: loadingAquariums } = useAquariums();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const {
    data: energyData,
    isLoading: loadingEnergy,
    isError,
  } = useEnergyCalc(selectedId);

  return (
    <div className="min-h-full p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap size={22} className="text-[#59D3FF]" />
          {t('energy.title')}
        </h1>
        <p className="text-sm text-[#A0A0A0] mt-1">{t('energy.description')}</p>
      </div>

      <PlanGate feature="calculator_energy">
        <div className="flex flex-col gap-6">
          {/* Aquarium selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
              {t('energy.selectAquarium')}
            </label>
            {loadingAquariums ? (
              <div className="h-12 bg-[rgba(255,255,255,0.04)] rounded-lg animate-pulse" />
            ) : aquariums.length === 0 ? (
              <p className="text-sm text-[#555] py-3">
                No tienes acuarios aún.{' '}
                <a href="/dashboard" className="text-[#59D3FF] hover:underline">
                  Crea uno →
                </a>
              </p>
            ) : (
              <select
                value={selectedId ?? ''}
                onChange={(e) =>
                  setSelectedId(e.target.value ? Number(e.target.value) : null)
                }
                className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors cursor-pointer"
              >
                <option value="">— Elige un acuario —</option>
                {aquariums.map((aq) => (
                  <option key={aq.id} value={aq.id}>
                    {aq.name} ({aq.liters} L)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Results area */}
          {selectedId !== null && (
            <>
              {loadingEnergy && <ResultsSkeleton />}

              {!loadingEnergy && isError && (
                <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-8 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                    <Wrench size={20} className="text-[#555]" />
                  </div>
                  <p className="text-white font-medium text-sm">
                    Error al calcular el consumo. Inténtalo de nuevo.
                  </p>
                </div>
              )}

              {!loadingEnergy && !isError && energyData?.errorCode === 'KWH_PRICE_MISSING' && (
                <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-8 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[rgba(89,211,255,0.06)] border border-[rgba(89,211,255,0.15)] flex items-center justify-center">
                    <AlertCircle size={20} className="text-[#59D3FF]" />
                  </div>
                  <p className="text-white font-medium text-sm">
                    {t('energy.missingKwhPrice')}
                  </p>
                  <p className="text-[#666] text-xs max-w-xs">
                    {t('energy.missingKwhPriceDesc')}
                  </p>
                  <button
                    onClick={() => navigate('/dashboard/profile/settings')}
                    className="mt-1 text-xs font-semibold text-[#59D3FF] hover:underline cursor-pointer"
                  >
                    {t('energy.goToProfile')} →
                  </button>
                </div>
              )}

              {!loadingEnergy && !isError && energyData?.errorCode === 'NO_EQUIPMENT' && (
                <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-8 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                    <Wrench size={20} className="text-[#555]" />
                  </div>
                  <p className="text-white font-medium text-sm">
                    {t('energy.noEquipment')}
                  </p>
                  <p className="text-[#666] text-xs max-w-xs">
                    {t('energy.noEquipmentDesc')}
                  </p>
                  <a
                    href={`/dashboard/aquarium/${selectedId}`}
                    className="mt-1 text-xs font-semibold text-[#59D3FF] hover:underline"
                  >
                    {t('energy.manageEquipment')} →
                  </a>
                </div>
              )}

              {!loadingEnergy && !isError && energyData && !energyData.errorCode && (
                <EnergyResults data={energyData} aquariumId={selectedId} />
              )}
            </>
          )}
        </div>
      </PlanGate>
    </div>
  );
}
