import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import type { AuthResponse } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: attach access token ─────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: transparent token rotation ─────────────────────────────────────
//
// Single in-flight pattern: if multiple requests 401 at the same time, only
// ONE refresh call is made. All waiters share the same Promise and get the
// new token when it resolves.

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const store = useAuthStore.getState();

    if (!store.refreshToken) {
      store.clearAuth();
      window.dispatchEvent(new CustomEvent('auth:expired'));
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      const capturedRefreshToken = store.refreshToken;
      refreshPromise = axios
        .post<AuthResponse>(`${BASE_URL}/auth/refresh`, { refreshToken: capturedRefreshToken })
        .then(({ data }) => {
          useAuthStore.getState().setAuth(data.token, data.refreshToken ?? null, useAuthStore.getState().user!);
          return data.token;
        })
        .catch((err) => {
          useAuthStore.getState().clearAuth();
          window.dispatchEvent(new CustomEvent('auth:expired'));
          throw err;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      const newToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch {
      return Promise.reject(error);
    }
  }
);

export default api;
