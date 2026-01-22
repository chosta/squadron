'use client';

import Link from 'next/link';
import type { OpenPositionWithSquad } from '@/types/position';
import { SquadRoleBadge } from '@/components/squads/SquadRoleBadge';
import { SquadReputation } from '@/components/squads/SquadReputation';
import { UserAvatar } from '@/components/users/UserAvatar';
import { EthosScoreTierBadge } from './EthosScoreTierBadge';
import { BenefitBadge } from './BenefitBadge';

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
    <div className="bg-space-800 rounded-xl border border-space-600 overflow-hidden hover:border-space-500 transition-colors flex flex-col">
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
      <div className="p-5 space-y-2 flex-1 flex flex-col">
        {/* Team */}
        <div className="flex items-center gap-2 flex-wrap min-h-7">
          <span className="text-sm text-hull-500 w-24 shrink-0">Team</span>
          <Link
            href={`/squads/${position.squad.id}`}
            className="text-sm font-semibold text-hull-100 hover:text-primary-400 truncate"
          >
            {position.squad.name}
          </Link>
          {cumulativeReputation > 0 && (
            <SquadReputation score={cumulativeReputation} size="sm" />
          )}
        </div>

        {/* Looking for */}
        <div className="flex items-center gap-2 min-h-7">
          <span className="text-sm text-hull-500 w-24 shrink-0">Looking for</span>
          <SquadRoleBadge role={position.role} size="sm" />
        </div>

        {/* Team members */}
        {position.squad.members && position.squad.members.length > 0 && (
          <div className="flex items-center gap-2 min-h-7">
            <span className="text-sm text-hull-500 w-24 shrink-0">Members</span>
            <div className="flex items-center">
              {position.squad.members.slice(0, 5).map((member, index) => (
                <div
                  key={index}
                  className={index > 0 ? '-ml-2' : ''}
                  style={{ zIndex: 5 - index }}
                >
                  <UserAvatar
                    src={member.user.ethosAvatarUrl}
                    name={member.user.ethosDisplayName || member.user.ethosUsername || 'Member'}
                    size="sm"
                    className="ring-2 ring-space-800"
                  />
                </div>
              ))}
              {memberCount > 5 && (
                <div className="-ml-2 flex items-center justify-center w-6 h-6 rounded-full bg-space-600 text-xs text-hull-300 ring-2 ring-space-800" style={{ zIndex: 0 }}>
                  +{memberCount - 5}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requirements */}
        <div className="flex items-center gap-2 flex-wrap min-h-7">
          <span className="text-sm text-hull-500 w-24 shrink-0">Requirements</span>
          <EthosScoreTierBadge tier={position.ethosScoreTier} size="sm" />
          {position.requiresMutualVouch && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              Mutual Vouch
            </span>
          )}
        </div>

        {/* Benefits */}
        {position.benefits && position.benefits.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap min-h-7">
            <span className="text-sm text-hull-500 w-24 shrink-0">Benefits</span>
            {position.benefits.map((benefit) => (
              <BenefitBadge key={benefit} benefit={benefit} size="sm" />
            ))}
          </div>
        )}

        {/* Expiry */}
        <p className="text-[10px] text-hull-500 pt-1">
          {daysUntilExpiry > 0
            ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`
            : 'Expires today'}
        </p>

        {/* Apply button */}
        {showApplyButton && (
          <button
            onClick={onApply}
            disabled={!isEligible}
            className={`w-full mt-auto px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
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
