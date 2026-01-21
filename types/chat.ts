import type { User } from './index';

// Base chat message interface
export interface ChatMessage {
  id: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  squadId: string;
  senderId: string;
  isEdited: boolean;
  isDeleted: boolean;
}

// Message with sender info for display
export interface ChatMessageWithSender extends ChatMessage {
  sender: Pick<User, 'id' | 'ethosDisplayName' | 'ethosUsername' | 'ethosAvatarUrl'>;
}

// API response for fetching messages
export interface ChatMessagesResponse {
  success: boolean;
  data?: {
    messages: ChatMessageWithSender[];
    hasMore: boolean;
    oldestMessageId: string | null;
  };
  error?: string;
}

// Request body for sending a message
export interface SendMessageRequest {
  content: string;
}

// Response after sending a message
export interface SendMessageResponse {
  success: boolean;
  data?: ChatMessageWithSender;
  error?: string;
}

// Delete message response
export interface DeleteMessageResponse {
  success: boolean;
  data?: { deleted: boolean };
  error?: string;
}

// Chat room state for hooks
export interface ChatRoomState {
  messages: ChatMessageWithSender[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  hasMore: boolean;
  isPolling: boolean;
}

// Constants
export const CHAT_DEFAULTS = {
  POLLING_INTERVAL_MS: 3000,
  MAX_MESSAGES_PER_FETCH: 50,
  MAX_MESSAGE_LENGTH: 2000,
  MIN_MESSAGE_LENGTH: 1,
} as const;
