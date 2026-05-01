import { useMutation } from '@tanstack/react-query';
import { aquariumApi } from '../../api/aquariumApi';
import type { AquariumRequest } from '../../types/aquarium';
import queryClient from '../../lib/queryClient';
import { toast } from '../../lib/toast';
import { aquariumsQueryKey } from '../queries/useAquariums';
import { dashboardSummaryQueryKey } from '../queries/useDashboardSummary';

export function useCreateAquarium() {
  return useMutation({
    mutationFn: (data: AquariumRequest) => aquariumApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aquariumsQueryKey });
      queryClient.invalidateQueries({ queryKey: dashboardSummaryQueryKey });
      toast.success('Aquarium created.');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'No se pudo crear el acuario.');
    },
  });
}
