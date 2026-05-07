import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Plus,
  Fish,
  Wrench,
  Trash2,
  Pencil,
  Layers,
  Waves,
  TriangleAlert,
  CheckCircle2,
  Clock,
  Settings,
  Download,
} from 'lucide-react';
import type { AquariumDetail, AquariumType, LivestockCategory, EquipmentCategory, LivestockItem, EquipmentItem } from '../../types/aquarium';
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
import EmptyState from '../../components/shared/EmptyState';
import { toast } from '../../lib/toast';
import ParameterChartSkeleton from '../../components/shared/skeletons/ParameterChartSkeleton';
import ReefSafeBadge from '../../components/shared/ReefSafeBadge';
import PlanGate from '../../components/shared/PlanGate';
import ParameterLineChart from '../../components/charts/ParameterLineChart';
import Sparkline from '../../components/shared/Sparkline';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ImageUploader from '../../components/shared/ImageUploader';
import ImagePlaceholder from '../../components/shared/ImagePlaceholder';
import { measurementLogSchema, type MeasurementLogFormValues } from '../../lib/schemas/parameter.schemas';
import { livestockSchema, type LivestockFormValues } from '../../lib/schemas/livestock.schemas';
import { equipmentSchema, type EquipmentFormValues } from '../../lib/schemas/equipment.schemas';
import { parameterApi } from '../../api/parameterApi';
import { useAquarium } from '../../hooks/queries/useAquarium';
import { useWaterParameters } from '../../hooks/queries/useWaterParameters';
import { useLogParameter } from '../../hooks/mutations/useLogParameter';
import { useAddLivestock } from '../../hooks/mutations/useAddLivestock';
import { useUpdateLivestock } from '../../hooks/mutations/useUpdateLivestock';
import { useDeleteLivestock } from '../../hooks/mutations/useDeleteLivestock';
import { useAddEquipment } from '../../hooks/mutations/useAddEquipment';
import { useUpdateEquipment } from '../../hooks/mutations/useUpdateEquipment';
import { useDeleteEquipment } from '../../hooks/mutations/useDeleteEquipment';
import AquariumSettingsModal from './AquariumSettingsModal';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const STATUS_COLORS: Record<ParameterStatus, string> = {
  good:    '#34D399',
  warning: '#FBBF24',
  danger:  '#F87171',
  unknown: '#666666',
};

// ── Log Measurement Modal ─────────────────────────────────────────────────────

interface LogModalProps {
  open: boolean;
  onClose: () => void;
  aquariumId: number;
}

function LogMeasurementModal({ open, onClose, aquariumId }: LogModalProps) {
  const { t } = useTranslation('aquarium');
  const { t: tc } = useTranslation('common');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MeasurementLogFormValues>({ resolver: zodResolver(measurementLogSchema) });

  const { mutate, isPending } = useLogParameter();

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = (data: MeasurementLogFormValues) => {
    const payload: WaterParameterRequest = {};
    for (const key of PARAMETER_KEYS) {
      const v = data[key];
      if (v !== undefined && v !== null) payload[key] = v;
    }
    mutate({ aquariumId, data: payload }, { onSuccess: handleClose });
  };

  return (
    <Modal open={open} onClose={handleClose} title={t('parameters.logModal.title')} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <p className="text-xs text-[#666] mb-4">{t('parameters.logModal.hint')}</p>
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
                {...register(key)}
                error={errors[key]?.message}
              />
            );
          })}
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <Button type="button" variant="ghost" size="md" onClick={handleClose}>{tc('cancel')}</Button>
          <Button type="submit" variant="primary" size="md" disabled={isPending}>
            {isPending ? t('parameters.logModal.saving') : t('parameters.logModal.submit')}
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
}

