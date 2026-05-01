import api from './axiosConfig';
import type { components } from './generated/schema';

export type UserProfile = components['schemas']['UserResponse'];
export type UpdateUserRequest = components['schemas']['UpdateUserRequest'];

export const userApi = {
  getProfile: () =>
    api.get<UserProfile>('/users/me').then((r) => r.data),

  updateProfile: (data: UpdateUserRequest) =>
    api.put<UserProfile>('/users/me', data).then((r) => r.data),
};
