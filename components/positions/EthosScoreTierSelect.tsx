'use client';

import { ETHOS_SCORE_TIERS, type EthosScoreTier } from '@/types/position';

interface EthosScoreTierSelectProps {
  value: EthosScoreTier;
  onChange: (tier: EthosScoreTier) => void;
  disabled?: boolean;
}

const tiers = Object.entries(ETHOS_SCORE_TIERS) as [EthosScoreTier, { label: string; min: number }][];

export function EthosScoreTierSelect({ value, onChange, disabled = false }: EthosScoreTierSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as EthosScoreTier)}
      disabled={disabled}
      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
    >
      {tiers.map(([key, config]) => (
        <option key={key} value={key}>
          {config.label}
        </option>
      ))}
    </select>
  );
}
