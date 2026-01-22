'use client';

import Link from 'next/link';
import type { OpenPositionWithSquad } from '@/types/position';
import { SquadRoleBadge } from '@/components/squads/SquadRoleBadge';
import { SquadReputation } from '@/components/squads/SquadReputation';
import { PositionRequirements } from './PositionRequirements';

interface PositionCardProps {
  position: OpenPositionWithSquad;
  onApply?: () => void;
  showApplyButton?: boolean;
  isEligible?: boolean;
}

export function PositionCard({
  position,
  onApply,
  showApplyButton = true,
  isEligible = true,
}: PositionCardProps) {
  const memberCount = position.squad._count?.members ?? 0;
  const expiresAt = new Date(position.expiresAt);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate cumulative reputation from all members
  const cumulativeReputation = position.squad.members?.reduce(
    (sum, m) => sum + (m.user.ethosScore || 0),
    0
  ) ?? 0;

  return (
    <div className="bg-space-800 rounded-xl border border-space-600 overflow-hidden hover:border-space-500 transition-colors">
      {/* Avatar Section - 4:3 aspect ratio */}
      <div className="aspect-[4/3] w-full">
        {position.squad.avatarUrl ? (
          <img
            src={position.squad.avatarUrl}
            alt={position.squad.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary-500/20 flex items-center justify-center">
            <span className="text-5xl font-semibold text-primary-400">
              {position.squad.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/squads/${position.squad.id}`}
            className="text-lg font-semibold text-hull-100 hover:text-primary-400 truncate"
          >
            {position.squad.name}
          </Link>
          {cumulativeReputation > 0 && (
            <SquadReputation score={cumulativeReputation} size="sm" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <SquadRoleBadge role={position.role} size="sm" />
          <span className="text-sm text-hull-400">
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </span>
        </div>
        {position.description && (
          <p className="mt-2 text-sm text-hull-400 line-clamp-2">
            {position.description}
          </p>
        )}
        <div className="mt-3">
          <PositionRequirements
            ethosScoreTier={position.ethosScoreTier}
            requiresMutualVouch={position.requiresMutualVouch}
            benefits={position.benefits}
            compact
          />
        </div>
        <p className="mt-2 text-xs text-hull-500">
          {daysUntilExpiry > 0
            ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`
            : 'Expires today'}
        </p>
        {showApplyButton && (
          <button
            onClick={onApply}
            disabled={!isEligible}
            className={`w-full mt-4 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isEligible
                ? 'text-white bg-primary-600 hover:bg-primary-700'
                : 'text-hull-500 bg-space-700 cursor-not-allowed'
            }`}
          >
            {isEligible ? 'Apply' : 'Not Eligible'}
          </button>
        )}
      </div>
    </div>
  );
}
