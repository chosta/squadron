'use client';

import type { EthosData } from '@/types/auth';
import { EthosScore } from './EthosScore';
import { ConnectedAccounts } from './ConnectedAccounts';
import { WalletList } from './WalletList';
import { UserAvatarWithValidator } from '@/components/users/UserAvatarWithValidator';

interface EthosFieldsProps {
  ethosData: EthosData;
  onRefresh: () => void;
  isRefreshing: boolean;
}

/**
 * Read-only Ethos data display with lock icons
 */
export function EthosFields({ ethosData, onRefresh, isRefreshing }: EthosFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <LockIcon className="w-4 h-4 text-gray-400" />
          Ethos Profile
        </h2>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:text-indigo-400"
        >
          <RefreshIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Syncing...' : 'Sync from Ethos'}
        </button>
      </div>

      {ethosData.lastSyncedAt && (
        <p className="text-xs text-gray-500">
          Last synced: {new Date(ethosData.lastSyncedAt).toLocaleString()}
        </p>
      )}

      {/* Profile Info */}
      <div className="flex items-start gap-4">
        <UserAvatarWithValidator
          src={ethosData.avatarUrl}
          name={ethosData.displayName || ethosData.username}
          size="xl"
          ethosProfileId={ethosData.profileId}
        />
        <div className="flex-1">
          <ReadOnlyField label="Display Name" value={ethosData.displayName} />
          <ReadOnlyField label="Username" value={ethosData.username ? `@${ethosData.username}` : null} />
          <ReadOnlyField label="Status" value={ethosData.status} />
        </div>
      </div>

      {/* Description */}
      {ethosData.description && (
        <div>
          <FieldLabel label="Description" />
          <p className="text-gray-700 mt-1">{ethosData.description}</p>
        </div>
      )}

      {/* Credibility Score */}
      <div>
        <FieldLabel label="Credibility Score" />
        <div className="mt-2">
          <EthosScore score={ethosData.score} />
        </div>
      </div>

      {/* XP Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Total XP"
          value={ethosData.xpTotal?.toLocaleString() || '0'}
        />
        <StatCard
          label="Streak Days"
          value={ethosData.xpStreakDays?.toString() || '0'}
        />
      </div>

      {/* Influence Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Influence Factor"
          value={ethosData.influenceFactor?.toFixed(2) || 'N/A'}
        />
        <StatCard
          label="Influence Percentile"
          value={ethosData.influencePercentile ? `${ethosData.influencePercentile.toFixed(1)}%` : 'N/A'}
        />
      </div>

      {/* Vouch Stats */}
      {ethosData.stats?.vouch && (
        <div>
          <FieldLabel label="Vouch Stats" />
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Vouches Given</p>
              <p className="text-lg font-semibold">{ethosData.stats.vouch.given.count}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Vouches Received</p>
              <p className="text-lg font-semibold">{ethosData.stats.vouch.received.count}</p>
            </div>
          </div>
        </div>
      )}

      {/* Review Stats */}
      {ethosData.stats?.review && (
        <div>
          <FieldLabel label="Reviews Received" />
          <div className="flex gap-4 mt-2">
            <ReviewBadge type="positive" count={ethosData.stats.review.received.positive} />
            <ReviewBadge type="neutral" count={ethosData.stats.review.received.neutral} />
            <ReviewBadge type="negative" count={ethosData.stats.review.received.negative} />
          </div>
        </div>
      )}

      {/* Connected Accounts */}
      <div>
        <FieldLabel label="Connected Accounts" />
        <div className="mt-2">
          <ConnectedAccounts
            xHandle={ethosData.xHandle}
            discordId={ethosData.discordId}
            farcasterId={ethosData.farcasterId}
            telegramId={ethosData.telegramId}
          />
        </div>
      </div>

      {/* Wallets */}
      <div>
        <FieldLabel label="Linked Wallets" />
        <div className="mt-2">
          <WalletList
            primaryWallet={ethosData.primaryWallet}
            wallets={ethosData.wallets}
          />
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
      <LockIcon className="w-3 h-3" />
      {label}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="mb-2">
      <FieldLabel label={label} />
      <p className="text-gray-900 mt-0.5">{value || '-'}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <LockIcon className="w-3 h-3" />
        {label}
      </div>
      <p className="text-xl font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function ReviewBadge({ type, count }: { type: 'positive' | 'neutral' | 'negative'; count: number }) {
  const colors = {
    positive: 'bg-green-100 text-green-700',
    neutral: 'bg-gray-100 text-gray-700',
    negative: 'bg-red-100 text-red-700',
  };

  const labels = {
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',
  };

  return (
    <div className={`px-3 py-1.5 rounded-lg ${colors[type]}`}>
      <span className="font-medium">{count}</span>
      <span className="text-sm ml-1">{labels[type]}</span>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}
