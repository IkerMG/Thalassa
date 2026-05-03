import api from './axiosConfig';
import type { AuthRequest, AuthResponse, RegisterRequest, UserResponse } from '../types/api';

export const authApi = {
  login: (data: AuthRequest) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    api.post<UserResponse>('/auth/register', data).then((r) => r.data),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }).then(() => undefined),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then(() => undefined),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }).then(() => undefined),
};
