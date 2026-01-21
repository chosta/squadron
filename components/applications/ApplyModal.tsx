'use client';

import { useState } from 'react';
import type { OpenPositionWithSquad } from '@/types/position';
import { SQUAD_ROLES } from '@/types/squad';
import { SquadRoleBadge } from '@/components/squads/SquadRoleBadge';
import { PositionRequirements } from '@/components/positions/PositionRequirements';

interface ApplyModalProps {
  position: OpenPositionWithSquad;
  onSubmit: (message?: string) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}

export function ApplyModal({ position, onSubmit, onClose, isSubmitting = false }: ApplyModalProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(message || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Apply to {position.squad.name}
          </h2>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Role:</span>
              <SquadRoleBadge role={position.role} size="sm" />
            </div>

            <PositionRequirements
              ethosScoreTier={position.ethosScoreTier}
              requiresMutualVouch={position.requiresMutualVouch}
            />

            {position.description && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">{position.description}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself or share why you'd be a great fit..."
                rows={3}
                disabled={isSubmitting}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Applying...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
