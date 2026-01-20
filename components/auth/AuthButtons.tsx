'use client';

import { useAuth } from './AuthProvider';
import { SignInButton } from './SignInButton';
import { SignOutButton } from './SignOutButton';

interface AuthButtonsProps {
  className?: string;
}

/**
 * Contextual auth buttons for header/nav
 * Shows sign in when not authenticated, user info + sign out when authenticated
 */
export function AuthButtons({ className = '' }: AuthButtonsProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <SignInButton className={className} />;
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        {user.ethosData.avatarUrl ? (
          <img
            src={user.ethosData.avatarUrl}
            alt={user.ethosData.displayName || 'User'}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-medium text-sm">
              {(user.ethosData.displayName || user.ethosData.username || 'U')[0].toUpperCase()}
            </span>
          </div>
        )}
        <span className="text-sm font-medium text-gray-700">
          {user.customDisplayName || user.ethosData.displayName || user.ethosData.username || 'User'}
        </span>
      </div>
      <SignOutButton />
    </div>
  );
}
