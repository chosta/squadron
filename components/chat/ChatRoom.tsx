'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/lib/hooks/useChat';
import { useAuth } from '@/lib/hooks/useAuth';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface ChatRoomProps {
  squadId: string;
  squadName: string;
  isActive: boolean;
}

export function ChatRoom({ squadId, squadName, isActive }: ChatRoomProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [hasInitiallyMounted, setHasInitiallyMounted] = useState(false);

  const {
    messages,
    isLoading,
    isSending,
    error,
    hasMore,
    sendMessage,
    deleteMessage,
    loadMore,
  } = useChat({
    squadId,
    enabled: isActive,
  });

  // Auto-scroll to bottom when new messages arrive (skip on initial mount)
  useEffect(() => {
    if (!hasInitiallyMounted) {
      setHasInitiallyMounted(true);
      return;
    }
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, hasInitiallyMounted]);

  // Handle scroll for loading more messages
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop === 0 && hasMore && !isLoading) {
      loadMore();
    }
  };

  // Chat unavailable state
  if (!isActive) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-50 rounded-lg p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Chat Unavailable
          </h3>
          <p className="text-gray-500">
            Chat rooms become available when the squad has at least 2 members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h2 className="font-semibold text-gray-800">
          {squadName} Chat
        </h2>
        <p className="text-xs text-gray-500">
          {messages.length} messages
        </p>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Load More Button */}
        {hasMore && (
          <div className="text-center pb-2">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="text-sm text-primary-600 hover:text-primary-800 disabled:text-gray-400"
            >
              {isLoading ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">👋</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => {
          const isOwn = message.senderId === user?.id;
          const showAvatar = index === 0 ||
            messages[index - 1].senderId !== message.senderId;

          return (
            <ChatMessage
              key={message.id}
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
              onDelete={isOwn ? () => deleteMessage(message.id) : undefined}
            />
          );
        })}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Input Area */}
      <ChatInput
        onSend={sendMessage}
        disabled={isSending}
        placeholder="Type a message..."
      />
    </div>
  );
}
