import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboardApi';

export const dashboardSummaryQueryKey = ['dashboard', 'summary'] as const;

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardSummaryQueryKey,
    queryFn: dashboardApi.getSummary,
  });
}
