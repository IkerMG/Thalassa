import api from './axiosConfig';
import type { WaterParameter, WaterParameterRequest } from '../types/parameter';

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const parameterApi = {
  getHistory: (aquariumId: number, page = 0, size = 50) =>
    api
      .get<Page<WaterParameter>>(`/aquariums/${aquariumId}/parameters`, {
        params: { page, size },
      })
      .then((r) => r.data.content),

  log: (aquariumId: number, data: WaterParameterRequest) =>
    api
      .post<WaterParameter>(`/aquariums/${aquariumId}/parameters`, data)
      .then((r) => r.data),
};
