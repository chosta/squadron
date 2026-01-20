'use client';

export const dynamic = 'force-dynamic';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuthButtons } from '@/components/auth/AuthButtons';
import { UserProfile } from '@/components/profile/UserProfile';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="font-semibold text-gray-900">Squadron</span>
              </Link>
              <AuthButtons />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
            <p className="text-gray-600 mt-1">
              View your Ethos profile and manage app settings
            </p>
          </div>

          <UserProfile />
        </main>
      </div>
    </AuthGuard>
  );
}
