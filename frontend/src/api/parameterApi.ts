import api from './axiosConfig';
import type { WaterParameter, WaterParameterRequest } from '../types/parameter';

export const parameterApi = {
  getHistory: (aquariumId: number) =>
    api
      .get<WaterParameter[]>(`/aquariums/${aquariumId}/parameters`)
      .then((r) => r.data),

  log: (aquariumId: number, data: WaterParameterRequest) =>
    api
      .post<WaterParameter>(`/aquariums/${aquariumId}/parameters`, data)
      .then((r) => r.data),
};
