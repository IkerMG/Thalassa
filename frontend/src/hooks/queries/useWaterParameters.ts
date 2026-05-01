import { useQuery } from '@tanstack/react-query';
import { parameterApi } from '../../api/parameterApi';

export const waterParametersQueryKey = (aquariumId: number) =>
  ['aquariums', aquariumId, 'parameters'] as const;

export function useWaterParameters(aquariumId: number) {
  return useQuery({
    queryKey: waterParametersQueryKey(aquariumId),
    queryFn: () => parameterApi.getHistory(aquariumId),
    enabled: !!aquariumId,
  });
}
