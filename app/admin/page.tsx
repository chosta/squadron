import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

async function getStats() {
  const [total, byStatus, byRole] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }),
  ]);

  const statusMap = Object.fromEntries(
    byStatus.map((s) => [s.status, s._count])
  );

  const roleMap = Object.fromEntries(
    byRole.map((r) => [r.role, r._count])
  );

  return { total, statusMap, roleMap };
}

export default async function AdminDashboard() {
  const { total, statusMap, roleMap } = await getStats();

  const statCards = [
    { label: 'Total Users', value: total, color: 'bg-primary-500' },
    { label: 'Active', value: statusMap.ACTIVE || 0, color: 'bg-green-500' },
    { label: 'Pending', value: statusMap.PENDING || 0, color: 'bg-yellow-500' },
    { label: 'Suspended', value: statusMap.SUSPENDED || 0, color: 'bg-red-500' },
  ];

  const roleCards = [
    { label: 'Admins', value: roleMap.ADMIN || 0 },
    { label: 'Moderators', value: roleMap.MODERATOR || 0 },
    { label: 'Users', value: roleMap.USER || 0 },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your user base</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h2>
          <div className="space-y-4">
            {roleCards.map((role) => (
              <div key={role.label} className="flex items-center justify-between">
                <span className="text-gray-600">{role.label}</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                    <div
                      className="h-2 bg-primary-500 rounded-full"
                      style={{ width: `${total > 0 ? (role.value / total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-gray-900 font-medium w-8 text-right">{role.value}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/users/new"
              className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="ml-3 font-medium text-gray-900">Add User</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="ml-3 font-medium text-gray-900">View All Users</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
