import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { UserCard } from '@/components/users/UserCard';
import { RoleFilter } from '@/components/users/RoleFilter';
import { UserSearchBar } from '@/components/users/UserSearchBar';
import { PublicNavbar } from '@/components/navigation';
import type { SquadRole } from '@/types/squad';

interface PageProps {
  searchParams: Promise<{ page?: string; role?: string; search?: string }>;
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
  const searchQuery = params.search?.trim() || '';

  // Validate role parameter
  const roleParam = params.role?.toUpperCase();
  const selectedRole = VALID_ROLES.includes(roleParam as SquadRole)
    ? (roleParam as SquadRole)
    : null;

  // Build where clause - filter by squad roles OR primarySquadRole (fallback)
  // Also include search filter if provided
  const roleWhere = selectedRole
    ? {
        OR: [
          { squadMemberships: { some: { role: selectedRole } } },
          { primarySquadRole: selectedRole },
        ],
      }
    : {};

  const searchWhere = searchQuery
    ? {
        OR: [
          { ethosDisplayName: { contains: searchQuery, mode: 'insensitive' as const } },
          { ethosUsername: { contains: searchQuery, mode: 'insensitive' as const } },
          { ethosXHandle: { contains: searchQuery, mode: 'insensitive' as const } },
        ],
      }
    : {};

  // Combine role and search filters
  const where =
    selectedRole && searchQuery
      ? { AND: [roleWhere, searchWhere] }
      : selectedRole
        ? roleWhere
        : searchQuery
          ? searchWhere
          : {};

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
        ethosXId: true,
        ethosProfileId: true,
        primarySquadRole: true,
        squadMemberships: {
          select: { role: true },
        },
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
    if (searchQuery) params.set('search', searchQuery);
    return `/users?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-space-900">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-hull-100">Users</h1>
          <div className="w-72">
            <UserSearchBar />
          </div>
        </div>

        <RoleFilter selectedRole={selectedRole} searchQuery={searchQuery} />

        {users.length === 0 ? (
          <div className="bg-space-800 rounded-xl border border-space-600 shadow-sm p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-space-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-hull-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-hull-100">
              {selectedRole || searchQuery ? 'No users found' : 'No users yet'}
            </h3>
            <p className="mt-2 text-hull-400">
              {selectedRole || searchQuery
                ? 'Try adjusting your search or filter.'
                : 'Be the first to join!'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  squadMemberships={user.squadMemberships}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={buildPageUrl(page - 1)}
                    className="px-4 py-2 text-sm font-medium text-hull-300 bg-space-800 border border-space-600 rounded-lg hover:bg-space-700"
                  >
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-hull-400">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={buildPageUrl(page + 1)}
                    className="px-4 py-2 text-sm font-medium text-hull-300 bg-space-800 border border-space-600 rounded-lg hover:bg-space-700"
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
