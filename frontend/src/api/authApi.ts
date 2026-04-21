import api from './axiosConfig';
import type { AuthRequest, AuthResponse, RegisterRequest } from '../types/api';

export const authApi = {
  login: (data: AuthRequest) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),
};
