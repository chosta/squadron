import { prisma } from '@/lib/prisma';
import { squadService } from '@/lib/services/squad-service';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { UserAvatarWithValidator } from '@/components/users/UserAvatarWithValidator';
import { SquadCard } from '@/components/squads/SquadCard';
import { SocialLogins } from '@/components/users/SocialLogins';
import { SQUAD_ROLES } from '@/types/squad';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      ethosProfileId: true,
      ethosDisplayName: true,
      ethosUsername: true,
      ethosAvatarUrl: true,
      ethosDescription: true,
      ethosScore: true,
      ethosXHandle: true,
      ethosXId: true,
      ethosDiscordId: true,
      ethosFarcasterId: true,
      ethosTelegramId: true,
      createdAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  const squads = await squadService.getUserSquads(id);
  const publicSquads = squads.filter((s) => s.isActive);

  const displayName = user.ethosDisplayName || user.ethosUsername || 'Unknown';

  return (
    <div className="min-h-screen bg-space-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/users"
          className="inline-flex items-center gap-2 text-sm text-hull-400 hover:text-hull-100 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Users
        </Link>

        <div className="bg-space-800 rounded-xl border border-space-600 shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <UserAvatarWithValidator
                src={user.ethosAvatarUrl}
                name={displayName}
                size="xl"
                ethosProfileId={user.ethosProfileId}
              />
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-hull-100">{displayName}</h1>
                {user.ethosDescription && (
                  <p className="mt-3 text-hull-400">{user.ethosDescription}</p>
                )}
                <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                  {user.ethosScore !== null && (
                    <div className="flex items-center gap-1.5 text-hull-400">
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-medium">Ethos Score: {user.ethosScore}</span>
                    </div>
                  )}
                </div>
                <SocialLogins
                  xHandle={user.ethosXHandle}
                  xId={user.ethosXId}
                  ethosUsername={user.ethosUsername}
                  discordId={user.ethosDiscordId}
                  farcasterId={user.ethosFarcasterId}
                  telegramId={user.ethosTelegramId}
                />
              </div>
            </div>
          </div>

          {publicSquads.length > 0 && (
            <div className="border-t border-space-600">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-hull-100 mb-4">
                  Squads ({publicSquads.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {publicSquads.map((squad) => {
                    const membership = squad.members.find((m) => m.userId === id);
                    const roleConfig = membership ? SQUAD_ROLES[membership.role] : null;

                    return (
                      <div key={squad.id} className="relative">
                        {roleConfig && (
                          <div className="absolute top-3 right-3 z-10">
                            <span
                              className="inline-flex items-center gap-1 bg-primary-600 text-white rounded-full font-medium text-xs px-2.5 py-1 shadow-md"
                              title={roleConfig.description}
                            >
                              <span>{roleConfig.emoji}</span>
                              <span>{roleConfig.label}</span>
                            </span>
                          </div>
                        )}
                        <SquadCard squad={squad} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
