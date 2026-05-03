import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Fish, Wrench, Layers, ChevronRight, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import type { AquariumSummary, AquariumType } from '../../types/aquarium';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/shared/EmptyState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aquariumCreateSchema, type AquariumCreateFormValues } from '../../lib/schemas/aquarium.schemas';
import DashboardCardSkeleton from '../../components/shared/skeletons/DashboardCardSkeleton';
import { useUIStore } from '../../store/uiStore';
import { useAquariums } from '../../hooks/queries/useAquariums';
import { useDashboardSummary } from '../../hooks/queries/useDashboardSummary';
import { useCreateAquarium } from '../../hooks/mutations/useCreateAquarium';

// ── Aquarium card ─────────────────────────────────────────────────────────────

function AquariumCard({ aq }: { aq: AquariumSummary }) {
  const { t } = useTranslation('aquarium');
  const { t: tc } = useTranslation('common');
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
          {t(`types.${aq.type as AquariumType}`)}
        </span>
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-[#A0A0A0] text-xs">{tc('viewDetails')}</span>
        <ChevronRight size={14} className="text-[#666] group-hover:text-[#59D3FF] transition-colors" />
      </div>
    </button>
  );
}

// ── Create Aquarium modal ─────────────────────────────────────────────────────

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
}

function CreateAquariumModal({ open, onClose }: CreateModalProps) {
  const { t } = useTranslation('dashboard');
  const { t: tc } = useTranslation('common');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AquariumCreateFormValues>({
    resolver: zodResolver(aquariumCreateSchema),
    defaultValues: { name: '', type: 'REEF' },
  });

  const { mutate, isPending } = useCreateAquarium();

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = (data: AquariumCreateFormValues) => {
    mutate({ ...data, name: data.name.trim() }, { onSuccess: handleClose });
  };

  return (
    <Modal open={open} onClose={handleClose} title={t('createModal.title')}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label={t('createModal.name')}
          placeholder={t('createModal.namePlaceholder')}
          {...register('name')}
          error={errors.name?.message}
        />
        <Input
          label={t('createModal.volume')}
          type="number"
          placeholder={t('createModal.volumePlaceholder')}
          min={1}
          {...register('liters')}
          error={errors.liters?.message}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
            {t('createModal.type')}
          </label>
          <select
            {...register('type')}
            className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors cursor-pointer"
          >
            <option value="REEF">{t('createModal.types.REEF')}</option>
            <option value="FISH_ONLY">{t('createModal.types.FISH_ONLY')}</option>
            <option value="MIXED">{t('createModal.types.MIXED')}</option>
          </select>
        </div>
        <div className="flex gap-3 justify-end pt-1">
          <Button type="button" variant="ghost" size="md" onClick={handleClose}>
            {tc('cancel')}
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={isPending}>
            {isPending ? t('createModal.submitting') : t('createModal.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardView() {
  const { t } = useTranslation('dashboard');
  const user = useAuthStore((s) => s.user);
  const openChat = useUIStore((s) => s.openChat);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: aquariums = [], isLoading } = useAquariums();
  const { data: summary } = useDashboardSummary();

  const isFree = user?.plan === 'FREE';
  const canCreate = !isFree || aquariums.length === 0;

  if (isLoading) {
    return (
      <div className="min-h-full p-6 max-w-5xl mx-auto">
        <div className="mb-8 flex items-start justify-between animate-pulse">
          <div className="flex flex-col gap-2">
            <div className="h-7 w-32 bg-[rgba(255,255,255,0.07)] rounded" />
            <div className="h-3.5 w-48 bg-[rgba(255,255,255,0.05)] rounded" />
          </div>
          <div className="h-9 w-28 bg-[rgba(255,255,255,0.06)] rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-8 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[rgba(255,255,255,0.06)]" />
              <div className="flex flex-col gap-1.5">
                <div className="h-5 w-8 bg-[rgba(255,255,255,0.07)] rounded" />
                <div className="h-2.5 w-16 bg-[rgba(255,255,255,0.05)] rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <DashboardCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">
            {t('welcome', { username: user?.username })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={openChat}>
            <Bot size={15} />
            {t('actions.aiAssistant')}
          </Button>
          {canCreate && (
            <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
              <Plus size={16} />
              {t('actions.newAquarium')}
            </Button>
          )}
        </div>
      </div>

      {/* Global stats */}
      {summary && aquariums.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Layers, label: t('stats.aquariums'), value: summary.aquariumCount },
            { icon: Fish, label: t('stats.livestock'), value: summary.totalLivestock },
            { icon: Wrench, label: t('stats.equipment'), value: summary.totalEquipment },
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
          title={t('empty.title')}
          description={t('empty.description')}
          action={
            <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
              <Plus size={16} className="mr-1" />
              {t('actions.newAquarium')}
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
              <span className="text-sm font-medium">{t('actions.newAquarium')}</span>
            </button>
          )}
        </div>
      )}

      <CreateAquariumModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
