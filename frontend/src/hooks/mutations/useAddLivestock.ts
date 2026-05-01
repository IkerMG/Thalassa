import { useMutation } from '@tanstack/react-query';
import { aquariumApi } from '../../api/aquariumApi';
import type { AddLivestockRequest } from '../../types/aquarium';
import queryClient from '../../lib/queryClient';
import { toast } from '../../lib/toast';
import { aquariumQueryKey } from '../queries/useAquarium';
import { dashboardSummaryQueryKey } from '../queries/useDashboardSummary';

export function useAddLivestock() {
  return useMutation({
    mutationFn: ({ aquariumId, data }: { aquariumId: number; data: AddLivestockRequest }) =>
      aquariumApi.addLivestock(aquariumId, data),
    onSuccess: (_result, { aquariumId }) => {
      queryClient.invalidateQueries({ queryKey: aquariumQueryKey(aquariumId) });
      queryClient.invalidateQueries({ queryKey: dashboardSummaryQueryKey });
    },
    onError: () => {
      toast.error('No se pudo añadir el animal.');
    },
  });
}
