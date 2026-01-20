'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { EthosFields } from './EthosFields';
import { EditableFields } from './EditableFields';
import type { UpdateUserRequest, UserWithEthos } from '@/types/auth';
import { usePrivy } from '@privy-io/react-auth';

/**
 * Full user profile with read-only Ethos section and editable app settings
 */
export function UserProfile() {
  const { user, refreshEthosData, isLoading } = useAuth();
  const { getAccessToken } = usePrivy();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await refreshEthosData();
      setSuccessMessage('Ethos data synced successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSave = async (data: UpdateUserRequest) => {
    setIsSaving(true);
    setError(null);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('No access token');
      }

      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save');
      }

      setSuccessMessage('Settings saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {successMessage}
        </div>
      )}

      <div className="grid gap-8">
        {/* Ethos Data (Read-Only) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <EthosFields
            ethosData={user.ethosData}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing || isLoading}
          />
        </div>

        {/* App Settings (Editable) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <EditableFields
            user={user}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
