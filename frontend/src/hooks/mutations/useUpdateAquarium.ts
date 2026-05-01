import { useMutation } from '@tanstack/react-query';
import { aquariumApi } from '../../api/aquariumApi';
import type { AquariumRequest } from '../../types/aquarium';
import queryClient from '../../lib/queryClient';
import { toast } from '../../lib/toast';
import { aquariumQueryKey } from '../queries/useAquarium';
import { aquariumsQueryKey } from '../queries/useAquariums';

export function useUpdateAquarium() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AquariumRequest }) =>
      aquariumApi.update(id, data),
    onSuccess: (_updated, { id }) => {
      queryClient.invalidateQueries({ queryKey: aquariumQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: aquariumsQueryKey });
      toast.success('Aquarium updated.');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'No se pudo actualizar el acuario.');
    },
  });
}
