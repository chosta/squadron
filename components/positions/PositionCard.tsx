'use client';

import Link from 'next/link';
import type { OpenPositionWithSquad } from '@/types/position';
import { SQUAD_ROLES } from '@/types/squad';
import { SquadRoleBadge } from '@/components/squads/SquadRoleBadge';
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
  const roleConfig = SQUAD_ROLES[position.role];
  const memberCount = position.squad._count?.members ?? 0;
  const expiresAt = new Date(position.expiresAt);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {position.squad.avatarUrl ? (
            <img
              src={position.squad.avatarUrl}
              alt={position.squad.name}
              className="w-14 h-14 rounded-lg object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-primary-100 flex items-center justify-center">
              <span className="text-2xl text-primary-600">
                {position.squad.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/squads/${position.squad.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-primary-600 truncate"
            >
              {position.squad.name}
            </Link>
            <SquadRoleBadge role={position.role} size="sm" />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </p>
          {position.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {position.description}
            </p>
          )}
          <div className="mt-3">
            <PositionRequirements
              ethosScoreTier={position.ethosScoreTier}
              requiresMutualVouch={position.requiresMutualVouch}
              compact
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {daysUntilExpiry > 0
              ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`
              : 'Expires today'}
          </p>
        </div>
      </div>
      {showApplyButton && (
        <div className="mt-4">
          <button
            onClick={onApply}
            disabled={!isEligible}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isEligible
                ? 'text-white bg-primary-600 hover:bg-primary-700'
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
            }`}
          >
            {isEligible ? 'Apply' : 'Not Eligible'}
          </button>
        </div>
      )}
    </div>
  );
}
