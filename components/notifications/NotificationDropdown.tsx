'use client';

import { useEffect, useRef } from 'react';
import type { Notification } from '@/types/position';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
  isLoading = false,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        {hasUnread && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p className="text-2xl mb-2">🔔</p>
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
