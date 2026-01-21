import { getSession } from '@/lib/auth/session';
import { squadService } from '@/lib/services/squad-service';
import { inviteService } from '@/lib/services/invite-service';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { PublicNavbar } from '@/components/navigation';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const [squads, invites, eligibility] = await Promise.all([
    squadService.getUserSquads(session.userId),
    inviteService.getUserPendingInvites(session.userId),
    squadService.canUserCreateSquad(session.userId),
  ]);

  const activeSquads = squads.filter((s) => s.isActive);
  const captainedSquads = squads.filter((s) => s.captainId === session.userId);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Welcome back! Here&apos;s an overview of your squads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">My Squads</p>
                <p className="text-2xl font-bold text-gray-900">{squads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Squads</p>
                <p className="text-2xl font-bold text-gray-900">{activeSquads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">As Captain</p>
                <p className="text-2xl font-bold text-gray-900">{captainedSquads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Invites</p>
                <p className="text-2xl font-bold text-gray-900">{invites.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Squads</h2>
            <Link
              href="/dashboard/squads"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          {squads.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">You&apos;re not in any squads yet.</p>
                <Link
                  href="/dashboard/squads/create"
                  className="mt-2 inline-block text-primary-600 hover:text-primary-700 font-medium"
                >
                  Create your first squad
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {squads.slice(0, 3).map((squad) => (
                <Card key={squad.id} padding="sm">
                  <Link
                    href={`/dashboard/squads/${squad.id}`}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                  >
                    {squad.avatarUrl ? (
                      <img
                        src={squad.avatarUrl}
                        alt={squad.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {squad.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{squad.name}</p>
                      <p className="text-sm text-gray-500">
                        {squad._count?.members ?? squad.members.length} members
                      </p>
                    </div>
                    {squad.captainId === session.userId && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Captain
                      </span>
                    )}
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pending Invites</h2>
            {invites.length > 0 && (
              <Link
                href="/dashboard/invites"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View all
              </Link>
            )}
          </div>
          {invites.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No pending invites.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {invites.slice(0, 3).map((invite) => (
                <Card key={invite.id} padding="sm">
                  <div className="flex items-center gap-3 p-2">
                    {invite.squad.avatarUrl ? (
                      <img
                        src={invite.squad.avatarUrl}
                        alt={invite.squad.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {invite.squad.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{invite.squad.name}</p>
                      <p className="text-sm text-gray-500">
                        From {invite.inviter.ethosDisplayName || invite.inviter.ethosUsername}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/invites"
                      className="px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      Respond
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Squad Creation</h3>
              <p className="text-sm text-gray-500 mt-1">
                You can create up to {eligibility.maxAllowed} squads based on your Ethos score of{' '}
                {eligibility.ethosScore ?? 0}.
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {eligibility.currentCount}/{eligibility.maxAllowed}
              </p>
              <p className="text-sm text-gray-500">squads created</p>
            </div>
          </div>
          {eligibility.canCreate && (
            <div className="mt-4">
              <Link
                href="/dashboard/squads/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Squad
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}
