import { useMutation } from '@tanstack/react-query';
import { aquariumApi } from '../../api/aquariumApi';
import type { AddLivestockRequest, AquariumDetail, LivestockItem } from '../../types/aquarium';
import queryClient from '../../lib/queryClient';
import { toast } from '../../lib/toast';
import { aquariumQueryKey } from '../queries/useAquarium';

export function useUpdateLivestock() {
  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      aquariumId: number;
      itemId: number;
      data: AddLivestockRequest;
    }) => aquariumApi.updateLivestock(itemId, data),
    onSuccess: (updated, { aquariumId }) => {
      const key = aquariumQueryKey(aquariumId);
      const previous = queryClient.getQueryData<AquariumDetail>(key);
      if (previous) {
        queryClient.setQueryData(key, {
          ...previous,
          livestock: previous.livestock.map((l) =>
            l.id === updated.id ? (updated as LivestockItem) : l
          ),
        });
      }
    },
    onError: () => {
      toast.error('No se pudo actualizar el animal.');
    },
    onSettled: (_data, _err, { aquariumId }) => {
      queryClient.invalidateQueries({ queryKey: aquariumQueryKey(aquariumId) });
    },
  });
}
