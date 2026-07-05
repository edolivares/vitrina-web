import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { FavoritesProvider, useFavorites } from '@/context/FavoritesContext';
import { useUser } from '@/context/UserContext';
import { getSavedPosts, savePost, unsavePost } from '@/api/posts';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/context/UserContext', () => ({
  useUser: vi.fn(),
}));

vi.mock('@/api/posts', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getSavedPosts: vi.fn(),
    savePost: vi.fn(),
    unsavePost: vi.fn(),
  };
});

vi.mock('sileo', () => ({
  sileo: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('FavoritesContext & useFavorites', () => {
  const mockUser = { id: 'user-1', name: 'John Doe' };

  beforeEach(() => {
    vi.clearAllMocks();
    useUser.mockReturnValue({ user: mockUser });
  });

  const wrapper = ({ children }) => (
    <FavoritesProvider>{children}</FavoritesProvider>
  );

  it('should load favorites on mount for authenticated user', async () => {
    const mockSaved = [
      { id: '101', title: 'Saved item 1' },
      { id: '102', title: 'Saved item 2' },
    ];
    getSavedPosts.mockResolvedValueOnce(mockSaved);

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(getSavedPosts).toHaveBeenCalledTimes(1);
    expect(result.current.favorites).toEqual(['101', '102']);
    expect(result.current.isFavorite('101')).toBe(true);
    expect(result.current.isFavorite('999')).toBe(false);
  });

  it('should call savePost and add ID on toggleFavorite if not already favorited', async () => {
    getSavedPosts.mockResolvedValueOnce([]);
    savePost.mockResolvedValueOnce({ status: 'success' });

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.toggleFavorite('202');
    });

    expect(savePost).toHaveBeenCalledWith('202');
    expect(result.current.favorites).toContain('202');
  });

  it('should call unsavePost and remove ID on toggleFavorite if already favorited', async () => {
    getSavedPosts.mockResolvedValueOnce([{ id: '303' }]);
    unsavePost.mockResolvedValueOnce({ status: 'success' });

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.favorites).toContain('303');

    await act(async () => {
      await result.current.toggleFavorite('303');
    });

    expect(unsavePost).toHaveBeenCalledWith('303');
    expect(result.current.favorites).not.toContain('303');
  });
});
