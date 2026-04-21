import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authApi';
import type { AuthRequest, RegisterRequest } from '../types/api';
import type { User } from '../types/user';

export function useAuth() {
  const { token, user, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const login = async (data: AuthRequest) => {
    const res = await authApi.login(data);
    const userData: User = {
      id: 0,
      email: res.email,
      username: res.username,
      plan: res.plan,
    };
    setAuth(res.token, userData);
    return res;
  };

  const register = async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    const userData: User = {
      id: 0,
      email: res.email,
      username: res.username,
      plan: res.plan,
    };
    setAuth(res.token, userData);
    return res;
  };

  const logout = () => clearAuth();

  return { token, user, isAuthenticated, login, register, logout };
}
