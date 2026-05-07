import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';
import type { AuthRequest, RegisterRequest } from '../types/api';
import type { User } from '../types/user';

export function useAuth() {
  const { token, user, isAuthenticated, setAuth, clearAuth, updateUser } = useAuthStore();

  const login = async (data: AuthRequest) => {
    const res = await authApi.login(data);
    const userData: User = {
      id: 0,
      email: res.email,
      username: res.username,
      plan: res.subscriptionPlan,
    };
    setAuth(res.token, res.refreshToken ?? null, userData);

    // Fetch full profile so avatarUrl, locale, kwhPrice etc. are in the store.
    // Fire-and-forget: a failure here doesn't break login.
    userApi.getProfile().then((profile) => {
      updateUser({
        avatarUrl: profile.avatarUrl ?? null,
        kwhPrice: profile.electricityPriceKwh ?? undefined,
        locale: (profile.locale as User['locale']) ?? undefined,
        temperatureUnit: (profile.temperatureUnit as User['temperatureUnit']) ?? undefined,
        volumeUnit: (profile.volumeUnit as User['volumeUnit']) ?? undefined,
      });
    }).catch(() => { /* non-critical */ });

    return res;
  };

  const register = async (data: RegisterRequest) => {
    // Register creates the account (returns UserResponse, no token).
    // Auto-login immediately after so the user lands on the dashboard.
    await authApi.register(data);
    return login({ email: data.email, password: data.password });
  };

  const logout = async () => {
    const currentRefreshToken = useAuthStore.getState().refreshToken;
    if (currentRefreshToken) {
      try {
        await authApi.logout(currentRefreshToken);
      } catch {
        // Token already revoked or expired — proceed with local logout anyway
      }
    }
    clearAuth();
  };

  return { token, user, isAuthenticated, login, register, logout };
}