function AddLivestockModal({ open, onClose, aquariumId, aquariumType }: AddLivestockModalProps) {
  const { t } = useTranslation('aquarium');
  const { t: tc } = useTranslation('common');
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<LivestockFormValues>({
    resolver: zodResolver(livestockSchema),
    defaultValues: { category: 'FISH', reefSafe: true, quantity: 1 },
  });

  const { mutate, isPending } = useAddLivestock();
  const reefSafe = watch('reefSafe');
  const handleClose = () => { reset(); onClose(); };

  const onSubmit = (data: LivestockFormValues) => {
    mutate(
      { aquariumId, data: { ...data, name: data.name.trim() } },
      {
        onSuccess: (res) => {
          if (res.warning) toast.info(res.warning);
          handleClose();
        },
      }
    );
  };

  return (
    <Modal open={open} onClose={handleClose} title={t('livestock.addModal.title')}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label={t('livestock.addModal.name')}
          placeholder={t('livestock.addModal.namePlaceholder')}
          {...register('name')}
          error={errors.name?.message}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
            {t('livestock.addModal.category')}
          </label>
          <select
            {...register('category')}
            className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors cursor-pointer"
          >
            <option value="FISH">{t('livestock.addModal.categories.FISH')}</option>
            <option value="CORAL">{t('livestock.addModal.categories.CORAL')}</option>
            <option value="INVERTEBRATE">{t('livestock.addModal.categories.INVERTEBRATE')}</option>
          </select>
        </div>
        <Input
          label={t('livestock.addModal.quantity')}
          type="number"
          min={1}
          {...register('quantity')}
          error={errors.quantity?.message}
        />
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('reefSafe')}
            className="w-4 h-4 accent-[#59D3FF]"
          />
          <span className="text-sm text-[#A0A0A0]">{t('livestock.addModal.reefSafe')}</span>
        </label>
        {aquariumType === 'REEF' && !reefSafe && (
          <div className="flex items-start gap-2 bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.20)] rounded-lg p-3">
            <TriangleAlert size={14} className="text-[#F87171] mt-0.5 shrink-0" />
            <p className="text-xs text-[#F87171]">{t('livestock.reefSafeWarning')}</p>
          </div>
        )}
        <Controller
          name="imageUrl"
          control={control}
          render={({ field }) => (
            <ImageUploader
              value={field.value ?? null}
              onChange={field.onChange}
              folder="livestock"
              label="Imagen (opcional)"
            />
          )}
        />
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" size="md" onClick={handleClose}>{tc('cancel')}</Button>
          <Button type="submit" variant="primary" size="md" disabled={isPending}>
            {isPending ? t('livestock.addModal.adding') : t('actions.addAnimal')}
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
}

