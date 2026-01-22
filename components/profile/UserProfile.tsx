'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { EthosFields } from './EthosFields';

/**
 * User profile displaying read-only Ethos data
 */
export function UserProfile() {
  const { user, refreshEthosData, isLoading } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
          {successMessage}
        </div>
      )}

      {/* Ethos Data (Read-Only) */}
      <div className="bg-space-800 rounded-xl border border-space-700 p-6">
        <EthosFields
          ethosData={user.ethosData}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing || isLoading}
        />
      </div>
    </div>
  );
}
