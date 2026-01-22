'use client';

import { useState, useRef, useEffect } from 'react';
import { BENEFITS, type Benefit } from '@/types/position';

interface BenefitsFilterSelectProps {
  value: Benefit[];
  onChange: (benefits: Benefit[]) => void;
  disabled?: boolean;
}

const benefits = Object.entries(BENEFITS) as [Benefit, { label: string; emoji: string }][];

export function BenefitsFilterSelect({ value, onChange, disabled = false }: BenefitsFilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (benefit: Benefit) => {
    if (value.includes(benefit)) {
      onChange(value.filter((b) => b !== benefit));
    } else {
      onChange([...value, benefit]);
    }
  };

  const handleClear = () => {
    onChange([]);
    setIsOpen(false);
  };

  const displayText = value.length === 0
    ? 'All Benefits'
    : value.length === 1
      ? `${BENEFITS[value[0]].emoji} ${BENEFITS[value[0]].label}`
      : `${value.length} selected`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-gray-900 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <span className="flex items-center justify-between">
          <span>{displayText}</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-2 space-y-1">
            {benefits.map(([key, config]) => {
              const isSelected = value.includes(key);
              return (
                <label
                  key={key}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(key)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <span>{config.emoji}</span>
                  <span className={`text-sm ${isSelected ? 'text-emerald-700 font-medium' : 'text-gray-700'}`}>
                    {config.label}
                  </span>
                </label>
              );
            })}
          </div>
          {value.length > 0 && (
            <div className="border-t border-gray-200 p-2">
              <button
                type="button"
                onClick={handleClear}
                className="w-full px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