function AddEquipmentModal({ open, onClose, aquariumId }: AddEquipmentModalProps) {
  const { t } = useTranslation('aquarium');
  const { t: tc } = useTranslation('common');
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: { category: 'OTHER' },
  });

  const { mutate, isPending } = useAddEquipment();
  const handleClose = () => { reset(); onClose(); };

  const onSubmit = (data: EquipmentFormValues) => {
    mutate(
      { aquariumId, data: { ...data, name: data.name.trim() } },
      { onSuccess: handleClose }
    );
  };

  return (
    <Modal open={open} onClose={handleClose} title={t('equipment.addModal.title')}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label={t('equipment.addModal.name')}
          placeholder={t('equipment.addModal.namePlaceholder')}
          {...register('name')}
          error={errors.name?.message}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
            {t('equipment.addModal.category')}
          </label>
          <select
            {...register('category')}
            className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors cursor-pointer"
          >
            <option value="LIGHT">{t('equipment.addModal.categories.LIGHT')}</option>
            <option value="PUMP">{t('equipment.addModal.categories.PUMP')}</option>
            <option value="SKIMMER">{t('equipment.addModal.categories.SKIMMER')}</option>
            <option value="HEATER">{t('equipment.addModal.categories.HEATER')}</option>
            <option value="OTHER">{t('equipment.addModal.categories.OTHER')}</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('equipment.addModal.power')}
            type="number"
            min={1}
            placeholder={t('equipment.addModal.powerPlaceholder')}
            {...register('powerWatts')}
            error={errors.powerWatts?.message}
          />
          <Input
            label={t('equipment.addModal.hours')}
            type="number"
            min={0.1}
            max={24}
            step={0.5}
            placeholder={t('equipment.addModal.hoursPlaceholder')}
            {...register('hoursPerDay')}
            error={errors.hoursPerDay?.message}
          />
        </div>
        <Controller
          name="imageUrl"
          control={control}
          render={({ field }) => (
            <ImageUploader
              value={field.value ?? null}
              onChange={field.onChange}
              folder="equipment"
              label="Imagen (opcional)"
            />
          )}
        />
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" size="md" onClick={handleClose}>{tc('cancel')}</Button>
          <Button type="submit" variant="primary" size="md" disabled={isPending}>
            {isPending ? t('equipment.addModal.adding') : t('actions.addEquipment')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Edit Livestock Modal ──────────────────────────────────────────────────────

interface EditLivestockModalProps {
  open: boolean;
  onClose: () => void;
  aquariumId: number;
  aquariumType: AquariumType;
  item: LivestockItem;
}

function EditLivestockModal({ open, onClose, aquariumId, aquariumType, item }: EditLivestockModalProps) {
  const { t } = useTranslation('aquarium');
  const { t: tc } = useTranslation('common');
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<LivestockFormValues>({
    resolver: zodResolver(livestockSchema),
  });

  const { mutate, isPending } = useUpdateLivestock();
  const reefSafe = watch('reefSafe');

  useEffect(() => {
    if (open) {
      reset({
        name: item.name,
        category: item.category,
        reefSafe: item.reefSafe,
        quantity: item.quantity,
        imageUrl: item.imageUrl ?? undefined,
      });
    }
  }, [open, item, reset]);

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = (data: LivestockFormValues) => {
    mutate(
      { aquariumId, itemId: item.id, data: { ...data, name: data.name.trim() } },
      { onSuccess: handleClose }
    );
  };

  return (
    <Modal open={open} onClose={handleClose} title={t('livestock.editModal.title', { defaultValue: 'Editar animal' })}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label={t('livestock.addModal.name')}
          placeholder={t('livestock.addModal.namePlaceholder')}
          {...register('name')}
          error={errors.name?.message}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
            {t('livestock.addModal.category')}
          </label>
          <select
            {...register('category')}
            className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors cursor-pointer"
          >
            <option value="FISH">{t('livestock.addModal.categories.FISH')}</option>
            <option value="CORAL">{t('livestock.addModal.categories.CORAL')}</option>
            <option value="INVERTEBRATE">{t('livestock.addModal.categories.INVERTEBRATE')}</option>
          </select>
        </div>
        <Input
          label={t('livestock.addModal.quantity')}
          type="number"
          min={1}
          {...register('quantity')}
          error={errors.quantity?.message}
        />
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('reefSafe')}
            className="w-4 h-4 accent-[#59D3FF]"
          />
          <span className="text-sm text-[#A0A0A0]">{t('livestock.addModal.reefSafe')}</span>
        </label>
        {aquariumType === 'REEF' && !reefSafe && (
          <div className="flex items-start gap-2 bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.20)] rounded-lg p-3">
            <TriangleAlert size={14} className="text-[#F87171] mt-0.5 shrink-0" />
            <p className="text-xs text-[#F87171]">{t('livestock.reefSafeWarning')}</p>
          </div>
        )}
        <Controller
          name="imageUrl"
          control={control}
          render={({ field }) => (
            <ImageUploader
              value={field.value ?? null}
              onChange={field.onChange}
              folder="livestock"
              label="Imagen (opcional)"
            />
          )}
        />
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" size="md" onClick={handleClose}>{tc('cancel')}</Button>
          <Button type="submit" variant="primary" size="md" disabled={isPending}>
            {isPending ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Edit Equipment Modal ──────────────────────────────────────────────────────

interface EditEquipmentModalProps {
  open: boolean;
  onClose: () => void;
  aquariumId: number;
  item: EquipmentItem;
}

function EditEquipmentModal({ open, onClose, aquariumId, item }: EditEquipmentModalProps) {
  const { t } = useTranslation('aquarium');
  const { t: tc } = useTranslation('common');
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
  });

  const { mutate, isPending } = useUpdateEquipment();

  useEffect(() => {
    if (open) {
      reset({
        name: item.name,
        powerWatts: item.powerWatts,
        hoursPerDay: item.hoursPerDay,
        category: item.category ?? undefined,
        imageUrl: item.imageUrl ?? undefined,
      });
    }
  }, [open, item, reset]);

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = (data: EquipmentFormValues) => {
    mutate(
      { aquariumId, itemId: item.id, data: { ...data, name: data.name.trim() } },
      { onSuccess: handleClose }
    );
  };

  return (
    <Modal open={open} onClose={handleClose} title={t('equipment.editModal.title', { defaultValue: 'Editar equipo' })}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label={t('equipment.addModal.name')}
          placeholder={t('equipment.addModal.namePlaceholder')}
          {...register('name')}
          error={errors.name?.message}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
            {t('equipment.addModal.category')}
          </label>
          <select
            {...register('category')}
            className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors cursor-pointer"
          >
            <option value="LIGHT">{t('equipment.addModal.categories.LIGHT')}</option>
            <option value="PUMP">{t('equipment.addModal.categories.PUMP')}</option>
            <option value="SKIMMER">{t('equipment.addModal.categories.SKIMMER')}</option>
            <option value="HEATER">{t('equipment.addModal.categories.HEATER')}</option>
            <option value="OTHER">{t('equipment.addModal.categories.OTHER')}</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('equipment.addModal.power')}
            type="number"
            min={1}
            placeholder={t('equipment.addModal.powerPlaceholder')}
            {...register('powerWatts')}
            error={errors.powerWatts?.message}
          />
          <Input
            label={t('equipment.addModal.hours')}
            type="number"
            min={0.1}
            max={24}
            step={0.5}
            placeholder={t('equipment.addModal.hoursPlaceholder')}
            {...register('hoursPerDay')}
            error={errors.hoursPerDay?.message}
          />
        </div>
        <Controller
          name="imageUrl"
          control={control}
          render={({ field }) => (
            <ImageUploader
              value={field.value ?? null}
              onChange={field.onChange}
              folder="equipment"
              label="Imagen (opcional)"
            />
          )}
        />
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" size="md" onClick={handleClose}>{tc('cancel')}</Button>
          <Button type="submit" variant="primary" size="md" disabled={isPending}>
            {isPending ? 'Guardando…' : 'Guardar cambios'}
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
  parameters: WaterParameter[];
  onLogClick: () => void;
}

function OverviewTab({ aquarium, lastParam, parameters, onLogClick }: OverviewTabProps) {
  const { t } = useTranslation('aquarium');
  const fishCount = aquarium.livestock.filter((l) => l.category === 'FISH').reduce((a, l) => a + l.quantity, 0);
  const coralCount = aquarium.livestock.filter((l) => l.category === 'CORAL').reduce((a, l) => a + l.quantity, 0);
  const invertCount = aquarium.livestock.filter((l) => l.category === 'INVERTEBRATE').reduce((a, l) => a + l.quantity, 0);

  const sparkData: Record<ParameterKey, number[]> = {} as Record<ParameterKey, number[]>;
  for (const key of PARAMETER_KEYS) {
    sparkData[key] = parameters
      .slice(0, 7)
      .map((p) => p[key])
      .filter((v): v is number => v !== null && v !== undefined)
      .reverse();
  }

  return (
    <div className="p-6 space-y-6">
      {/* Parameters snapshot */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">{t('overview.currentParams')}</h3>
          <Button variant="secondary" size="sm" onClick={onLogClick}>
            <Plus size={14} className="mr-1" />
            {t('actions.logMeasurement')}
          </Button>
        </div>
        {!lastParam ? (
          <div className="border border-dashed border-[rgba(255,255,255,0.08)] rounded-xl py-10 text-center">
            <p className="text-[#666] text-sm">{t('overview.noMeasurements')}</p>
            <button onClick={onLogClick} className="text-[#59D3FF] text-sm mt-1 hover:underline cursor-pointer">
              {t('overview.logFirst')}
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
                  <p className={`font-mono text-xl font-medium ${value !== null ? 'text-white' : 'text-text-tertiary'}`}>
                    {formatParamValue(key, value)}
                    {value !== null && r.unit && (
                      <span className="text-xs text-[#666] ml-1">{r.unit}</span>
                    )}
                  </p>
                  <p className="text-[10px] text-text-tertiary mt-1">
                    {t('overview.optimal', { min: r.min, max: r.max })} {r.unit}
                  </p>
                  <Sparkline data={sparkData[key]} color={STATUS_COLORS[status]} />
                </div>
              );
            })}
          </div>
        )}
        {lastParam && (
          <p className="text-[11px] text-text-tertiary mt-2">
            {t('overview.lastLogged', { date: formatDate(lastParam.measuredAt) })}
          </p>
        )}
      </div>

      {/* Quick stats */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">{t('overview.quickStats')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t('overview.fish'), value: fishCount, color: 'text-[#59D3FF]' },
            { label: t('overview.corals'), value: coralCount, color: 'text-[#FBBF24]' },
            { label: t('overview.invertebrates'), value: invertCount, color: 'text-[#34D399]' },
            { label: t('overview.equipment'), value: aquarium.equipment.length, color: 'text-[#A0A0A0]' },
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
}

