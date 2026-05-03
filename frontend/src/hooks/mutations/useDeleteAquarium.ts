import { useMutation } from '@tanstack/react-query';
import { aquariumApi } from '../../api/aquariumApi';
import type { AquariumSummary } from '../../types/aquarium';
import queryClient from '../../lib/queryClient';
import { toast } from '../../lib/toast';
import { aquariumsQueryKey } from '../queries/useAquariums';
import { dashboardSummaryQueryKey } from '../queries/useDashboardSummary';

export function useDeleteAquarium() {
  return useMutation({
    mutationFn: (id: number) => aquariumApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: aquariumsQueryKey });
      const previous = queryClient.getQueryData<AquariumSummary[]>(aquariumsQueryKey);
      if (previous) {
        queryClient.setQueryData(aquariumsQueryKey, previous.filter((a) => a.id !== id));
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(aquariumsQueryKey, context.previous);
      }
      toast.error('No se pudo eliminar el acuario.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: aquariumsQueryKey });
      queryClient.invalidateQueries({ queryKey: dashboardSummaryQueryKey });
    },
  });
}
