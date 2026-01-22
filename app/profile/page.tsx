'use client';

export const dynamic = 'force-dynamic';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { UserProfile } from '@/components/profile/UserProfile';
import { PublicNavbar } from '@/components/navigation';

export default function ProfilePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-space-900">
        <PublicNavbar />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-hull-100">Your Profile</h1>
            <p className="text-hull-400 mt-1">
              View your Ethos profile and manage app settings
            </p>
          </div>

          <UserProfile />
        </main>
      </div>
    </AuthGuard>
  );
}
