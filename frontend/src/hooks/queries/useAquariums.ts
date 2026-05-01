import { useQuery } from '@tanstack/react-query';
import { aquariumApi } from '../../api/aquariumApi';

export const aquariumsQueryKey = ['aquariums'] as const;

export function useAquariums() {
  return useQuery({
    queryKey: aquariumsQueryKey,
    queryFn: aquariumApi.list,
  });
}
