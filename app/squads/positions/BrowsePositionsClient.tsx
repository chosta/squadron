'use client';

import { useState, useEffect } from 'react';
import type { OpenPositionWithSquad, EthosScoreTier, PositionEligibility, Benefit } from '@/types/position';
import type { SquadRole } from '@/types/squad';
import { SQUAD_ROLES, SQUAD_ROLES as ROLES_CONFIG } from '@/types/squad';
import { ETHOS_SCORE_TIERS } from '@/types/position';
import { PositionCard } from '@/components/positions/PositionCard';
import { BenefitsFilterSelect } from '@/components/positions/BenefitsFilterSelect';
import { ApplyModal } from '@/components/applications/ApplyModal';
import { EmptyState } from '@/components/ui/EmptyState';

interface BrowsePositionsClientProps {
  initialPositions: OpenPositionWithSquad[];
}

export function BrowsePositionsClient({ initialPositions }: BrowsePositionsClientProps) {
  const [positions, setPositions] = useState(initialPositions);
  const [roleFilter, setRoleFilter] = useState<SquadRole | ''>('');
  const [tierFilter, setTierFilter] = useState<EthosScoreTier | ''>('');
  const [benefitsFilter, setBenefitsFilter] = useState<Benefit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<OpenPositionWithSquad | null>(null);
  const [eligibility, setEligibility] = useState<Record<string, PositionEligibility>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check eligibility for all positions
  useEffect(() => {
    const checkEligibility = async () => {
      const eligibilityMap: Record<string, PositionEligibility> = {};

      for (const position of positions) {
        try {
          const res = await fetch(`/api/positions/${position.id}/eligibility`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              eligibilityMap[position.id] = data.data;
            }
          }
        } catch {
          // Ignore errors - user might not be logged in
        }
      }

      setEligibility(eligibilityMap);
    };

    if (positions.length > 0) {
      checkEligibility();
    }
  }, [positions]);

  const handleFilterChange = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      if (tierFilter) params.set('ethosScoreTier', tierFilter);
      if (benefitsFilter.length > 0) params.set('benefits', benefitsFilter.join(','));
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '50');

      const res = await fetch(`/api/positions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPositions(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to filter positions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const debounce = setTimeout(() => {
      handleFilterChange();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  useEffect(() => {
    handleFilterChange();
  }, [roleFilter, tierFilter, benefitsFilter]);

  const handleApply = (position: OpenPositionWithSquad) => {
    setSelectedPosition(position);
  };

  const handleSubmitApplication = async (message?: string) => {
    if (!selectedPosition) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/positions/${selectedPosition.id}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedPosition(null);
        // Update eligibility for this position
        setEligibility((prev) => ({
          ...prev,
          [selectedPosition.id]: { ...prev[selectedPosition.id], hasExistingApplication: true, eligible: false },
        }));
        alert('Application submitted successfully!');
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Failed to apply:', error);
      alert('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = Object.entries(ROLES_CONFIG) as [SquadRole, typeof ROLES_CONFIG[SquadRole]][];
  const tiers = Object.entries(ETHOS_SCORE_TIERS) as [EthosScoreTier, typeof ETHOS_SCORE_TIERS[EthosScoreTier]][];

  return (
    <div className="space-y-6">
      {/* Header with title, filters, and search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold text-hull-100">Open Positions</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filters */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as SquadRole | '')}
              className="appearance-none rounded-lg border border-space-600 bg-space-800 pl-3 pr-9 py-2 text-hull-100 text-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">All Roles</option>
              {roles.map(([key, config]) => (
                <option key={key} value={key}>
                  {config.emoji} {config.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-4 h-4 text-hull-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as EthosScoreTier | '')}
              className="appearance-none rounded-lg border border-space-600 bg-space-800 pl-3 pr-9 py-2 text-hull-100 text-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Any Score</option>
              {tiers.map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-4 h-4 text-hull-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="w-40">
            <BenefitsFilterSelect
              value={benefitsFilter}
              onChange={setBenefitsFilter}
            />
          </div>

          {/* Search */}
          <div className="w-64 relative ml-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-hull-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search positions..."
              className="block w-full pl-9 pr-8 py-2 bg-space-800 border border-space-600 rounded-lg text-hull-100 text-sm placeholder:text-hull-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-hull-400 hover:text-hull-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12 text-hull-400">Loading...</div>
      ) : positions.length === 0 ? (
        <EmptyState
          title="No open positions"
          description={roleFilter || tierFilter || benefitsFilter.length > 0 || searchQuery ? 'Try adjusting your filters' : 'Check back later for new opportunities'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {positions.map((position) => {
            const positionEligibility = eligibility[position.id];
            const isEligible = positionEligibility?.eligible ?? true;

            return (
              <PositionCard
                key={position.id}
                position={position}
                onApply={() => handleApply(position)}
                isEligible={isEligible}
              />
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      {selectedPosition && (
        <ApplyModal
          position={selectedPosition}
          onSubmit={handleSubmitApplication}
          onClose={() => setSelectedPosition(null)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
