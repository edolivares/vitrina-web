import { renderHook, act } from '@testing-library/react';
import { useProfile } from '@/hooks/useProfile';
import { useUser } from '@/context/UserContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getPostsBySeller, getDraftsBySeller, updatePostStatus, deletePost, getPublicProfile } from '@/api/posts';
import { getChats } from '@/api/messages';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/context/UserContext', () => ({
  useUser: vi.fn(),
}));

vi.mock('@/context/FavoritesContext', () => ({
  useFavorites: vi.fn(),
}));

vi.mock('@/api/posts', () => ({
  getPostsBySeller: vi.fn(),
  getDraftsBySeller: vi.fn(),
  getPostById: vi.fn(),
  updatePostStatus: vi.fn(),
  deletePost: vi.fn(),
  getPublicProfile: vi.fn(),
}));

vi.mock('@/api/messages', () => ({
  getChats: vi.fn(),
}));

vi.mock('sileo', () => ({
  sileo: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useProfile Hook', () => {
  const mockUser = { id: 'user-1', name: 'John Doe', email: 'john@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    useUser.mockReturnValue({ user: mockUser, updateUser: vi.fn() });
    useFavorites.mockReturnValue({ favorites: [] });
    getPublicProfile.mockResolvedValue({
      profile: {
        reviewScore: 4.5,
        reviewCount: 10,
        reviewSummary: 'Muy bueno',
        reviews: []
      }
    });
  });

  it('should fetch user posts, drafts and chats on load', async () => {
    const mockPosts = [{ id: 'post-1', title: 'My Post' }];
    const mockDrafts = [{ id: 'draft-1', title: 'Draft Post' }];
    const mockChats = [{ id: 'chat-1', lastMessage: 'Hello' }];

    getPostsBySeller.mockResolvedValueOnce(mockPosts);
    getChats.mockResolvedValueOnce(mockChats);
    getDraftsBySeller.mockResolvedValueOnce(mockDrafts);

    const { result } = renderHook(() => useProfile());

    await act(async () => {
      await Promise.resolve();
    });

    expect(getPostsBySeller).toHaveBeenCalledWith('user-1');
    expect(getChats).toHaveBeenCalled();
    expect(getDraftsBySeller).toHaveBeenCalledWith('user-1');

    expect(result.current.userPosts).toEqual(mockPosts);
    expect(result.current.drafts).toEqual(mockDrafts);
    expect(result.current.sellerChats).toEqual(mockChats);
    expect(result.current.loading).toBe(false);
  });

  it('should call updatePostStatus and refresh when handleUpdateStatus is called', async () => {
    getPostsBySeller.mockResolvedValue([]);
    getChats.mockResolvedValue([]);
    getDraftsBySeller.mockResolvedValue([]);
    updatePostStatus.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useProfile());

    await act(async () => {
      await result.current.handleUpdateStatus('post-123', 'ARCHIVED');
    });

    expect(updatePostStatus).toHaveBeenCalledWith('post-123', 'ARCHIVED');
    expect(getPostsBySeller).toHaveBeenCalledTimes(2);
  });

  it('should call deletePost and refresh when handleDeletePost is called', async () => {
    getPostsBySeller.mockResolvedValue([]);
    getChats.mockResolvedValue([]);
    getDraftsBySeller.mockResolvedValue([]);
    deletePost.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useProfile());

    await act(async () => {
      await result.current.handleDeletePost('post-123');
    });

    expect(deletePost).toHaveBeenCalledWith('post-123');
    expect(getPostsBySeller).toHaveBeenCalledTimes(2);
  });
});
