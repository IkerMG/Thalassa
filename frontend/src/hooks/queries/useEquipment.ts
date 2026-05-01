import { useQuery } from '@tanstack/react-query';
import { equipmentApi } from '../../api/equipmentApi';

export const equipmentQueryKey = (aquariumId: number) =>
  ['aquariums', aquariumId, 'equipment'] as const;

export function useEquipment(aquariumId: number) {
  return useQuery({
    queryKey: equipmentQueryKey(aquariumId),
    queryFn: () => equipmentApi.list(aquariumId),
    enabled: !!aquariumId,
  });
}
