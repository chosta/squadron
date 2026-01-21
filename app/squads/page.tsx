import { squadService } from '@/lib/services/squad-service';
import { getSession } from '@/lib/auth/session';
import Link from 'next/link';
import { SquadCard } from '@/components/squads/SquadCard';
import { PublicNavbar } from '@/components/navigation';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function SquadsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const limit = 12;

  const [{ squads, total }, session] = await Promise.all([
    squadService.listSquads({ page, limit, activeOnly: false }),
    getSession(),
  ]);
  const totalPages = Math.ceil(total / limit);

  // Get user's squad IDs for quick lookup
  const userSquadIds = session
    ? new Set((await squadService.getUserSquads(session.userId)).map((s) => s.id))
    : new Set<string>();

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Squads</h1>
          <p className="mt-2 text-gray-600">
            Browse all squads and find your next team.
          </p>
          <div className="mt-4 flex gap-4">
            <span className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg">
              All Squads
            </span>
            <Link
              href="/squads/positions"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Open Positions
            </Link>
          </div>
        </div>

        {squads.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No squads yet</h3>
            <p className="mt-2 text-gray-500">
              Be the first to create a squad!
            </p>
            <Link
              href="/dashboard/squads/create"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Create Squad
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {squads.map((squad) => (
                <SquadCard
                  key={squad.id}
                  squad={squad}
                  showManage={userSquadIds.has(squad.id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/squads?page=${page - 1}`}
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
                    href={`/squads?page=${page + 1}`}
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
