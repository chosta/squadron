'use client';

import { BENEFITS, type Benefit } from '@/types/position';

interface BenefitBadgeProps {
  benefit: Benefit;
  size?: 'sm' | 'md';
}

export function BenefitBadge({ benefit, size = 'md' }: BenefitBadgeProps) {
  const config = BENEFITS[benefit];

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-emerald-100 text-emerald-800 ${sizeClasses}`}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
