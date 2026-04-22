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
      plan: res.subscriptionPlan,
    };
    setAuth(res.token, userData);
    return res;
  };

  const register = async (data: RegisterRequest) => {
    // Register creates the account (returns UserResponse, no token).
    // Auto-login immediately after so the user lands on the dashboard.
    await authApi.register(data);
    return login({ email: data.email, password: data.password });
  };

  const logout = () => clearAuth();

  return { token, user, isAuthenticated, login, register, logout };
}
