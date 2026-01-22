import Link from 'next/link';
import type { SquadWithMembers } from '@/types/squad';
import { ValidatorBadge } from '@/components/users/ValidatorBadge';
import { UserAvatar } from '@/components/users/UserAvatar';
import { SquadReputation } from './SquadReputation';

interface SquadCardProps {
  squad: SquadWithMembers;
  showManage?: boolean;
  captainIsValidator?: boolean;
}

export function SquadCard({ squad, showManage = false, captainIsValidator = false }: SquadCardProps) {
  const memberCount = squad._count?.members ?? squad.members.length;
  const openPositionsCount = squad._count?.openPositions ?? 0;

  // Calculate cumulative reputation from all members
  const cumulativeReputation = squad.members.reduce(
    (sum, m) => sum + (m.user.ethosScore || 0),
    0
  );

  const captainDisplayName = squad.captain.ethosDisplayName || squad.captain.ethosUsername || 'Unknown';

  return (
    <div className="bg-space-800 rounded-xl border border-space-600 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Avatar Section - 4:3 aspect ratio, full width */}
      <div className="aspect-[4/3] w-full">
        {squad.avatarUrl ? (
          <img
            src={squad.avatarUrl}
            alt={squad.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary-500/20 flex items-center justify-center">
            <span className="text-6xl font-semibold text-primary-400">
              {squad.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-semibold text-hull-100 truncate leading-tight">
            {squad.name}
          </h3>
          {cumulativeReputation > 0 && (
            <SquadReputation score={cumulativeReputation} size="md" />
          )}
        </div>
        {squad.description && (
          <p className="mt-2 text-sm text-hull-400 line-clamp-2">
            {squad.description}
          </p>
        )}
        <div className="mt-3 flex flex-col gap-1.5 text-sm text-hull-400">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {memberCount}/{squad.maxSize} members
          </span>
          <span className="flex items-center gap-1.5">
            <UserAvatar
              src={squad.captain.ethosAvatarUrl}
              name={captainDisplayName}
              size="sm"
              isValidator={captainIsValidator}
            />
            <span>Captain: {captainDisplayName}</span>
          </span>
          {openPositionsCount > 0 && (
            <span className="flex items-center gap-1 text-primary-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {openPositionsCount} open position{openPositionsCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/squads/${squad.id}`}
            className="flex-1 text-center px-4 py-2 text-sm font-medium text-hull-300 bg-space-700 rounded-lg hover:bg-space-600 transition-colors"
          >
            View
          </Link>
          {showManage && (
            <Link
              href={`/dashboard/squads/${squad.id}`}
              className="flex-1 text-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Manage
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
