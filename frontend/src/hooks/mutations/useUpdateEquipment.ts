import { useMutation } from '@tanstack/react-query';
import { aquariumApi } from '../../api/aquariumApi';
import type { AddEquipmentRequest, AquariumDetail } from '../../types/aquarium';
import queryClient from '../../lib/queryClient';
import { toast } from '../../lib/toast';
import { aquariumQueryKey } from '../queries/useAquarium';

export function useUpdateEquipment() {
  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      aquariumId: number;
      itemId: number;
      data: AddEquipmentRequest;
    }) => aquariumApi.updateEquipment(itemId, data),
    onSuccess: (updated, { aquariumId }) => {
      const key = aquariumQueryKey(aquariumId);
      const previous = queryClient.getQueryData<AquariumDetail>(key);
      if (previous) {
        queryClient.setQueryData(key, {
          ...previous,
          equipment: previous.equipment.map((e) =>
            e.id === updated.id ? updated : e
          ),
        });
      }
    },
    onError: () => {
      toast.error('No se pudo actualizar el equipo.');
    },
    onSettled: (_data, _err, { aquariumId }) => {
      queryClient.invalidateQueries({ queryKey: aquariumQueryKey(aquariumId) });
    },
  });
}
