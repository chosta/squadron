'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import type { ChatMessageWithSender, ChatRoomState, CHAT_DEFAULTS } from '@/types/chat';

interface UseChatOptions {
  squadId: string;
  enabled?: boolean;
  pollingIntervalMs?: number;
}

const DEFAULT_POLLING_INTERVAL = 3000;

export function useChat({
  squadId,
  enabled = true,
  pollingIntervalMs = DEFAULT_POLLING_INTERVAL,
}: UseChatOptions) {
  const [state, setState] = useState<ChatRoomState>({
    messages: [],
    isLoading: true,
    isSending: false,
    error: null,
    hasMore: false,
    isPolling: false,
  });

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Fetch messages
  const fetchMessages = useCallback(async (before?: string) => {
    try {
      const response = await apiClient.getChatMessages(squadId, { before });

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          messages: before
            ? [...response.data!.messages, ...prev.messages]
            : response.data!.messages,
          hasMore: response.data!.hasMore,
          isLoading: false,
          error: null,
        }));

        // Track latest message for polling
        const latestMessage = response.data.messages[response.data.messages.length - 1];
        if (latestMessage) {
          lastMessageIdRef.current = latestMessage.id;
        }
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to fetch messages',
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch messages',
        isLoading: false,
      }));
    }
  }, [squadId]);

  // Poll for new messages
  const pollForNewMessages = useCallback(async () => {
    if (!enabled) return;

    try {
      const response = await apiClient.getChatMessages(squadId);

      if (response.success && response.data) {
        const newMessages = response.data.messages;

        // Only update if there are new messages
        if (newMessages.length > 0) {
          const latestNewId = newMessages[newMessages.length - 1].id;

          if (latestNewId !== lastMessageIdRef.current) {
            setState(prev => ({
              ...prev,
              messages: newMessages,
              error: null,
            }));
            lastMessageIdRef.current = latestNewId;
          }
        }
      }
    } catch (error) {
      // Silent fail for polling - don't update error state
      console.error('Polling error:', error);
    }
  }, [squadId, enabled]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return false;

    setState(prev => ({ ...prev, isSending: true }));

    try {
      const response = await apiClient.sendChatMessage(squadId, content);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, response.data!],
          isSending: false,
          error: null,
        }));
        lastMessageIdRef.current = response.data.id;
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to send message',
          isSending: false,
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to send message',
        isSending: false,
      }));
      return false;
    }
  }, [squadId]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const response = await apiClient.deleteChatMessage(squadId, messageId);

      if (response.success) {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId ? { ...msg, isDeleted: true } : msg
          ),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete message:', error);
      return false;
    }
  }, [squadId]);

  // Load older messages
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.isLoading) return;

    const oldestMessage = state.messages[0];
    if (oldestMessage) {
      await fetchMessages(oldestMessage.id);
    }
  }, [state.hasMore, state.isLoading, state.messages, fetchMessages]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchMessages();
    }
  }, [enabled, fetchMessages]);

  // Setup polling
  useEffect(() => {
    if (!enabled) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    setState(prev => ({ ...prev, isPolling: true }));

    pollingRef.current = setInterval(pollForNewMessages, pollingIntervalMs);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      setState(prev => ({ ...prev, isPolling: false }));
    };
  }, [enabled, pollingIntervalMs, pollForNewMessages]);

  return {
    ...state,
    sendMessage,
    deleteMessage,
    loadMore,
    refresh: () => fetchMessages(),
  };
}
