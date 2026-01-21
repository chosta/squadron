'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { OpenPositionWithSquad, EthosScoreTier, PositionEligibility } from '@/types/position';
import type { SquadRole } from '@/types/squad';
import { SQUAD_ROLES, SQUAD_ROLES as ROLES_CONFIG } from '@/types/squad';
import { ETHOS_SCORE_TIERS } from '@/types/position';
import { PositionCard } from '@/components/positions/PositionCard';
import { ApplyModal } from '@/components/applications/ApplyModal';
import { EmptyState } from '@/components/ui/EmptyState';

interface BrowsePositionsClientProps {
  initialPositions: OpenPositionWithSquad[];
}

export function BrowsePositionsClient({ initialPositions }: BrowsePositionsClientProps) {
  const router = useRouter();
  const [positions, setPositions] = useState(initialPositions);
  const [roleFilter, setRoleFilter] = useState<SquadRole | ''>('');
  const [tierFilter, setTierFilter] = useState<EthosScoreTier | ''>('');
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

  useEffect(() => {
    handleFilterChange();
  }, [roleFilter, tierFilter]);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Open Positions</h1>
        <p className="mt-1 text-gray-600">Browse and apply to join squads looking for members</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as SquadRole | '')}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">All Roles</option>
            {roles.map(([key, config]) => (
              <option key={key} value={key}>
                {config.emoji} {config.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Score</label>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as EthosScoreTier | '')}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Any Score</option>
            {tiers.map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : positions.length === 0 ? (
        <EmptyState
          title="No open positions"
          description={roleFilter || tierFilter ? 'Try adjusting your filters' : 'Check back later for new opportunities'}
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
