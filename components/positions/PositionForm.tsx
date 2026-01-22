'use client';

import { useState } from 'react';
import { SquadRoleSelector } from '@/components/squads/SquadRoleSelector';
import { EthosScoreTierSelect } from './EthosScoreTierSelect';
import { BenefitsSelect } from './BenefitsSelect';
import type { SquadRole } from '@/types/squad';
import type { EthosScoreTier, CreatePositionInput, Benefit } from '@/types/position';

interface PositionFormProps {
  onSubmit: (input: CreatePositionInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function PositionForm({ onSubmit, onCancel, isSubmitting = false }: PositionFormProps) {
  const [role, setRole] = useState<SquadRole>('TRADER');
  const [description, setDescription] = useState('');
  const [ethosScoreTier, setEthosScoreTier] = useState<EthosScoreTier>('BELOW_1400');
  const [requiresMutualVouch, setRequiresMutualVouch] = useState(false);
  const [benefits, setBenefits] = useState<Benefit[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      role,
      description: description || undefined,
      ethosScoreTier,
      requiresMutualVouch,
      benefits: benefits.length > 0 ? benefits : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role
        </label>
        <SquadRoleSelector
          value={role}
          onChange={setRole}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you're looking for in this role..."
          rows={3}
          disabled={isSubmitting}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Ethos Score
        </label>
        <EthosScoreTierSelect
          value={ethosScoreTier}
          onChange={setEthosScoreTier}
          disabled={isSubmitting}
        />
        <p className="mt-1 text-xs text-gray-500">
          Only users with at least this score can apply
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="requiresMutualVouch"
          checked={requiresMutualVouch}
          onChange={(e) => setRequiresMutualVouch(e.target.checked)}
          disabled={isSubmitting}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="requiresMutualVouch" className="text-sm text-gray-700">
          Require mutual vouch with captain
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Benefits (Optional)
        </label>
        <BenefitsSelect
          value={benefits}
          onChange={setBenefits}
          disabled={isSubmitting}
        />
        <p className="mt-1 text-xs text-gray-500">
          What will the member get from this position?
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
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
          {isSubmitting ? 'Creating...' : 'Create Position'}
        </button>
      </div>
    </form>
  );
}
