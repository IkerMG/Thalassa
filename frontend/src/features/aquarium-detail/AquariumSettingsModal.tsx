import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aquariumCreateSchema, type AquariumCreateFormValues } from '../../lib/schemas/aquarium.schemas';
import type { AquariumDetail } from '../../types/aquarium';
import { useUpdateAquarium } from '../../hooks/mutations/useUpdateAquarium';
import { useDeleteAquarium } from '../../hooks/mutations/useDeleteAquarium';

interface Props {
  open: boolean;
  onClose: () => void;
  aquarium: AquariumDetail;
}

export default function AquariumSettingsModal({ open, onClose, aquarium }: Props) {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AquariumCreateFormValues>({
    resolver: zodResolver(aquariumCreateSchema),
    values: { name: aquarium.name, liters: aquarium.liters, type: aquarium.type },
  });

  const { mutate: update, isPending: isUpdating } = useUpdateAquarium();
  const { mutate: deleteAquarium } = useDeleteAquarium();

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = (data: AquariumCreateFormValues) => {
    update(
      { id: aquarium.id, data: { ...data, name: data.name.trim() } },
      { onSuccess: handleClose }
    );
  };

  return (
    <>
      <Modal open={open} onClose={handleClose} title="Aquarium Settings">
        <div className="flex flex-col gap-6">
          {/* Edit form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <Input
              label="Name"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="Volume (liters)"
              type="number"
              min={1}
              {...register('liters')}
              error={errors.liters?.message}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
                Ecosystem Type
              </label>
              <select
                {...register('type')}
                className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors cursor-pointer"
              >
                <option value="REEF">Reef</option>
                <option value="FISH_ONLY">Fish Only</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button type="button" variant="ghost" size="md" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" disabled={!isDirty || isUpdating}>
                {isUpdating ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>

          {/* Danger zone */}
          <div className="border border-[rgba(248,113,113,0.20)] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#F87171] uppercase tracking-wide mb-1">
              Danger Zone
            </p>
            <p className="text-xs text-[#A0A0A0] mb-3">
              Permanently delete this aquarium and all its data. This action cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[rgba(248,113,113,0.30)] text-[#F87171] hover:bg-[rgba(248,113,113,0.08)] transition-colors cursor-pointer"
            >
              Delete Aquarium
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Aquarium"
        description={`This will permanently delete "${aquarium.name}" along with all parameters, livestock, and equipment. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        requireTextConfirmation={aquarium.name}
        onConfirm={() =>
          new Promise<void>((resolve, reject) => {
            deleteAquarium(aquarium.id, {
              onSuccess: () => {
                navigate('/dashboard', { replace: true });
                resolve();
              },
              onError: () => reject(new Error('Delete failed')),
            });
          })
        }
      />
    </>
  );
}
