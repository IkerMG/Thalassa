import { useQuery } from '@tanstack/react-query';
import { aquariumApi } from '../../api/aquariumApi';

export const aquariumQueryKey = (id: number) => ['aquariums', id] as const;

export function useAquarium(id: number) {
  return useQuery({
    queryKey: aquariumQueryKey(id),
    queryFn: () => aquariumApi.detail(id),
    enabled: !!id,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) return false;
      return failureCount < 2;
    },
  });
}
