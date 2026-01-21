import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { UserCard } from '@/components/users/UserCard';
import { RoleFilter } from '@/components/users/RoleFilter';
import { PublicNavbar } from '@/components/navigation';
import type { SquadRole } from '@/types/squad';

interface PageProps {
  searchParams: Promise<{ page?: string; role?: string }>;
}

// Valid squad roles for filtering
const VALID_ROLES: SquadRole[] = [
  'DEGEN',
  'SUGAR_DADDY',
  'ALPHA_CALLER',
  'TRADER',
  'DEV',
  'VIBE_CODER',
  'KOL',
  'WHALE',
  'RESEARCHER',
  'COMMUNITY_BUILDER',
];

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const limit = 12;
  const skip = (page - 1) * limit;

  // Validate role parameter
  const roleParam = params.role?.toUpperCase();
  const selectedRole = VALID_ROLES.includes(roleParam as SquadRole)
    ? (roleParam as SquadRole)
    : null;

  // Build where clause
  const where = selectedRole ? { primarySquadRole: selectedRole } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { ethosScore: { sort: 'desc', nulls: 'last' } },
      select: {
        id: true,
        ethosDisplayName: true,
        ethosUsername: true,
        ethosAvatarUrl: true,
        ethosScore: true,
        primarySquadRole: true,
        _count: {
          select: { squadMemberships: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Build pagination URL helper
  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set('page', String(pageNum));
    if (selectedRole) params.set('role', selectedRole);
    return `/users?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-2 text-gray-600">
            Browse all users in the Squadron community.
          </p>
        </div>

        <RoleFilter selectedRole={selectedRole} />

        {users.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedRole ? 'No users found' : 'No users yet'}
            </h3>
            <p className="mt-2 text-gray-500">
              {selectedRole
                ? 'Try selecting a different role or clearing the filter.'
                : 'Be the first to join!'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={buildPageUrl(page - 1)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={buildPageUrl(page + 1)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
