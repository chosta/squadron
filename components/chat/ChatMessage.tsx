'use client';

import { useState } from 'react';
import type { ChatMessageWithSender } from '@/types/chat';

interface ChatMessageProps {
  message: ChatMessageWithSender;
  isOwn: boolean;
  showAvatar: boolean;
  onDelete?: () => void;
}

// Simple relative time formatter
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export function ChatMessage({ message, isOwn, showAvatar, onDelete }: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false);

  const { sender } = message;
  const displayName = sender.ethosDisplayName || sender.ethosUsername || 'Unknown';
  const avatarUrl = sender.ethosAvatarUrl;

  const timeAgo = formatTimeAgo(message.createdAt);

  // Deleted message display
  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className="px-4 py-2 rounded-lg bg-space-700 text-hull-500 italic text-sm">
          Message deleted
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
        {/* Avatar */}
        {showAvatar && !isOwn ? (
          <div className="flex-shrink-0 w-8 h-8">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ) : !isOwn ? (
          <div className="w-8" />
        ) : null}

        {/* Message Bubble */}
        <div className="flex flex-col">
          {/* Sender name (only for first message in a group) */}
          {showAvatar && !isOwn && (
            <span className="text-xs text-hull-400 mb-1 ml-1">
              {displayName}
            </span>
          )}

          <div
            className={`
              relative px-4 py-2 rounded-2xl
              ${isOwn
                ? 'bg-primary-600 text-white rounded-br-md'
                : 'bg-space-700 text-hull-100 rounded-bl-md'
              }
            `}
          >
            {/* Message content */}
            <p className="whitespace-pre-wrap break-words">{message.content}</p>

            {/* Timestamp and edited indicator */}
            <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'text-primary-200' : 'text-hull-400'}`}>
              <span>{timeAgo}</span>
              {message.isEdited && <span>· edited</span>}
            </div>

            {/* Delete action */}
            {showActions && onDelete && (
              <button
                onClick={onDelete}
                className={`
                  absolute -top-2 ${isOwn ? '-left-2' : '-right-2'}
                  p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200
                  opacity-0 group-hover:opacity-100 transition-opacity
                `}
                title="Delete message"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
