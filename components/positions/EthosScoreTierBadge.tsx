'use client';

import { ETHOS_SCORE_TIERS, type EthosScoreTier } from '@/types/position';

interface EthosScoreTierBadgeProps {
  tier: EthosScoreTier;
  size?: 'sm' | 'md';
}

export function EthosScoreTierBadge({ tier, size = 'md' }: EthosScoreTierBadgeProps) {
  const config = ETHOS_SCORE_TIERS[tier];

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full font-medium bg-purple-900/50 text-purple-400 ${sizeClasses}`}>
      {config.label}
    </span>
  );
}
