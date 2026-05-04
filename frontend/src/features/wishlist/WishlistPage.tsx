import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, ExternalLink, Pencil, Trash2, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { WishlistItem } from '../../api/wishlistApi';
import type { WishlistCategory, WishlistPriority } from '../../api/wishlistApi';
import { useWishlist } from '../../hooks/queries/useWishlist';
import { useAddWishlistItem } from '../../hooks/mutations/useAddWishlistItem';
import { useUpdateWishlistItem } from '../../hooks/mutations/useUpdateWishlistItem';
import { useRemoveWishlistItem } from '../../hooks/mutations/useRemoveWishlistItem';
import {
  wishlistAddSchema,
  wishlistEditSchema,
  type WishlistAddFormValues,
  type WishlistEditFormValues,
} from '../../lib/schemas/wishlist.schemas';
import Button from '../../components/ui/Button';
import { normalizeExternalUrl } from '../../lib/url';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/shared/EmptyState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

// ── Constants ─────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<
  NonNullable<WishlistPriority>,
  { label: string; className: string }
> = {
  HIGH: {
    label: 'Alta',
    className: 'text-red-400 bg-red-400/10 border border-red-400/20',
  },
  MEDIUM: {
    label: 'Media',
    className: 'text-orange-400 bg-orange-400/10 border border-orange-400/20',
  },
  LOW: {
    label: 'Baja',
    className: 'text-[#666] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]',
  },
};

const CATEGORY_LABELS: Record<NonNullable<WishlistCategory>, string> = {
  EQUIPMENT: 'Equipo',
  LIVESTOCK: 'Especie',
  SUPPLEMENT: 'Suplemento',
  OTHER: 'Otro',
};

