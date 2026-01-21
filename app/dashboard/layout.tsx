import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ProfileDropdown } from '@/components/navigation/ProfileDropdown';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-end gap-4">
          <NotificationBell />
          <ProfileDropdown />
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
