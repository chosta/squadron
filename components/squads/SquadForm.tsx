'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CreateSquadInput, UpdateSquadInput, SquadRole } from '@/types/squad';
import { SQUAD_MIN_SIZE, SQUAD_MAX_SIZE } from '@/types/squad';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SquadRoleSelector } from './SquadRoleSelector';

interface BaseSquadFormProps {
  initialData?: {
    name: string;
    description: string | null;
    avatarUrl: string | null;
    maxSize: number;
    isFixedSize: boolean;
  };
}

interface CreateSquadFormProps extends BaseSquadFormProps {
  mode: 'create';
  onSubmit: (data: CreateSquadInput) => Promise<void>;
}

interface EditSquadFormProps extends BaseSquadFormProps {
  mode: 'edit';
  onSubmit: (data: UpdateSquadInput) => Promise<void>;
}

type SquadFormProps = CreateSquadFormProps | EditSquadFormProps;

export function SquadForm({ mode, initialData, onSubmit }: SquadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || '');
  const [maxSize, setMaxSize] = useState(initialData?.maxSize || 5);
  const [isFixedSize, setIsFixedSize] = useState(initialData?.isFixedSize || false);
  const [role, setRole] = useState<SquadRole>('DEGEN');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'create') {
        const createData: CreateSquadInput = {
          name: name.trim(),
          description: description.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
          maxSize,
          isFixedSize,
          role,
        };
        await onSubmit(createData);
      } else {
        const updateData: UpdateSquadInput = {
          name: name.trim(),
          description: description.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
          maxSize,
          isFixedSize,
        };
        await onSubmit(updateData);
      }
      router.push('/dashboard/squads');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-hull-300 mb-1">
          Squad Name *
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter squad name"
          required
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-hull-300 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's your squad about?"
          rows={3}
          maxLength={500}
          className="block w-full px-3 py-2 border border-space-600 bg-space-700 text-hull-100 rounded-lg text-sm placeholder:text-hull-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <label htmlFor="avatarUrl" className="block text-sm font-medium text-hull-300 mb-1">
          Avatar URL
        </label>
        <Input
          id="avatarUrl"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.png"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="maxSize" className="block text-sm font-medium text-hull-300 mb-1">
            Maximum Members
          </label>
          <select
            id="maxSize"
            value={maxSize}
            onChange={(e) => setMaxSize(Number(e.target.value))}
            className="block w-full px-3 py-2 border border-space-600 rounded-lg bg-space-700 text-hull-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {Array.from({ length: SQUAD_MAX_SIZE - SQUAD_MIN_SIZE + 1 }, (_, i) => i + SQUAD_MIN_SIZE).map(
              (size) => (
                <option key={size} value={size}>
                  {size} members
                </option>
              )
            )}
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFixedSize}
              onChange={(e) => setIsFixedSize(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-space-600 bg-space-700 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-hull-300">Fixed size (no growth)</span>
          </label>
        </div>
      </div>

      {mode === 'create' && (
        <div>
          <label className="block text-sm font-medium text-hull-300 mb-1">
            Your Role
          </label>
          <SquadRoleSelector value={role} onChange={setRole} />
          <p className="mt-1 text-xs text-hull-500">
            Choose your role in this squad. You&apos;ll be the captain and can invite others.
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" loading={loading} className="flex-1">
          {mode === 'create' ? 'Create Squad' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
