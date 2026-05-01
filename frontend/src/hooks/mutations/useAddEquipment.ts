import { useMutation } from '@tanstack/react-query';
import { aquariumApi } from '../../api/aquariumApi';
import type { AddEquipmentRequest } from '../../types/aquarium';
import queryClient from '../../lib/queryClient';
import { toast } from '../../lib/toast';
import { aquariumQueryKey } from '../queries/useAquarium';

export function useAddEquipment() {
  return useMutation({
    mutationFn: ({ aquariumId, data }: { aquariumId: number; data: AddEquipmentRequest }) =>
      aquariumApi.addEquipment(aquariumId, data),
    onSuccess: (_result, { aquariumId }) => {
      queryClient.invalidateQueries({ queryKey: aquariumQueryKey(aquariumId) });
    },
    onError: () => {
      toast.error('No se pudo añadir el equipo.');
    },
  });
}
