import { renderHook, act } from '@testing-library/react';
import { UserProvider, useUser } from '@/context/UserContext';
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
  getMe: vi.fn(),
}));

describe('UserContext & useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const wrapper = ({ children }) => <UserProvider>{children}</UserProvider>;

  it('should restore user session on mount if token is in localStorage', async () => {
    const mockUser = { id: 'user-1', name: 'John Doe' };
    localStorage.setItem('vitrina_access_token', 'valid-token');
    getMe.mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useUser(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(getMe).toHaveBeenCalledTimes(1);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it('should authenticate user on login', async () => {
    const mockUser = { id: 'user-1', name: 'John Doe' };
    apiLogin.mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useUser(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.login('john@example.com', 'password123');
    });

    expect(apiLogin).toHaveBeenCalledWith('john@example.com', 'password123');
    expect(result.current.user).toEqual(mockUser);
  });

  it('should sign out and clean up on logout', async () => {
    const mockUser = { id: 'user-1', name: 'John Doe' };
    localStorage.setItem('vitrina_auth_user', JSON.stringify(mockUser));
    apiLogout.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useUser(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(apiLogout).toHaveBeenCalledTimes(1);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('vitrina_auth_user')).toBeNull();
  });
});
