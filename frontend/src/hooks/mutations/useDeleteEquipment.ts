import { useMutation } from '@tanstack/react-query';
import { aquariumApi } from '../../api/aquariumApi';
import type { AquariumDetail } from '../../types/aquarium';
import queryClient from '../../lib/queryClient';
import { toast } from '../../lib/toast';
import { aquariumQueryKey } from '../queries/useAquarium';

export function useDeleteEquipment() {
  return useMutation({
    mutationFn: ({ itemId }: { aquariumId: number; itemId: number }) =>
      aquariumApi.deleteEquipment(itemId),
    onMutate: async ({ aquariumId, itemId }) => {
      const key = aquariumQueryKey(aquariumId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<AquariumDetail>(key);
      if (previous) {
        queryClient.setQueryData(key, {
          ...previous,
          equipment: previous.equipment.filter((e) => e.id !== itemId),
        });
      }
      return { previous };
    },
    onError: (_err, { aquariumId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(aquariumQueryKey(aquariumId), context.previous);
      }
      toast.error('No se pudo eliminar el equipo.');
    },
    onSettled: (_data, _err, { aquariumId }) => {
      queryClient.invalidateQueries({ queryKey: aquariumQueryKey(aquariumId) });
    },
  });
}
