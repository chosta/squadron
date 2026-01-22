'use client';

import { BENEFITS, type Benefit } from '@/types/position';

interface BenefitsSelectProps {
  value: Benefit[];
  onChange: (benefits: Benefit[]) => void;
  disabled?: boolean;
}

const benefits = Object.entries(BENEFITS) as [Benefit, { label: string; emoji: string }][];

export function BenefitsSelect({ value, onChange, disabled = false }: BenefitsSelectProps) {
  const handleToggle = (benefit: Benefit) => {
    if (value.includes(benefit)) {
      onChange(value.filter((b) => b !== benefit));
    } else {
      onChange([...value, benefit]);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {benefits.map(([key, config]) => {
        const isSelected = value.includes(key);
        return (
          <label
            key={key}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
              disabled
                ? 'bg-gray-100 cursor-not-allowed opacity-50'
                : isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggle(key)}
              disabled={disabled}
              className="sr-only"
            />
            <span>{config.emoji}</span>
            <span className={`text-sm ${isSelected ? 'text-emerald-700 font-medium' : 'text-gray-700'}`}>
              {config.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
