import { useState, useEffect } from 'react';
import { FlaskConical, CheckCircle2, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAquariums } from '../../hooks/queries/useAquariums';
import PlanGate from '../../components/shared/PlanGate';
import Button from '../../components/ui/Button';

// ── Schema ────────────────────────────────────────────────────────────────────

const dosingSchema = z.object({
  volume:     z.coerce.number({ invalid_type_error: 'Requerido' }).min(10, 'Mínimo 10 L').max(50000),
  currentKH:  z.coerce.number().min(0).max(30).default(0),
  targetKH:   z.coerce.number().min(0).max(30).default(0),
  currentCa:  z.coerce.number().min(0).max(700).default(0),
  targetCa:   z.coerce.number().min(0).max(700).default(0),
  currentMg:  z.coerce.number().min(0).max(2000).default(0),
  targetMg:   z.coerce.number().min(0).max(2000).default(0),
  currentNo3: z.coerce.number().min(0).max(200).default(0),
  targetNo3:  z.coerce.number().min(0).max(200).default(5),
});

type DosingFormValues = z.infer<typeof dosingSchema>;

// ── Calculation engine ────────────────────────────────────────────────────────
//
// Formulas based on Randy Holmes-Farley's reef aquarium chemistry:
//   KH  — NaHCO₃: 1g raises 1 dKH in 50 L
//   KH  — 2-Part A: 1 ml raises ~0.033 dKH in 1 L (≈ BRS 2-Part ratio)
//   Ca  — CaCl₂ anhydrous: 1g raises ~2.81 ppm in 100 L
//   Mg  — MgSO₄·7H₂O (Epsom): 9.86% Mg → 0.01014 g/ppm/L
//   Mg  — MgCl₂·6H₂O: 11.96% Mg → 0.00836 g/ppm/L
//   NO₃ — White vinegar 5%: ~1 ml/25 L/5 ppm/day (empirical)

interface Results {
  deltaKH: number; twoPartA_ml: number; bicarb_g: number;
  deltaCa: number; cacl2_g: number;
  deltaMg: number; epsom_g: number; mgcl2_g: number;
  deltaNO3: number; vinegar_ml: number;
}

function calculate(v: DosingFormValues): Results {
  const dKH  = Math.max(0, v.targetKH  - v.currentKH);
  const dCa  = Math.max(0, v.targetCa  - v.currentCa);
  const dMg  = Math.max(0, v.targetMg  - v.currentMg);
  const dNO3 = Math.max(0, v.currentNo3 - v.targetNo3);
  return {
    deltaKH:     dKH,
    twoPartA_ml: dKH  > 0 ? dKH  * v.volume / 30          : 0,
    bicarb_g:    dKH  > 0 ? dKH  * v.volume / 50          : 0,
    deltaCa:     dCa,
    cacl2_g:     dCa  > 0 ? dCa  * v.volume / 281         : 0,
    deltaMg:     dMg,
    epsom_g:     dMg  > 0 ? dMg  * v.volume * 0.01014     : 0,
    mgcl2_g:     dMg  > 0 ? dMg  * v.volume * 0.00836     : 0,
    deltaNO3:    dNO3,
    vinegar_ml:  dNO3 > 0 ? dNO3 * v.volume / 125         : 0,
  };
}

// ── UI helpers ────────────────────────────────────────────────────────────────

const PARAM_INPUT_CLASS =
  'w-20 bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-2 py-2 text-sm text-white text-center outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors font-mono';

function OkRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-2.5 px-4 text-sm text-[#555]">
      <CheckCircle2 size={14} className="text-emerald-500/60 shrink-0" />
      <span>{label} — sin ajuste necesario</span>
    </div>
  );
}

interface DoseRowProps {
  dot: string;
  label: string;
  value: number;
  unit: string;
  note?: string;
}

