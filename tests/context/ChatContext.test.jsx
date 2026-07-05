import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ChatProvider, useChats } from '@/context/ChatContext';
import { useUser } from '@/context/UserContext';
import { mockGetChats } from '@/api/messages';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/context/UserContext', () => ({
  useUser: vi.fn(),
}));

vi.mock('@/api/messages', () => ({
  mockGetChats: vi.fn(),
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
      { id: 'chat-1', lastMessage: 'Conversación iniciada', updatedAt: '2026-01-01T00:00:00.000Z' },
    ];
    mockGetChats.mockResolvedValueOnce(mockChats);

    const { result } = renderHook(() => useChats(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockGetChats).toHaveBeenCalledWith('user-1');
    expect(result.current.chats).toEqual(mockChats);
  });

  it('should calculate hasUnreadMessages correctly based on read timestamps', async () => {
    const mockChats = [
      { id: 'chat-1', lastMessage: 'Hola', updatedAt: '2026-07-01T12:00:00.000Z' },
    ];
    mockGetChats.mockResolvedValueOnce(mockChats);

    const { result } = renderHook(() => useChats(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.hasUnreadMessages).toBe(true);

    act(() => {
      result.current.markChatAsRead('chat-1');
    });

    expect(result.current.hasUnreadMessages).toBe(false);
  });
});
