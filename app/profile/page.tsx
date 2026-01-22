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
          <UserProfile />
        </main>
      </div>
    </AuthGuard>
  );
}