function ParametersTab({ aquariumId, parameters }: ParametersTabProps) {
  const { t } = useTranslation('aquarium');
  const [activeParam, setActiveParam] = useState<ParameterKey>('temperature');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [logOpen, setLogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const filtered = filterByTimeRange(parameters, timeRange);
  const r = PARAMETER_RANGES[activeParam];

  const handleExport = async () => {
    setExporting(true);
    try {
      await parameterApi.exportCsv(aquariumId);
    } finally {
      setExporting(false);
    }
  };

  const timeRangeKeys: TimeRange[] = ['7d', '30d', '3m', 'all'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-2">
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
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            disabled={exporting || parameters.length === 0}
            title={parameters.length === 0 ? t('actions.exportCsv') : t('actions.exportCsv')}
          >
            <Download size={14} className="mr-1" />
            {exporting ? t('actions.exporting') : t('actions.exportCsv')}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setLogOpen(true)}>
            <Plus size={14} className="mr-1" />
            {t('actions.log')}
          </Button>
        </div>
      </div>

      {/* Time filter */}
      <div className="flex items-center gap-2">
        {timeRangeKeys.map((tr) => (
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
            {t(`parameters.timeRanges.${tr}`)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-white">{r.label}</span>
          {r.unit && <span className="text-xs text-[#666]">({r.unit})</span>}
          <span className="text-[10px] text-text-tertiary ml-auto">
            {t('overview.optimal', { min: r.min, max: r.max })}
          </span>
        </div>
        <ParameterLineChart parameters={filtered} paramKey={activeParam} />
      </div>

      {/* History table */}
      {parameters.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">{t('parameters.history')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left py-2 pr-4 text-[#666] font-medium">{t('parameters.date')}</th>
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
                            'text-text-tertiary',
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
      />
    </div>
  );
}

// ── Tab: Livestock ────────────────────────────────────────────────────────────

interface LivestockTabProps {
  aquarium: AquariumDetail;
}

function LivestockTab({ aquarium }: LivestockTabProps) {
  const { t } = useTranslation('aquarium');
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<LivestockItem | null>(null);
  const { mutate: deleteLivestock } = useDeleteLivestock();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          {t('livestock.count', { count: aquarium.livestock.length })}
        </h3>
        <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} className="mr-1" />
          {t('actions.addAnimal')}
        </Button>
      </div>

      {aquarium.livestock.length === 0 ? (
        <EmptyState
          icon={Fish}
          title={t('livestock.empty.title')}
          description={t('livestock.empty.description')}
          action={
            <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
              <Plus size={14} className="mr-1" />
              {t('actions.addAnimal')}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {aquarium.livestock.map((item) => (
            <div
              key={item.id}
              className="bg-[#0a0a0a] border border-white/[0.07] rounded-lg flex flex-col overflow-hidden"
            >
              {/* Strict image container — aspect-square + overflow-hidden prevent any resize */}
              <div className="aspect-square w-full overflow-hidden shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <ImagePlaceholder entityType="livestock" className="w-full h-full" />
                )}
              </div>
              {/* Info */}
              <div className="p-2 flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-white truncate leading-tight">{item.name}</p>
                    <p className="text-[10px] text-[#555] mt-0.5">×{item.quantity}</p>
                  </div>
                  <div className="flex items-center shrink-0 -mr-1">
                    <button
                      onClick={() => setEditItem(item)}
                      aria-label={`Edit ${item.name}`}
                      className="p-1 text-[#444] hover:text-white transition-colors"
                    >
                      <Pencil size={10} />
                    </button>
                    <button
                      onClick={() => deleteLivestock({ aquariumId: aquarium.id, itemId: item.id })}
                      aria-label={`Delete ${item.name}`}
                      className="p-1 text-[#444] hover:text-[#F87171] transition-colors"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className={`text-[9px] font-semibold px-1.5 py-px rounded-full border leading-none ${CATEGORY_COLORS[item.category]}`}>
                    {t(`livestock.addModal.categories.${item.category}`)}
                  </span>
                  <ReefSafeBadge reefSafe={item.reefSafe} />
                </div>
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
      />
      {editItem && (
        <EditLivestockModal
          open={!!editItem}
          onClose={() => setEditItem(null)}
          aquariumId={aquarium.id}
          aquariumType={aquarium.type}
          item={editItem}
        />
      )}
    </div>
  );
}

// ── Tab: Equipment ────────────────────────────────────────────────────────────

interface EquipmentTabProps {
  aquarium: AquariumDetail;
}

function EquipmentTab({ aquarium }: EquipmentTabProps) {
  const { t } = useTranslation('aquarium');
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<EquipmentItem | null>(null);
  const { mutate: deleteEquipment } = useDeleteEquipment();

  const totalWatts = aquarium.equipment.reduce((a, e) => a + e.powerWatts, 0);
  const totalKwhMonth = aquarium.equipment.reduce(
    (a, e) => a + (e.powerWatts / 1000) * e.hoursPerDay * 30,
    0
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          {t('equipment.count', { count: aquarium.equipment.length })}
        </h3>
        <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} className="mr-1" />
          {t('actions.addEquipment')}
        </Button>
      </div>

      {/* Energy summary — ReefMaster only */}
      {aquarium.equipment.length > 0 && (
        <PlanGate feature="calculator_energy">
          <div className="grid grid-cols-2 gap-3 bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
            <div>
              <p className="text-[#666] text-xs mb-1">{t('equipment.totalPower')}</p>
              <p className="font-mono text-xl text-white">{totalWatts}<span className="text-xs text-[#666] ml-1">W</span></p>
            </div>
            <div>
              <p className="text-[#666] text-xs mb-1">{t('equipment.estMonthly')}</p>
              <p className="font-mono text-xl text-white">{totalKwhMonth.toFixed(1)}<span className="text-xs text-[#666] ml-1">kWh</span></p>
            </div>
          </div>
        </PlanGate>
      )}

      {aquarium.equipment.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title={t('equipment.empty.title')}
          description={t('equipment.empty.description')}
          action={
            <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
              <Plus size={14} className="mr-1" />
              {t('actions.addEquipment')}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {aquarium.equipment.map((item) => {
            const kwhDay = (item.powerWatts / 1000) * item.hoursPerDay;
            return (
              <div
                key={item.id}
                className="bg-[#0a0a0a] border border-white/[0.07] rounded-lg flex flex-col overflow-hidden"
              >
                {/* Strict image container — aspect-square + overflow-hidden prevent any resize */}
                <div className="aspect-square w-full overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <ImagePlaceholder entityType="equipment" className="w-full h-full" />
                  )}
                </div>
                {/* Info */}
                <div className="p-2 flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-white truncate leading-tight">{item.name}</p>
                      <p className="text-[10px] text-[#555] font-mono mt-0.5">
                        {item.powerWatts}W · {item.hoursPerDay}h · {kwhDay.toFixed(1)}kWh
                      </p>
                    </div>
                    <div className="flex items-center shrink-0 -mr-1">
                      <button
                        onClick={() => setEditItem(item)}
                        aria-label={`Edit ${item.name}`}
                        className="p-1 text-[#444] hover:text-white transition-colors"
                      >
                        <Pencil size={10} />
                      </button>
                      <button
                        onClick={() => deleteEquipment({ aquariumId: aquarium.id, itemId: item.id })}
                        aria-label={`Delete ${item.name}`}
                        className="p-1 text-[#444] hover:text-[#F87171] transition-colors"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                  {item.category && (
                    <span className={`text-[9px] font-semibold px-1.5 py-px rounded-full self-start leading-none ${EQUIP_CATEGORY_COLORS[item.category]}`}>
                      {t(`equipment.addModal.categories.${item.category}`)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddEquipmentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        aquariumId={aquarium.id}
      />
      {editItem && (
        <EditEquipmentModal
          open={!!editItem}
          onClose={() => setEditItem(null)}
          aquariumId={aquarium.id}
          item={editItem}
        />
      )}
    </div>
  );
}

// ── Main AquariumDetailPage ───────────────────────────────────────────────────

export default function AquariumDetailPage() {
  const { t } = useTranslation('aquarium');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const aquariumId = Number(id);
  const [logOpen, setLogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: aquarium, isLoading, error, refetch } = useAquarium(aquariumId);
  const { data: parameters = [] } = useWaterParameters(aquariumId);

  const is404 = (error as { response?: { status?: number } })?.response?.status === 404;

  useEffect(() => {
    if (is404) navigate('/dashboard', { replace: true });
  }, [is404, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-full flex flex-col">
        <div className="border-b border-[rgba(255,255,255,0.08)] px-6 py-4 animate-pulse">
          <div className="h-3 w-20 bg-[rgba(255,255,255,0.05)] rounded mb-3" />
          <div className="flex items-center gap-3">
            <div className="h-5 w-40 bg-[rgba(255,255,255,0.07)] rounded" />
            <div className="h-4 w-12 bg-[rgba(255,255,255,0.05)] rounded" />
            <div className="h-3 w-8 bg-[rgba(255,255,255,0.04)] rounded" />
          </div>
        </div>
        <div className="flex border-b border-[rgba(255,255,255,0.08)] px-6 gap-1 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-[rgba(255,255,255,0.04)] rounded my-1" />
          ))}
        </div>
        <div className="flex-1">
          <ParameterChartSkeleton />
        </div>
      </div>
    );
  }

  if (error && !is404) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4">
        <p className="text-[#A0A0A0] text-sm">{t('error')}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded bg-[#59D3FF] text-[#0A0F1E] text-sm font-medium hover:bg-[#7DDEFF] transition-colors cursor-pointer"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  if (!aquarium) return null;

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
          {t('backToDashboard')}
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">{aquarium.name}</h1>
            <span className="text-[10px] font-medium text-[#59D3FF] border border-[rgba(89,211,255,0.30)] rounded px-2 py-0.5">
              {t(`types.${aquarium.type as AquariumType}`)}
            </span>
            <span className="text-xs text-[#666]">{aquarium.liters} L</span>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Aquarium settings"
            className="text-[#666] hover:text-white transition-colors p-1 cursor-pointer"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="overview" className="flex flex-col flex-1">
        <Tabs.List className="flex border-b border-[rgba(255,255,255,0.08)] px-6 overflow-x-auto shrink-0">
          {[
            { value: 'overview', labelKey: 'tabs.overview', icon: <Layers size={14} /> },
            { value: 'parameters', labelKey: 'tabs.parameters', icon: <Waves size={14} /> },
            { value: 'livestock', labelKey: 'tabs.livestock', icon: <Fish size={14} /> },
            { value: 'equipment', labelKey: 'tabs.equipment', icon: <Wrench size={14} /> },
          ].map(({ value, labelKey, icon }) => (
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
              {icon}{t(labelKey)}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="overview" className="flex-1 outline-none">
          <OverviewTab
            aquarium={aquarium}
            lastParam={lastParam}
            parameters={parameters}
            onLogClick={() => setLogOpen(true)}
          />
        </Tabs.Content>

        <Tabs.Content value="parameters" className="flex-1 outline-none">
          <ParametersTab
            aquariumId={aquarium.id}
            parameters={parameters}
          />
        </Tabs.Content>

        <Tabs.Content value="livestock" className="flex-1 outline-none">
          <LivestockTab aquarium={aquarium} />
        </Tabs.Content>

        <Tabs.Content value="equipment" className="flex-1 outline-none">
          <EquipmentTab aquarium={aquarium} />
        </Tabs.Content>
      </Tabs.Root>

      <LogMeasurementModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        aquariumId={aquarium.id}
      />

      <AquariumSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        aquarium={aquarium}
      />
    </div>
  );
}
