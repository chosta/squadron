'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import type { UserRole, UserStatus } from '@/types';

interface AdminUserActionsProps {
  userId: string;
  currentRole: UserRole;
  currentStatus: UserStatus;
}

const roles: UserRole[] = ['USER', 'MODERATOR', 'ADMIN'];
const statuses: UserStatus[] = ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED'];

export function AdminUserActions({ userId, currentRole, currentStatus }: AdminUserActionsProps) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, status }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage({ type: 'error', text: data.error || 'Failed to update user' });
        return;
      }

      setMessage({ type: 'success', text: 'User updated successfully' });
      router.refresh();
    } catch {
      setMessage({ type: 'error', text: 'Failed to update user' });
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = role !== currentRole || status !== currentStatus;

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`px-4 py-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as UserStatus)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button
        onClick={handleSave}
        loading={loading}
        disabled={!hasChanges}
      >
        Save Changes
      </Button>
    </div>
  );
}
