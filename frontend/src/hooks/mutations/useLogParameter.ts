import { useMutation } from '@tanstack/react-query';
import { parameterApi } from '../../api/parameterApi';
import type { WaterParameterRequest } from '../../types/parameter';
import queryClient from '../../lib/queryClient';
import { toast } from '../../lib/toast';
import { waterParametersQueryKey } from '../queries/useWaterParameters';

export function useLogParameter() {
  return useMutation({
    mutationFn: ({ aquariumId, data }: { aquariumId: number; data: WaterParameterRequest }) =>
      parameterApi.log(aquariumId, data),
    onSuccess: (_result, { aquariumId }) => {
      queryClient.invalidateQueries({ queryKey: waterParametersQueryKey(aquariumId) });
    },
    onError: () => {
      toast.error('No se pudo guardar la medición.');
    },
  });
}
