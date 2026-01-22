'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserAvatar } from '@/components/users/UserAvatar';

export function ProfileDropdown() {
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const displayName = user.customDisplayName || user.ethosData.displayName || user.ethosData.username || 'User';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-space-600 transition-all"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <UserAvatar
          src={user.ethosData.avatarUrl}
          name={displayName}
          size="sm"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-space-800 rounded-lg shadow-lg border border-space-600 py-1 z-50">
          <div className="px-4 py-2 border-b border-space-700">
            <p className="text-sm font-medium text-hull-100 truncate">{displayName}</p>
            {user.ethosData.score !== null && (
              <p className="text-xs text-hull-400">Score: {user.ethosData.score}</p>
            )}
          </div>

          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-hull-300 hover:bg-space-700"
          >
            View Profile
          </Link>

          <div className="border-t border-space-700">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              disabled={isLoading}
              className="w-full text-left px-4 py-2 text-sm text-hull-300 hover:bg-space-700 disabled:opacity-50"
            >
              {isLoading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
