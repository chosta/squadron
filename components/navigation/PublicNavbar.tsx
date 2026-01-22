'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { SignInButton } from '@/components/auth/SignInButton';
import { NavLogo } from './NavLogo';
import { NavLink } from './NavLink';
import { ProfileDropdown } from './ProfileDropdown';

export function PublicNavbar() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="bg-space-800 border-b border-space-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <NavLogo />

          <nav className="flex items-center gap-6">
            <NavLink href="/users">Users</NavLink>
            <NavLink href="/squads">Squads</NavLink>
            {isAuthenticated && (
              <NavLink href="/dashboard">Dashboard</NavLink>
            )}

            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-space-700 animate-pulse" />
            ) : isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <SignInButton className="!px-4 !py-2 text-sm" />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
