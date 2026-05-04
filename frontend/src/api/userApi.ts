import api from './axiosConfig';
import type { components } from './generated/schema';

export type UserProfile = components['schemas']['UserResponse'];
export type UpdateUserRequest = components['schemas']['UpdateUserRequest'];
export type ChangePasswordRequest = components['schemas']['ChangePasswordRequest'];

export const userApi = {
  getProfile: () =>
    api.get<UserProfile>('/users/me').then((r) => r.data),

  updateProfile: (data: UpdateUserRequest) =>
    api.put<UserProfile>('/users/me', data).then((r) => r.data),

  simulateUpgrade: () =>
    api.post<UserProfile>('/users/me/simulate-upgrade').then((r) => r.data),

  changePassword: (data: ChangePasswordRequest) =>
    api.post<void>('/users/me/password', data).then((r) => r.data),
};
