'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { User, UpdateUserInput, UserRole, UserStatus } from '@/types';

interface UserFormProps {
  user: User;
}

const roles: UserRole[] = ['USER', 'MODERATOR', 'ADMIN'];
const statuses: UserStatus[] = ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED'];

/**
 * @deprecated Users are now created through Privy auth flow.
 * This form only supports editing existing user's editable fields (role, status, email, customDisplayName).
 */
export function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateUserInput>({
    email: user.email || '',
    customDisplayName: user.customDisplayName || '',
    role: user.role,
    status: user.status,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'An error occurred');
        return;
      }

      router.push('/admin/users');
      router.refresh();
    } catch {
      setError('Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Display Name (from Ethos - Read Only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ethos Display Name
          </label>
          <input
            type="text"
            value={user.ethosDisplayName || user.ethosUsername || 'N/A'}
            disabled
            className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-400">This field is synced from Ethos</p>
        </div>

        {/* Custom Display Name (Editable) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom Display Name
          </label>
          <Input
            value={formData.customDisplayName}
            onChange={(e) => setFormData({ ...formData, customDisplayName: e.target.value })}
            placeholder="Override display name for this app"
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}
