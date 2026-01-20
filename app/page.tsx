import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge, getStatusBadgeVariant, getRoleBadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

async function getUsers() {
  const users = await prisma.user.findMany({
    take: 12,
    orderBy: { createdAt: 'desc' },
  });
  return users;
}

export default async function HomePage() {
  const users = await getUsers();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container-app py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Squadron</h1>
              <p className="mt-1 text-sm text-gray-500">User management platform</p>
            </div>
            <Link href="/admin">
              <Button variant="primary">Admin Panel</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container-app py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
          <p className="text-sm text-gray-500">Showing the most recently added users</p>
        </div>

        {users.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
              <div className="mt-6">
                <Link href="/admin/users/new">
                  <Button>Create User</Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-medium text-sm">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                  <Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View details &rarr;
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
