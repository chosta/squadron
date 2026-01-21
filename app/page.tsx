'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthButtons } from '@/components/auth/AuthButtons';
import { Card } from '@/components/ui/Card';
import { PublicNavbar } from '@/components/navigation';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
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
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-indigo-600">
                      {(user.ethosData.displayName || user.ethosData.username || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome, {user.customDisplayName || user.ethosData.displayName || user.ethosData.username}!
                  </h1>
                  <p className="text-gray-600">
                    Credibility Score: <span className="font-semibold">{user.ethosData.score ?? 'N/A'}</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-500">Total XP</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {user.ethosData.xpTotal?.toLocaleString() || '0'}
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-500">Streak Days</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {user.ethosData.xpStreakDays || '0'}
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-500">Influence Percentile</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {user.ethosData.influencePercentile ? `${user.ethosData.influencePercentile.toFixed(1)}%` : 'N/A'}
                </p>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/profile"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  View Full Profile
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
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
              <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">S</span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Build Your Squad
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Form collaborative groups of 2-7 members with role-based organization.
                Connect with others based on Ethos credibility scores.
              </p>
              <div className="flex justify-center gap-4">
                <AuthButtons />
              </div>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Users</h3>
                <p className="text-gray-600 mb-4">
                  Browse community members, view their Ethos credibility scores, and discover potential squad mates.
                </p>
                <Link
                  href="/users"
                  className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
                >
                  Browse Users
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Squads</h3>
                <p className="text-gray-600 mb-4">
                  Create or join squads with role-based organization. Higher Ethos scores unlock more squad creation slots.
                </p>
                <Link
                  href="/squads"
                  className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
                >
                  Browse Squads
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </Card>
            </div>

            {/* Roles Section */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Squad Roles</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {[
                  { emoji: '🎰', label: 'Degen' },
                  { emoji: '💰', label: 'Sugar Daddy' },
                  { emoji: '📢', label: 'Alpha Caller' },
                  { emoji: '📈', label: 'Trader' },
                  { emoji: '💻', label: 'Dev' },
                  { emoji: '🎨', label: 'Vibe Coder' },
                  { emoji: '🌟', label: 'KOL' },
                ].map((role) => (
                  <div
                    key={role.label}
                    className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200"
                  >
                    <span className="text-3xl mb-2">{role.emoji}</span>
                    <span className="text-sm font-medium text-gray-700">{role.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
