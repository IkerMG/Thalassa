import api from './axiosConfig';
import type {
  AquariumSummary,
  AquariumDetail,
  AquariumRequest,
  AddLivestockRequest,
  AddLivestockResponse,
  AddEquipmentRequest,
  EquipmentItem,
} from '../types/aquarium';

export const aquariumApi = {
  list: () =>
    api.get<AquariumSummary[]>('/aquariums').then((r) => r.data),

  detail: (id: number) =>
    api.get<AquariumDetail>(`/aquariums/${id}`).then((r) => r.data),

  create: (data: AquariumRequest) =>
    api.post<AquariumSummary>('/aquariums', data).then((r) => r.data),

  update: (id: number, data: AquariumRequest) =>
    api.put<AquariumSummary>(`/aquariums/${id}`, data).then((r) => r.data),

  delete: (id: number) => api.delete(`/aquariums/${id}`),

  addLivestock: (aquariumId: number, data: AddLivestockRequest) =>
    api
      .post<AddLivestockResponse>(`/aquariums/${aquariumId}/livestock`, data)
      .then((r) => r.data),

  deleteLivestock: (livestockId: number) =>
    api.delete(`/livestock/${livestockId}`),

  addEquipment: (aquariumId: number, data: AddEquipmentRequest) =>
    api
      .post<EquipmentItem>(`/aquariums/${aquariumId}/equipment`, data)
      .then((r) => r.data),

  deleteEquipment: (equipmentId: number) =>
    api.delete(`/equipment/${equipmentId}`),
};
