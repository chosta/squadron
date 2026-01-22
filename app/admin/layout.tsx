'use client';

import { AdminNav } from '@/components/AdminNav';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <AdminNav />
        <main className="flex-1 bg-space-900 p-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
