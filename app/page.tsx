'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthButtons } from '@/components/auth/AuthButtons';
import { Card } from '@/components/ui/Card';
import { PublicNavbar } from '@/components/navigation';
import { UserAvatar } from '@/components/users/UserAvatar';

interface LandingStats {
  users: Array<{
    id: string;
    ethosDisplayName: string | null;
    ethosUsername: string | null;
    ethosAvatarUrl: string | null;
  }>;
  squads: Array<{
    id: string;
    name: string;
    avatarUrl: string | null;
  }>;
  openPositionCount: number;
}

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [landingStats, setLandingStats] = useState<LandingStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      fetch('/api/landing-stats')
        .then((res) => res.json())
        .then((data) => {
          setLandingStats(data);
          setStatsLoading(false);
        })
        .catch(() => setStatsLoading(false));
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-space-900">
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : isAuthenticated && user ? (
          <div className="space-y-8">
            {/* Welcome Section */}
            <Card className="p-6">
              <div className="flex items-center gap-4">
                {user.ethosData.avatarUrl ? (
                  <img
                    src={user.ethosData.avatarUrl}
                    alt={user.ethosData.displayName || 'User'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-400">
                      {(user.ethosData.displayName || user.ethosData.username || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-hull-100">
                    Welcome, {user.customDisplayName || user.ethosData.displayName || user.ethosData.username}!
                  </h1>
                  <p className="text-hull-400">
                    Credibility Score: <span className="font-semibold">{user.ethosData.score ?? 'N/A'}</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-sm font-medium text-hull-400">Total XP</h3>
                <p className="mt-2 text-3xl font-bold text-hull-100">
                  {user.ethosData.xpTotal?.toLocaleString() || '0'}
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-hull-400">Streak Days</h3>
                <p className="mt-2 text-3xl font-bold text-hull-100">
                  {user.ethosData.xpStreakDays || '0'}
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-hull-400">Influence Percentile</h3>
                <p className="mt-2 text-3xl font-bold text-hull-100">
                  {user.ethosData.influencePercentile ? `${user.ethosData.influencePercentile.toFixed(1)}%` : 'N/A'}
                </p>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-hull-100 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/profile"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  View Full Profile
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center px-4 py-2 bg-space-700 hover:bg-space-600 text-hull-300 rounded-lg transition-colors"
                >
                  Admin Panel
                </Link>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Hero Section */}
            <div className="text-center py-12">
              <p className="text-2xl sm:text-3xl italic text-hull-300 mb-8 max-w-3xl mx-auto">
                &ldquo;If you want to move fast, go alone. If you want to move far, go together.&rdquo;
              </p>
              <p className="text-xl text-hull-400 mb-8 max-w-2xl mx-auto">
                Assemble Your Squad. Skilled individuals. Tactical units. Unstoppable results. Use your Ethos credibility to find the right team and conquer your next big objective.
              </p>
              <div className="flex justify-center gap-4">
                <AuthButtons />
              </div>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-hull-100 mb-2">Users</h3>
                <p className="text-hull-400 mb-4">
                  Browse community members, view their Ethos credibility scores, and discover potential squad mates.
                </p>
                {/* Overlapping User Avatars */}
                {!statsLoading && landingStats?.users && landingStats.users.length > 0 && (
                  <div className="flex items-center mb-4">
                    {landingStats.users.map((u, index) => (
                      <div
                        key={u.id}
                        className={index > 0 ? '-ml-2' : ''}
                        style={{ zIndex: landingStats.users.length - index }}
                      >
                        <UserAvatar
                          src={u.ethosAvatarUrl}
                          name={u.ethosDisplayName || u.ethosUsername}
                          size="sm"
                          className="ring-2 ring-space-900"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <Link
                  href="/users"
                  className="mt-auto text-primary-400 hover:text-primary-300 font-medium inline-flex items-center gap-1"
                >
                  Browse Users
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </Card>

              <Card className="p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-hull-100 mb-2">Squads</h3>
                <p className="text-hull-400 mb-4">
                  Create or join squads with role-based organization. Higher Ethos scores unlock more squad creation slots.
                </p>
                {/* Overlapping Squad Avatars */}
                {!statsLoading && landingStats?.squads && landingStats.squads.length > 0 && (
                  <div className="flex items-center mb-4">
                    {landingStats.squads.map((squad, index) => (
                      <div
                        key={squad.id}
                        className={index > 0 ? '-ml-2' : ''}
                        style={{ zIndex: landingStats.squads.length - index }}
                      >
                        {squad.avatarUrl ? (
                          <img
                            src={squad.avatarUrl}
                            alt={squad.name}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-space-900"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center ring-2 ring-space-900">
                            <span className="text-xs font-semibold text-purple-400">
                              {squad.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Link
                  href="/squads"
                  className="mt-auto text-primary-400 hover:text-primary-300 font-medium inline-flex items-center gap-1"
                >
                  Browse Squads
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </Card>

              <Card className="p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-hull-100 mb-2">Open Positions</h3>
                <p className="text-hull-400 mb-4">
                  Find your role in an active squad. Browse open positions that match your skills and Ethos credibility tier.
                </p>
                {/* Position Count */}
                {!statsLoading && landingStats && (
                  <p className="text-sm text-hull-500 mb-4">
                    {landingStats.openPositionCount > 0
                      ? `${landingStats.openPositionCount} position${landingStats.openPositionCount === 1 ? '' : 's'} available`
                      : 'No positions currently open'}
                  </p>
                )}
                <Link
                  href="/squads/positions"
                  className="mt-auto text-primary-400 hover:text-primary-300 font-medium inline-flex items-center gap-1"
                >
                  Browse Positions
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </Card>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
