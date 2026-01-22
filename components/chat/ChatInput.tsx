'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { CHAT_DEFAULTS } from '@/types/chat';

interface ChatInputProps {
  onSend: (content: string) => Promise<boolean>;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = 'Type a message...' }: ChatInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;

    const success = await onSend(trimmed);
    if (success) {
      setContent('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const isOverLimit = content.length > CHAT_DEFAULTS.MAX_MESSAGE_LENGTH;
  const canSend = content.trim().length > 0 && !isOverLimit && !disabled;

  return (
    <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
      <div className="flex items-end gap-2">
        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            tabIndex={-1}
            rows={1}
            className={`
              w-full px-4 py-2 rounded-2xl border resize-none
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${isOverLimit ? 'border-red-500' : 'border-gray-300'}
            `}
            style={{ maxHeight: '120px' }}
          />

          {/* Character count (shown when approaching limit) */}
          {content.length > CHAT_DEFAULTS.MAX_MESSAGE_LENGTH * 0.8 && (
            <span className={`absolute bottom-1 right-3 text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
              {content.length}/{CHAT_DEFAULTS.MAX_MESSAGE_LENGTH}
            </span>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`
            p-2 rounded-full transition-colors
            ${canSend
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
          title="Send message"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-400 mt-1 ml-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
