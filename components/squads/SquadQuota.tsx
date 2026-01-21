'use client';

import { useState, useEffect } from 'react';
import type { SquadCreationEligibility } from '@/types/squad';

interface SquadQuotaProps {
  variant?: 'inline' | 'banner';
  className?: string;
}

export function SquadQuota({ variant = 'inline', className = '' }: SquadQuotaProps) {
  const [eligibility, setEligibility] = useState<SquadCreationEligibility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users/me/squads/eligibility')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEligibility(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return variant === 'inline' ? (
      <span className={`text-sm text-gray-400 ${className}`}>...</span>
    ) : null;
  }

  if (!eligibility) {
    return null;
  }

  const { currentCount, maxAllowed, canCreate } = eligibility;
  const isAtLimit = !canCreate;

  if (variant === 'inline') {
    return (
      <span
        className={`text-sm ${isAtLimit ? 'text-amber-600' : 'text-gray-500'} ${className}`}
        title={`You've created ${currentCount} of ${maxAllowed} squads allowed`}
      >
        {currentCount}/{maxAllowed} squads
      </span>
    );
  }

  // Banner variant
  return (
    <div
      className={`rounded-lg p-4 ${
        isAtLimit
          ? 'bg-amber-50 border border-amber-200'
          : 'bg-gray-50 border border-gray-200'
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            Squad Quota
          </p>
          <p className={`text-sm ${isAtLimit ? 'text-amber-700' : 'text-gray-500'}`}>
            {isAtLimit
              ? 'You have reached your squad creation limit.'
              : `You can create ${maxAllowed - currentCount} more squad${maxAllowed - currentCount === 1 ? '' : 's'}.`}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: maxAllowed }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < currentCount
                  ? 'bg-primary-600'
                  : 'bg-gray-300'
              }`}
              title={i < currentCount ? 'Squad created' : 'Available slot'}
            />
          ))}
        </div>
      </div>
      {eligibility.ethosScore !== null && (
        <p className="mt-2 text-xs text-gray-400">
          Your Ethos Score ({eligibility.ethosScore}) allows up to {maxAllowed} squad{maxAllowed === 1 ? '' : 's'}.
        </p>
      )}
    </div>
  );
}
