import { squadService } from '@/lib/services/squad-service';
import { getSession } from '@/lib/auth/session';
import Link from 'next/link';
import { SquadCard } from '@/components/squads/SquadCard';
import { SquadSearchBar } from '@/components/squads/SquadSearchBar';
import { PublicNavbar } from '@/components/navigation';

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function SquadsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const search = params.search || '';
  const limit = 12;

  const [{ squads, total }, session] = await Promise.all([
    squadService.listSquads({ page, limit, activeOnly: false, search }),
    getSession(),
  ]);
  const totalPages = Math.ceil(total / limit);

  // Get user's squad IDs for quick lookup
  const userSquadIds = session
    ? new Set((await squadService.getUserSquads(session.userId)).map((s) => s.id))
    : new Set<string>();

  // Build pagination URL with search preserved
  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set('page', pageNum.toString());
    if (search) params.set('search', search);
    return `/squads?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-space-900">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-hull-100">Squads</h1>
          <div className="w-72">
            <SquadSearchBar />
          </div>
        </div>

        {squads.length === 0 ? (
          <div className="bg-space-800 rounded-xl border border-space-600 shadow-sm p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-space-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-hull-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-hull-100">
              {search ? 'No squads found' : 'No squads yet'}
            </h3>
            <p className="mt-2 text-hull-400">
              {search
                ? 'Try adjusting your search terms.'
                : 'Be the first to create a squad!'}
            </p>
            {!search && (
              <Link
                href="/dashboard/squads/create"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Create Squad
              </Link>
            )}
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