type FilterValue = 'all' | NonNullable<WishlistCategory>;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Todo' },
  { value: 'EQUIPMENT', label: 'Equipo' },
  { value: 'LIVESTOCK', label: 'Especie' },
  { value: 'SUPPLEMENT', label: 'Suplemento' },
  { value: 'OTHER', label: 'Otro' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: WishlistPriority | null | undefined }) {
  if (!priority) return null;
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

interface CardProps {
  item: WishlistItem;
  onEdit: (item: WishlistItem) => void;
  onDelete: (item: WishlistItem) => void;
}

function WishlistItemCard({ item, onEdit, onDelete }: CardProps) {
  const productHref = normalizeExternalUrl(item.productUrl);
  return (
    <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4 flex flex-col gap-3 hover:border-[rgba(255,255,255,0.14)] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-white text-sm font-semibold leading-snug line-clamp-2 flex-1">
          {item.productName}
        </p>
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          {productHref && (
            <a
              href={productHref}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-md text-[#555] hover:text-[#59D3FF] hover:bg-[rgba(89,211,255,0.06)] transition-colors"
              title="Ver producto"
            >
              <ExternalLink size={13} />
            </a>
          )}
          <button
            onClick={() => onEdit(item)}
            className="p-1 rounded-md text-[#555] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-colors"
            title="Editar"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-1 rounded-md text-[#555] hover:text-red-400 hover:bg-red-400/08 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {item.category && (
          <span className="text-[10px] font-medium text-[#59D3FF] border border-[rgba(89,211,255,0.25)] rounded px-2 py-0.5">
            {CATEGORY_LABELS[item.category]}
          </span>
        )}
        <PriorityBadge priority={item.priority} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-[rgba(255,255,255,0.05)]">
        <span className="text-white font-mono text-sm">
          {item.price && item.price > 0 ? `€${item.price.toFixed(2)}` : '—'}
        </span>
        {item.storeName && (
          <span className="text-[#555] text-xs truncate max-w-[120px]">{item.storeName}</span>
        )}
      </div>

      {/* Notes */}
      {item.notes && (
        <p className="text-[#666] text-xs leading-relaxed italic border-t border-[rgba(255,255,255,0.04)] pt-2">
          {item.notes}
        </p>
      )}
    </div>
  );
}

// ── Add Modal ─────────────────────────────────────────────────────────────────

interface AddModalProps {
  open: boolean;
  onClose: () => void;
}

function AddWishlistModal({ open, onClose }: AddModalProps) {
  const { t } = useTranslation('wishlist');
  const { mutate, isPending } = useAddWishlistItem();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WishlistAddFormValues>({
    resolver: zodResolver(wishlistAddSchema),
    defaultValues: { priority: 'MEDIUM', price: 0 },
  });

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = (values: WishlistAddFormValues) => {
    mutate(
      {
        productName: values.productName,
        price: values.price ?? 0,
        productUrl: values.productUrl ?? '',
        storeName: values.storeName ?? '',
        imgUrl: null,
        category: values.category ?? undefined,
        priority: values.priority ?? null,
        notes: values.notes ?? null,
      },
      { onSuccess: handleClose }
    );
  };

  return (
    <Modal open={open} onClose={handleClose} title={t('addModalTitle')}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="Nombre del producto *"
          placeholder="Ej. Kessil A360X Tuna Blue"
          {...register('productName')}
          error={errors.productName?.message}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
              Categoría
            </label>
            <select
              {...register('category')}
              className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors cursor-pointer"
            >
              <option value="">Sin categoría</option>
              <option value="EQUIPMENT">Equipo</option>
              <option value="LIVESTOCK">Especie</option>
              <option value="SUPPLEMENT">Suplemento</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
              Prioridad
            </label>
            <select
              {...register('priority')}
              className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors cursor-pointer"
            >
              <option value="HIGH">Alta</option>
              <option value="MEDIUM">Media</option>
              <option value="LOW">Baja</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Precio (€)"
            type="number"
            step="0.01"
            min={0}
            placeholder="0.00"
            {...register('price')}
            error={errors.price?.message}
          />
          <Input
            label="Tienda"
            placeholder="Ej. tiendanimal"
            {...register('storeName')}
            error={errors.storeName?.message}
          />
        </div>

        <Input
          label="URL del producto"
          placeholder="https://..."
          {...register('productUrl')}
          error={errors.productUrl?.message}
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
            Notas
          </label>
          <textarea
            {...register('notes')}
            placeholder="¿Por qué quieres esto? ¿Para qué acuario?"
            rows={3}
            className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white placeholder-[#444] outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors resize-none"
          />
          {errors.notes && (
            <p className="text-xs text-red-400 mt-0.5">{errors.notes.message}</p>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <Button type="button" variant="ghost" size="md" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={isPending}>
            {isPending ? 'Guardando…' : 'Añadir'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

interface EditModalProps {
  item: WishlistItem | null;
  onClose: () => void;
}

function EditWishlistModal({ item, onClose }: EditModalProps) {
  const { t } = useTranslation('wishlist');
  const { mutate, isPending } = useUpdateWishlistItem();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WishlistEditFormValues>({
    resolver: zodResolver(wishlistEditSchema),
    values: {
      priority: (item?.priority as WishlistEditFormValues['priority']) ?? 'MEDIUM',
      notes: item?.notes ?? '',
    },
  });

  const onSubmit = (values: WishlistEditFormValues) => {
    if (!item?.id) return;
    mutate(
      { id: item.id, data: { priority: values.priority, notes: values.notes ?? null } },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal open={!!item} onClose={onClose} title={t('editModalTitle')}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
            Prioridad
          </label>
          <select
            {...register('priority')}
            className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors cursor-pointer"
          >
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Media</option>
            <option value="LOW">Baja</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
            Notas
          </label>
          <textarea
            {...register('notes')}
            rows={4}
            className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white placeholder-[#444] outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors resize-none"
          />
          {errors.notes && (
            <p className="text-xs text-red-400 mt-0.5">{errors.notes.message}</p>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={isPending}>
            {isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="h-4 w-3/4 bg-[rgba(255,255,255,0.07)] rounded" />
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-[rgba(255,255,255,0.05)] rounded-full" />
            <div className="h-5 w-12 bg-[rgba(255,255,255,0.05)] rounded-full" />
          </div>
          <div className="border-t border-[rgba(255,255,255,0.05)] pt-2 flex justify-between">
            <div className="h-4 w-12 bg-[rgba(255,255,255,0.06)] rounded" />
            <div className="h-4 w-20 bg-[rgba(255,255,255,0.04)] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function WishlistPage() {
  const { t } = useTranslation('wishlist');
  const navigate = useNavigate();
  const { data: items = [], isLoading } = useWishlist();
  const { mutateAsync: removeItem } = useRemoveWishlistItem();

  const [addOpen, setAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<WishlistItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');

  const filtered =
    activeFilter === 'all' ? items : items.filter((i) => i.category === activeFilter);

  if (isLoading) {
    return (
      <div className="min-h-full p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 w-32 bg-[rgba(255,255,255,0.07)] rounded animate-pulse" />
          <div className="h-9 w-28 bg-[rgba(255,255,255,0.06)] rounded-lg animate-pulse" />
        </div>
        <WishlistSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Heart size={22} className="text-[#59D3FF]" />
            {t('title')}
          </h1>
          <p className="text-sm text-[#A0A0A0] mt-1">
            {items.length === 0
              ? t('saveDesc')
              : `${items.length} ${items.length === 1 ? 'item guardado' : 'items guardados'}`}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
          <Plus size={16} />
          {t('add')}
        </Button>
      </div>

      {/* Filters */}
      {items.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer',
                activeFilter === f.value
                  ? 'bg-[#59D3FF] text-[#0A0F1E]'
                  : 'border border-[rgba(255,255,255,0.10)] text-[#A0A0A0] hover:border-[rgba(255,255,255,0.20)] hover:text-white',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={t('emptyTitle')}
          description={t('emptyDesc')}
          action={
            <div className="flex gap-3">
              <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
                <Plus size={16} />
                {t('addItem')}
              </Button>
              <Button variant="secondary" size="md" onClick={() => navigate('/dashboard/market')}>
                <ShoppingBag size={15} />
                {t('goToMarket')}
              </Button>
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Sin resultados"
          description={`No tienes items en la categoría "${FILTERS.find((f) => f.value === activeFilter)?.label}".`}
          action={
            <Button variant="ghost" size="md" onClick={() => setActiveFilter('all')}>
              {t('viewAll')}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              onEdit={setEditingItem}
              onDelete={setDeletingItem}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddWishlistModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditWishlistModal item={editingItem} onClose={() => setEditingItem(null)} />
      <ConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => { if (!open) setDeletingItem(null); }}
        title="Eliminar de la wishlist"
        description={`¿Quieres eliminar "${deletingItem?.productName}" de tu wishlist?`}
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={async () => {
          if (deletingItem?.id) await removeItem(deletingItem.id);
        }}
      />
    </div>
  );
}
