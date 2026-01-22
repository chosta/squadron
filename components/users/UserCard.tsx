'use client';

import Link from 'next/link';
import type { User } from '@/types';
import type { SquadRole } from '@/types/squad';
import { SQUAD_ROLES } from '@/types/squad';
import { UserAvatarWithValidator } from './UserAvatarWithValidator';

interface UserCardProps {
  user: Pick<User, 'id' | 'ethosDisplayName' | 'ethosUsername' | 'ethosAvatarUrl' | 'ethosScore'> & {
    primarySquadRole?: SquadRole | null;
    ethosXId?: string | null;
    ethosProfileId?: number | null;
    _count?: { squadMemberships: number };
  };
  squadMemberships?: { role: SquadRole }[];
}

const MAX_DISPLAYED_ROLES = 3;

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function EthosIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function UserCard({ user, squadMemberships }: UserCardProps) {
  const displayName = user.ethosDisplayName || user.ethosUsername || 'Unknown';
  const squadCount = user._count?.squadMemberships ?? 0;

  // Use squad membership roles if available, otherwise fall back to primarySquadRole
  const uniqueRoles =
    squadMemberships && squadMemberships.length > 0
      ? [...new Set(squadMemberships.map((m) => m.role))]
      : user.primarySquadRole
        ? [user.primarySquadRole]
        : [];
  const displayedRoles = uniqueRoles.slice(0, MAX_DISPLAYED_ROLES);
  const remainingCount = uniqueRoles.length - MAX_DISPLAYED_ROLES;

  return (
    <Link
      href={`/users/${user.id}`}
      className="block bg-space-800 rounded-xl border border-space-600 shadow-sm p-6 hover:shadow-md hover:border-space-500 transition-all"
    >
      <div className="flex flex-col items-center text-center">
        <UserAvatarWithValidator
          src={user.ethosAvatarUrl}
          name={displayName}
          size="xl"
          ethosProfileId={user.ethosProfileId}
        />
        <div className="mt-4 flex items-center gap-2">
          <h3 className="text-lg font-semibold text-hull-100 truncate">
            {displayName}
          </h3>
          {(user.ethosXId || user.ethosUsername) && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {user.ethosXId && (
                <a
                  href={`https://x.com/i/user/${user.ethosXId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-hull-400 hover:text-hull-100 transition-colors"
                  title="X Profile"
                >
                  <XIcon className="w-4 h-4" />
                </a>
              )}
              {user.ethosUsername && (
                <a
                  href={`https://app.ethos.network/profile/x/${user.ethosUsername}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-hull-400 hover:text-hull-100 transition-colors"
                  title="Ethos Profile"
                >
                  <EthosIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>

        {displayedRoles.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {displayedRoles.map((role) => {
              const config = SQUAD_ROLES[role];
              return (
                <span
                  key={role}
                  className="inline-flex items-center gap-1 bg-space-700 text-hull-300 rounded-full font-medium text-xs px-2 py-0.5"
                  title={config.description}
                >
                  <span>{config.emoji}</span>
                  <span>{config.label}</span>
                </span>
              );
            })}
            {remainingCount > 0 && (
              <span className="inline-flex items-center bg-space-700 text-hull-400 rounded-full font-medium text-xs px-2 py-0.5">
                +{remainingCount} more
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center gap-3 text-sm text-hull-400">
          {user.ethosScore !== null && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{user.ethosScore}</span>
            </div>
          )}
          {squadCount > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{squadCount} squad{squadCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

      </div>
    </Link>
  );
}
