import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../../api/notificationApi';

export const notificationsQueryKey = ['notifications'] as const;

export function useNotifications() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: notificationApi.getNotifications,
    staleTime: 60_000,
  });
}
