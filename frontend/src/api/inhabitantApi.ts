import api from './axiosConfig';
import type { components } from './generated/schema';

export type LivestockItem = components['schemas']['LivestockResponse'];
export type LivestockRequest = components['schemas']['LivestockRequest'];
export type AddLivestockResult = components['schemas']['AddLivestockResponse'];
export type SpeciesCatalog = components['schemas']['SpeciesCatalogResponse'];
export type LivestockCategory = components['schemas']['LivestockCategory'];

export const inhabitantApi = {
  list: (aquariumId: number) =>
    api.get<LivestockItem[]>(`/aquariums/${aquariumId}/livestock`).then((r) => r.data),

  add: (aquariumId: number, data: LivestockRequest) =>
    api
      .post<AddLivestockResult>(`/aquariums/${aquariumId}/livestock`, data)
      .then((r) => r.data),

  update: (id: number, data: LivestockRequest) =>
    api.put<LivestockItem>(`/livestock/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/livestock/${id}`),

  searchSpecies: (search?: string) =>
    api
      .get<SpeciesCatalog[]>('/species', { params: search ? { search } : undefined })
      .then((r) => r.data),

  getSpecies: (id: number) =>
    api.get<SpeciesCatalog>(`/species/${id}`).then((r) => r.data),
};
