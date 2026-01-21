'use client';

import { useState } from 'react';
import type { OpenPositionWithApplications } from '@/types/position';
import { SQUAD_ROLES } from '@/types/squad';
import { SquadRoleBadge } from '@/components/squads/SquadRoleBadge';
import { PositionRequirements } from './PositionRequirements';
import { ApplicationList } from '@/components/applications/ApplicationList';

interface PositionListProps {
  positions: OpenPositionWithApplications[];
  onDelete: (positionId: string) => Promise<void>;
  onApprove: (applicationId: string) => Promise<void>;
  onReject: (applicationId: string) => Promise<void>;
  isDeleting?: string;
  isProcessing?: string;
}

export function PositionList({
  positions,
  onDelete,
  onApprove,
  onReject,
  isDeleting,
  isProcessing,
}: PositionListProps) {
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);

  if (positions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No open positions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {positions.map((position) => {
        const isExpanded = expandedPosition === position.id;
        const pendingCount = position.applications.filter(a => a.status === 'PENDING').length;
        const isOpen = position.isOpen && new Date(position.expiresAt) > new Date();

        return (
          <div
            key={position.id}
            className={`border rounded-lg overflow-hidden ${
              isOpen ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
            }`}
          >
            <div
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedPosition(isExpanded ? null : position.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SquadRoleBadge role={position.role} size="sm" />
                  {!isOpen && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Closed
                    </span>
                  )}
                  {pendingCount > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {pendingCount} pending
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isOpen && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(position.id);
                      }}
                      disabled={isDeleting === position.id}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Delete position"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {position.description && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-1">
                  {position.description}
                </p>
              )}
              <div className="mt-2">
                <PositionRequirements
                  ethosScoreTier={position.ethosScoreTier}
                  requiresMutualVouch={position.requiresMutualVouch}
                  compact
                />
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Applications ({position.applications.length})
                </h4>
                <ApplicationList
                  applications={position.applications}
                  onApprove={onApprove}
                  onReject={onReject}
                  isProcessing={isProcessing}
                  isPositionOpen={isOpen}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
