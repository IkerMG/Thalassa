import api from './axiosConfig';

export interface DashboardSummary {
  aquariumCount: number;
  totalLivestock: number;
  totalEquipment: number;
}

export const dashboardApi = {
  getSummary: () =>
    api.get<DashboardSummary>('/dashboard/summary').then((r) => r.data),
};
