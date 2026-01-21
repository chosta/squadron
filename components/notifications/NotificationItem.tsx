'use client';

import Link from 'next/link';
import type { Notification, NotificationType } from '@/types/position';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => Promise<void>;
}

const typeIcons: Record<NotificationType, { icon: string; color: string }> = {
  APPLICATION_RECEIVED: { icon: '📥', color: 'bg-blue-100' },
  APPLICATION_APPROVED: { icon: '✅', color: 'bg-green-100' },
  APPLICATION_REJECTED: { icon: '❌', color: 'bg-red-100' },
  APPLICATION_EXPIRED: { icon: '⏰', color: 'bg-gray-100' },
  POSITION_DELETED: { icon: '🗑️', color: 'bg-gray-100' },
};

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const { icon, color } = typeIcons[notification.type];
  const createdAt = new Date(notification.createdAt);
  const timeAgo = getTimeAgo(createdAt);

  const handleClick = async () => {
    if (!notification.read) {
      await onMarkAsRead(notification.id);
    }
  };

  // Determine link based on notification type
  let href = '#';
  if (notification.squadId) {
    if (notification.type === 'APPLICATION_RECEIVED') {
      href = `/dashboard/squads/${notification.squadId}`;
    } else {
      href = `/squads/${notification.squadId}`;
    }
  }

  const content = (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
        notification.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
      }`}
      onClick={handleClick}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${color} flex items-center justify-center`}>
        <span className="text-sm">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
          {notification.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
      </div>
      {!notification.read && (
        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
      )}
    </div>
  );

  if (href === '#') {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
