import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

const mockUser = {
  id: 1,
  email: 'test@thalassa.com',
  name: 'Test User',
  plan: 'FREE' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  });
});

describe('setAuth', () => {
  it('sets token, refreshToken, user and marks authenticated', () => {
    useAuthStore.getState().setAuth('tok-abc', 'ref-xyz', mockUser);

    const s = useAuthStore.getState();
    expect(s.token).toBe('tok-abc');
    expect(s.refreshToken).toBe('ref-xyz');
    expect(s.user).toEqual(mockUser);
    expect(s.isAuthenticated).toBe(true);
  });

  it('accepts null refreshToken', () => {
    useAuthStore.getState().setAuth('tok-abc', null, mockUser);
    expect(useAuthStore.getState().refreshToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});

describe('clearAuth', () => {
  it('resets all fields to unauthenticated state', () => {
    useAuthStore.getState().setAuth('tok-abc', 'ref-xyz', mockUser);
    useAuthStore.getState().clearAuth();

    const s = useAuthStore.getState();
    expect(s.token).toBeNull();
    expect(s.refreshToken).toBeNull();
    expect(s.user).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });
});

describe('setAccessToken (refresh in-place)', () => {
  it('rotates access token without touching user or refreshToken', () => {
    useAuthStore.getState().setAuth('old-tok', 'ref-xyz', mockUser);
    useAuthStore.getState().setAccessToken('new-tok');

    const s = useAuthStore.getState();
    expect(s.token).toBe('new-tok');
    expect(s.refreshToken).toBe('ref-xyz');
    expect(s.user).toEqual(mockUser);
    expect(s.isAuthenticated).toBe(true);
  });
});

describe('updateUser', () => {
  it('applies partial updates to the user', () => {
    useAuthStore.getState().setAuth('tok-abc', null, mockUser);
    useAuthStore.getState().updateUser({ name: 'Updated Name', plan: 'REEFMASTER' });

    const s = useAuthStore.getState();
    expect(s.user?.name).toBe('Updated Name');
    expect(s.user?.plan).toBe('REEFMASTER');
    expect(s.user?.email).toBe('test@thalassa.com');
  });

  it('is a no-op when user is null', () => {
    useAuthStore.getState().updateUser({ name: 'Ghost' });
    expect(useAuthStore.getState().user).toBeNull();
  });
});
