import { getSession } from '@/lib/auth/session';
import { squadService } from '@/lib/services/squad-service';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SquadCard } from '@/components/squads/SquadCard';
import { SquadQuota } from '@/components/squads/SquadQuota';

export default async function SquadsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const squads = await squadService.getUserSquads(session.userId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-hull-100">My Squads</h1>
        </div>
        <div className="flex items-center gap-4">
          <SquadQuota variant="inline" />
          <Link
            href="/dashboard/squads/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Squad
          </Link>
        </div>
      </div>

      {squads.length === 0 ? (
        <div className="bg-space-800 rounded-xl border border-space-600 shadow-sm p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-space-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-hull-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-hull-100">No squads yet</h3>
          <p className="mt-2 text-hull-400">
            Create your first squad or wait for someone to invite you.
          </p>
          <Link
            href="/dashboard/squads/create"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Create your first squad
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {squads.map((squad) => (
            <SquadCard
              key={squad.id}
              squad={squad}
              showManage={squad.captainId === session.userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
