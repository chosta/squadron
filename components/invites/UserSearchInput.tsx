'use client';

import { useState, useEffect, useRef } from 'react';
import type { User } from '@/types';

interface UserSearchInputProps {
  onSelect: (user: User) => void;
  excludeUserIds?: string[];
  placeholder?: string;
}

export function UserSearchInput({
  onSelect,
  excludeUserIds = [],
  placeholder = 'Search users...',
}: UserSearchInputProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/users?search=${encodeURIComponent(query)}&limit=10`);
        const data = await response.json();
        if (data.success && data.data) {
          setUsers(data.data.filter((u: User) => !excludeUserIds.includes(u.id)));
        }
      } catch (error) {
        console.error('Failed to search users:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query, excludeUserIds]);

  const handleSelect = (user: User) => {
    onSelect(user);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        className="block w-full px-3 py-2 border border-space-600 rounded-lg bg-space-700 text-hull-100 text-sm placeholder:text-hull-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
      {showDropdown && (query.length >= 2 || loading) && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-space-700 rounded-lg border border-space-600 shadow-lg max-h-60 overflow-auto"
        >
          {loading ? (
            <div className="p-3 text-sm text-hull-400 text-center">
              Searching...
            </div>
          ) : users.length === 0 ? (
            <div className="p-3 text-sm text-hull-400 text-center">
              No users found
            </div>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                className="w-full flex items-center gap-3 p-3 hover:bg-space-600 text-left"
              >
                {user.ethosAvatarUrl ? (
                  <img
                    src={user.ethosAvatarUrl}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-space-600 flex items-center justify-center">
                    <span className="text-hull-300 text-xs font-medium">
                      {(user.ethosDisplayName || user.ethosUsername || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-hull-100 truncate">
                    {user.ethosDisplayName || user.ethosUsername || 'Unknown'}
                  </p>
                  {user.ethosScore !== null && (
                    <p className="text-xs text-hull-400">
                      Score: {user.ethosScore}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
