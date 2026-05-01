import { useQuery } from '@tanstack/react-query';
import { aquariumApi } from '../../api/aquariumApi';

export const aquariumQueryKey = (id: number) => ['aquariums', id] as const;

export function useAquarium(id: number) {
  return useQuery({
    queryKey: aquariumQueryKey(id),
    queryFn: () => aquariumApi.detail(id),
    enabled: !!id,
  });
}
