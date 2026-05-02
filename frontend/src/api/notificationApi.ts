import api from './axiosConfig';
import type { components } from './generated/schema';

export type NotificationItem = components['schemas']['NotificationResponse'];

export const notificationApi = {
  getNotifications: () =>
    api.get<NotificationItem[]>('/notifications').then((r) => r.data),
};
