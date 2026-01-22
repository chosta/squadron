'use client';

import { EthosScoreTierBadge } from './EthosScoreTierBadge';
import { BenefitBadge } from './BenefitBadge';
import type { EthosScoreTier, Benefit } from '@/types/position';

interface PositionRequirementsProps {
  ethosScoreTier: EthosScoreTier;
  requiresMutualVouch: boolean;
  benefits?: Benefit[];
  compact?: boolean;
}

export function PositionRequirements({
  ethosScoreTier,
  requiresMutualVouch,
  benefits = [],
  compact = false,
}: PositionRequirementsProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <EthosScoreTierBadge tier={ethosScoreTier} size="sm" />
        {requiresMutualVouch && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-900/50 text-amber-400">
            Mutual Vouch
          </span>
        )}
        {benefits.map((benefit) => (
          <BenefitBadge key={benefit} benefit={benefit} size="sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-hull-300">
        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Ethos Score:</span>
        <EthosScoreTierBadge tier={ethosScoreTier} size="sm" />
      </div>
      {requiresMutualVouch && (
        <div className="flex items-center gap-2 text-sm text-hull-300">
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-900/50 text-amber-400">
            Mutual Vouch Required
          </span>
        </div>
      )}
      {benefits.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-hull-300 flex-wrap">
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Benefits:</span>
          {benefits.map((benefit) => (
            <BenefitBadge key={benefit} benefit={benefit} size="sm" />
          ))}
        </div>
      )}
    </div>
  );
}
