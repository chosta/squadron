'use client';

import { EthosScoreTierBadge } from './EthosScoreTierBadge';
import type { EthosScoreTier } from '@/types/position';

interface PositionRequirementsProps {
  ethosScoreTier: EthosScoreTier;
  requiresMutualVouch: boolean;
  compact?: boolean;
}

export function PositionRequirements({
  ethosScoreTier,
  requiresMutualVouch,
  compact = false,
}: PositionRequirementsProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <EthosScoreTierBadge tier={ethosScoreTier} size="sm" />
        {requiresMutualVouch && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            Mutual Vouch
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Ethos Score:</span>
        <EthosScoreTierBadge tier={ethosScoreTier} size="sm" />
      </div>
      {requiresMutualVouch && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            Mutual Vouch Required
          </span>
        </div>
      )}
    </div>
  );
}