function DoseRow({ dot, label, value, unit, note }: DoseRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-4">
      <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      <span className="text-sm text-[#A0A0A0] flex-1">{label}</span>
      {note && <span className="text-[10px] text-[#444] mr-1">{note}</span>}
      <span className="font-mono text-sm font-semibold text-white">
        {value.toFixed(value < 10 ? 2 : 1)}
        <span className="text-[#555] font-normal ml-1">{unit}</span>
      </span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DosingCalcPage() {
  const { data: aquariums = [] } = useAquariums();
  const [results, setResults] = useState<Results | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DosingFormValues>({
    resolver: zodResolver(dosingSchema),
    defaultValues: {
      volume: 200,
      currentKH: 6,   targetKH: 8,
      currentCa: 380,  targetCa: 420,
      currentMg: 1280, targetMg: 1350,
      currentNo3: 10,  targetNo3: 5,
    },
  });

  // Hide results as soon as any field changes
  useEffect(() => {
    const sub = watch(() => setResults(null));
    return () => sub.unsubscribe();
  }, [watch]);

  const onSubmit = (values: DosingFormValues) => setResults(calculate(values));

  const handleAquariumSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const aq = aquariums.find((a) => a.id === Number(e.target.value));
    if (aq) setValue('volume', aq.liters, { shouldDirty: true });
  };

  return (
    <div className="min-h-full p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FlaskConical size={22} className="text-[#59D3FF]" />
          Calculadora de Dosis
        </h1>
        <p className="text-sm text-[#A0A0A0] mt-1">
          Calcula las dosis exactas de aditivos para alcanzar tus parámetros objetivo.
        </p>
      </div>

      <PlanGate feature="calculator_dosage">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

          {/* Volume row */}
          <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
                Acuario (opcional)
              </label>
              <select
                onChange={handleAquariumSelect}
                defaultValue=""
                className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors cursor-pointer"
              >
                <option value="">— Seleccionar para prellenar volumen —</option>
                {aquariums.map((aq) => (
                  <option key={aq.id} value={aq.id}>
                    {aq.name} ({aq.liters} L)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
                Volumen neto (L)
              </label>
              <input
                type="number"
                min={10}
                {...register('volume')}
                className={[
                  PARAM_INPUT_CLASS,
                  'w-24',
                  errors.volume ? 'border-[rgba(248,113,113,0.50)]' : '',
                ].join(' ')}
              />
              {errors.volume && (
                <p className="text-xs text-red-400">{errors.volume.message}</p>
              )}
            </div>
          </div>

          {/* Parameters table */}
          <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-2.5 bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.06)]">
              <span className="text-[10px] font-semibold text-[#555] uppercase tracking-wide">Parámetro</span>
              <span className="text-[10px] font-semibold text-[#555] uppercase tracking-wide w-20 text-center">Actual</span>
              <ChevronRight size={12} className="text-[#333]" />
              <span className="text-[10px] font-semibold text-[#555] uppercase tracking-wide w-20 text-center">Objetivo</span>
            </div>

            {/* KH */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.04)]">
              <div>
                <span className="text-sm text-white">KH</span>
                <span className="text-xs text-[#555] ml-1.5">dKH</span>
              </div>
              <input type="number" step="0.1" min={0} max={30} {...register('currentKH')} className={PARAM_INPUT_CLASS} />
              <ChevronRight size={12} className="text-[#333]" />
              <input type="number" step="0.1" min={0} max={30} {...register('targetKH')}  className={PARAM_INPUT_CLASS} />
            </div>

            {/* Calcium */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.04)]">
              <div>
                <span className="text-sm text-white">Calcio</span>
                <span className="text-xs text-[#555] ml-1.5">ppm</span>
              </div>
              <input type="number" step="1" min={0} max={700} {...register('currentCa')} className={PARAM_INPUT_CLASS} />
              <ChevronRight size={12} className="text-[#333]" />
              <input type="number" step="1" min={0} max={700} {...register('targetCa')}  className={PARAM_INPUT_CLASS} />
            </div>

            {/* Magnesium */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.04)]">
              <div>
                <span className="text-sm text-white">Magnesio</span>
                <span className="text-xs text-[#555] ml-1.5">ppm</span>
              </div>
              <input type="number" step="1" min={0} max={2000} {...register('currentMg')} className={PARAM_INPUT_CLASS} />
              <ChevronRight size={12} className="text-[#333]" />
              <input type="number" step="1" min={0} max={2000} {...register('targetMg')}  className={PARAM_INPUT_CLASS} />
            </div>

            {/* Nitrates */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-3">
              <div>
                <span className="text-sm text-white">Nitratos</span>
                <span className="text-xs text-[#555] ml-1.5">ppm</span>
              </div>
              <input type="number" step="0.5" min={0} max={200} {...register('currentNo3')} className={PARAM_INPUT_CLASS} />
              <ChevronRight size={12} className="text-[#333]" />
              <input type="number" step="0.5" min={0} max={200} {...register('targetNo3')}  className={PARAM_INPUT_CLASS} />
            </div>
          </div>

          <Button type="submit" variant="primary" size="md" className="self-end">
            <FlaskConical size={15} />
            Calcular
          </Button>
        </form>

        {/* Results */}
        {results && (
          <div className="mt-6 bg-black border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
              <p className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wide">
                Dosis recomendadas
              </p>
            </div>

            {/* KH group */}
            {results.deltaKH === 0 ? (
              <OkRow label="KH / Alcalinidad" />
            ) : (
              <>
                <DoseRow
                  dot="bg-blue-400"
                  label="2-Part Parte A (alcalinidad)"
                  value={results.twoPartA_ml}
                  unit="ml"
                  note="dosis única"
                />
                <DoseRow
                  dot="bg-blue-300"
                  label="Bicarbonato sódico (NaHCO₃)"
                  value={results.bicarb_g}
                  unit="g"
                  note="alternativa"
                />
              </>
            )}

            <div className="border-t border-[rgba(255,255,255,0.04)]" />

            {/* Calcium group */}
            {results.deltaCa === 0 ? (
              <OkRow label="Calcio" />
            ) : (
              <DoseRow
                dot="bg-cyan-400"
                label="Cloruro de calcio (CaCl₂)"
                value={results.cacl2_g}
                unit="g"
                note="dosis única"
              />
            )}

            <div className="border-t border-[rgba(255,255,255,0.04)]" />

            {/* Magnesium group */}
            {results.deltaMg === 0 ? (
              <OkRow label="Magnesio" />
            ) : (
              <>
                <DoseRow
                  dot="bg-emerald-400"
                  label="Sales de Epsom (MgSO₄·7H₂O)"
                  value={results.epsom_g}
                  unit="g"
                  note="dosis única"
                />
                <DoseRow
                  dot="bg-emerald-300"
                  label="Cloruro de magnesio (MgCl₂·6H₂O)"
                  value={results.mgcl2_g}
                  unit="g"
                  note="alternativa"
                />
              </>
            )}

            <div className="border-t border-[rgba(255,255,255,0.04)]" />

            {/* Nitrates group */}
            {results.deltaNO3 === 0 ? (
              <OkRow label="Nitratos" />
            ) : (
              <DoseRow
                dot="bg-orange-400"
                label="Vinagre blanco 5% (reducción NO₃)"
                value={results.vinegar_ml}
                unit="ml/día"
              />
            )}

            {/* Disclaimer */}
            <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.04)] bg-[rgba(255,200,0,0.03)]">
              <p className="text-[11px] text-[#444] leading-relaxed">
                ⚠️ Valores orientativos. Las concentraciones reales varían según el producto comercial.
                Añade los aditivos gradualmente y verifica con un test antes de dosificar de nuevo.
              </p>
            </div>
          </div>
        )}
      </PlanGate>
    </div>
  );
}
