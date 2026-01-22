'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [landingStats, setLandingStats] = useState<LandingStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      fetch('/api/landing-stats')
        .then((res) => res.json())
        .then((data) => {
          setLandingStats(data);
          setStatsLoading(false);
        })
        .catch(() => setStatsLoading(false));
    }
  }, [isAuthenticated, isLoading]);

  // Show loading while checking auth or redirecting
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-space-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          <p className="text-hull-400">{isAuthenticated ? 'Redirecting...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Public landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-space-900">
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                <h3 className="text-lg font-semibold text-hull-100 mb-2">The Network</h3>
                <p className="text-hull-400 mb-4">
                  Scout vetted experts, view their Ethos credibility, and assemble your dream team.
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
                <h3 className="text-lg font-semibold text-hull-100 mb-2">The Units</h3>
                <p className="text-hull-400 mb-4">
                  Command your own unit as Captain or join an existing squad based on the strength of your expertise and Ethos reputation.
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
                <h3 className="text-lg font-semibold text-hull-100 mb-2">The Missions</h3>
                <p className="text-hull-400 mb-4">
                  Find your next role. Browse squad openings that align with your rank and specialized skills.
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
      </main>
    </div>
  );
}
