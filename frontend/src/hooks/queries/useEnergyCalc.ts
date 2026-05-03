import { useQuery } from '@tanstack/react-query';
import { equipmentApi, type EnergyResponse } from '../../api/equipmentApi';

export const energyCalcQueryKey = (aquariumId: number) =>
  ['aquariums', aquariumId, 'energy'] as const;

export function useEnergyCalc(aquariumId: number | null) {
  return useQuery<EnergyResponse>({
    queryKey: energyCalcQueryKey(aquariumId ?? 0),
    queryFn: () => equipmentApi.getEnergyCost(aquariumId!),
    enabled: aquariumId !== null,
    retry: false,
  });
}
