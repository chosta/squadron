import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge, getStatusBadgeVariant, getRoleBadgeVariant } from '@/components/ui/Badge';
import { AdminUserActions } from './AdminUserActions';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return null;
  }

  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    ethosLastSyncedAt: user.ethosLastSyncedAt?.toISOString() || null,
  };
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    notFound();
  }

  const displayName = user.customDisplayName || user.ethosDisplayName || user.ethosUsername || 'Unknown';

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            &larr; Back to Users
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* User Header */}
        <Card>
          <div className="flex items-start gap-6">
            {user.ethosAvatarUrl ? (
              <img
                src={user.ethosAvatarUrl}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {displayName.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              {user.ethosUsername && (
                <p className="text-gray-500">@{user.ethosUsername}</p>
              )}
              <div className="flex gap-2 mt-3">
                <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                <Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>ID: {user.id}</p>
              <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>

        {/* Ethos Profile */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ethos Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Profile ID</p>
              <p className="font-medium">{user.ethosProfileId ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-medium">{user.ethosUserId ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Credibility Score</p>
              <p className="font-medium">{user.ethosScore ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ethos Status</p>
              <p className="font-medium">{user.ethosStatus ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">XP Total</p>
              <p className="font-medium">{user.ethosXpTotal?.toLocaleString() ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Streak Days</p>
              <p className="font-medium">{user.ethosXpStreakDays ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Influence Factor</p>
              <p className="font-medium">{user.ethosInfluenceFactor?.toFixed(2) ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Influence Percentile</p>
              <p className="font-medium">{user.ethosInfluencePercentile ? `${user.ethosInfluencePercentile.toFixed(1)}%` : 'N/A'}</p>
            </div>
          </div>
          {user.ethosDescription && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Description</p>
              <p className="mt-1">{user.ethosDescription}</p>
            </div>
          )}
          {user.ethosLastSyncedAt && (
            <p className="text-xs text-gray-400 mt-4">
              Last synced: {new Date(user.ethosLastSyncedAt).toLocaleString()}
            </p>
          )}
        </Card>

        {/* Connected Accounts */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h2>
          <div className="space-y-3">
            {user.ethosXHandle && (
              <div className="flex items-center gap-3">
                <span className="text-gray-500 w-24">X (Twitter)</span>
                <span className="font-medium">@{user.ethosXHandle}</span>
              </div>
            )}
            {user.ethosDiscordId && (
              <div className="flex items-center gap-3">
                <span className="text-gray-500 w-24">Discord</span>
                <span className="font-medium">{user.ethosDiscordId}</span>
              </div>
            )}
            {user.ethosFarcasterId && (
              <div className="flex items-center gap-3">
                <span className="text-gray-500 w-24">Farcaster</span>
                <span className="font-medium">{user.ethosFarcasterId}</span>
              </div>
            )}
            {user.ethosTelegramId && (
              <div className="flex items-center gap-3">
                <span className="text-gray-500 w-24">Telegram</span>
                <span className="font-medium">{user.ethosTelegramId}</span>
              </div>
            )}
            {!user.ethosXHandle && !user.ethosDiscordId && !user.ethosFarcasterId && !user.ethosTelegramId && (
              <p className="text-gray-500">No connected accounts</p>
            )}
          </div>
        </Card>

        {/* Wallets */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallets</h2>
          {user.ethosWallets.length > 0 ? (
            <div className="space-y-2">
              {user.ethosWallets.map((wallet, index) => (
                <div key={wallet} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <code className="text-sm font-mono flex-1 truncate">{wallet}</code>
                  {wallet.toLowerCase() === user.ethosPrimaryWallet?.toLowerCase() && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Primary</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No wallets linked</p>
          )}
        </Card>

        {/* Admin Actions */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
          <AdminUserActions
            userId={user.id}
            currentRole={user.role}
            currentStatus={user.status}
          />
        </Card>
      </div>
    </div>
  );
}
