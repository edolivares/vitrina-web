import { renderHook, act } from '@testing-library/react';
import { ChatProvider, useChats } from '@/context/ChatContext';
import { useUser } from '@/context/UserContext';
import { getChats, markChatAsRead } from '@/api/messages';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/context/UserContext', () => ({
  useUser: vi.fn(),
}));

vi.mock('@/api/messages', () => ({
  getChats: vi.fn(),
  mapChatResponse: vi.fn((chat) => chat),
  markChatAsRead: vi.fn(),
}));

vi.mock('@/lib/realtime', () => ({
  disconnectPusher: vi.fn(),
  getPusherClient: vi.fn(() => null),
  userChannelName: vi.fn((userId) => `private-user-${userId}`),
}));

describe('ChatContext & useChats', () => {
  const mockUser = { id: 'user-1', name: 'John Doe' };

  beforeEach(() => {
    vi.clearAllMocks();
    useUser.mockReturnValue({ user: mockUser });
  });

  const wrapper = ({ children }) => (
    <ChatProvider>{children}</ChatProvider>
  );

  it('should load chats on mount for authenticated user', async () => {
    const mockChats = [
      { id: 'chat-1', lastMessage: 'Conversación iniciada', isUnread: false, updatedAt: '2026-01-01T00:00:00.000Z' },
    ];
    getChats.mockResolvedValueOnce(mockChats);

    const { result } = renderHook(() => useChats(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(getChats).toHaveBeenCalled();
    expect(result.current.chats).toEqual(mockChats);
  });

  it('should calculate hasUnreadMessages correctly based on isUnread flag', async () => {
    const mockChats = [
      { id: 'chat-1', lastMessage: 'Hola', isUnread: true, updatedAt: '2026-07-01T12:00:00.000Z' },
    ];
    getChats.mockResolvedValueOnce(mockChats);
    markChatAsRead.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useChats(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.hasUnreadMessages).toBe(true);

    await act(async () => {
      await result.current.markChatAsRead('chat-1');
    });

    expect(result.current.hasUnreadMessages).toBe(false);
  });
});
