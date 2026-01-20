'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthButtons } from '@/components/auth/AuthButtons';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="font-semibold text-gray-900">Squadron</span>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <>
                  <Link
                    href="/profile"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/admin"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Admin
                  </Link>
                </>
              )}
              <AuthButtons />
            </div>
          </div>
        </div>
      </header>

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
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl font-bold">S</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Squadron
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Sign in with your Ethos profile to get started
            </p>
            <div className="flex justify-center">
              <AuthButtons />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
