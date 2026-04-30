import api from './axiosConfig';
import type { components } from './generated/schema';

export type EquipmentItem = components['schemas']['EquipmentResponse'];
export type EquipmentRequest = components['schemas']['EquipmentRequest'];
export type EnergyResponse = components['schemas']['EnergyResponse'];

export const equipmentApi = {
  list: (aquariumId: number) =>
    api.get<EquipmentItem[]>(`/aquariums/${aquariumId}/equipment`).then((r) => r.data),

  add: (aquariumId: number, data: EquipmentRequest) =>
    api.post<EquipmentItem>(`/aquariums/${aquariumId}/equipment`, data).then((r) => r.data),

  update: (id: number, data: EquipmentRequest) =>
    api.put<EquipmentItem>(`/equipment/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/equipment/${id}`),

  getEnergyCost: (aquariumId: number) =>
    api.get<EnergyResponse>(`/aquariums/${aquariumId}/energy`).then((r) => r.data),
};
