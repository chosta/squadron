import { squadService } from '@/lib/services/squad-service';
import { getSession } from '@/lib/auth/session';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SquadRoleBadge } from '@/components/squads/SquadRoleBadge';
import { UserAvatarWithValidator } from '@/components/users/UserAvatarWithValidator';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SquadPage({ params }: PageProps) {
  const { id } = await params;
  const [squad, session] = await Promise.all([
    squadService.getSquad(id),
    getSession(),
  ]);

  if (!squad) {
    notFound();
  }

  const isMember = session
    ? squad.members.some((m) => m.userId === session.userId)
    : false;

  return (
    <div className="min-h-screen bg-space-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/squads"
          className="inline-flex items-center gap-2 text-sm text-hull-400 hover:text-hull-100 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Squads
        </Link>

        <div className="bg-space-800 rounded-xl border border-space-600 shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="flex items-start gap-6">
              {squad.avatarUrl ? (
                <img
                  src={squad.avatarUrl}
                  alt={squad.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <span className="text-4xl text-primary-400">
                    {squad.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-hull-100">{squad.name}</h1>
                    {squad.isActive ? (
                      <span className="px-2.5 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-medium bg-space-700 text-hull-400 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  {isMember && (
                    <Link
                      href={`/dashboard/squads/${squad.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Manage
                    </Link>
                  )}
                </div>
                {squad.description && (
                  <p className="mt-3 text-hull-400">{squad.description}</p>
                )}
                <div className="mt-4 flex items-center gap-6 text-sm text-hull-400">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {squad.members.length}/{squad.maxSize} members
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-space-600">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-hull-100 mb-4">Members</h2>
              <div className="space-y-4">
                {squad.members.map((member) => (
                  <Link
                    key={member.id}
                    href={`/users/${member.userId}`}
                    className="flex items-center gap-4 p-4 bg-space-700 rounded-lg hover:bg-space-600 transition-colors"
                  >
                    <UserAvatarWithValidator
                      src={member.user.ethosAvatarUrl}
                      name={member.user.ethosDisplayName || member.user.ethosUsername}
                      size="lg"
                      ethosProfileId={member.user.ethosProfileId}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-hull-100">
                          {member.user.ethosDisplayName || member.user.ethosUsername || 'Unknown'}
                        </span>
                        {member.userId === squad.captainId && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
                            Captain
                          </span>
                        )}
                      </div>
                      {member.user.ethosScore !== null && (
                        <p className="text-sm text-hull-400 mt-0.5">
                          Ethos Score: {member.user.ethosScore}
                        </p>
                      )}
                    </div>
                    <SquadRoleBadge role={member.role} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
