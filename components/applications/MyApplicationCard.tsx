'use client';

import Link from 'next/link';
import type { ApplicationWithPosition } from '@/types/position';
import { SquadRoleBadge } from '@/components/squads/SquadRoleBadge';

interface MyApplicationCardProps {
  application: ApplicationWithPosition;
  onWithdraw: (applicationId: string) => Promise<void>;
  isWithdrawing?: boolean;
}

export function MyApplicationCard({
  application,
  onWithdraw,
  isWithdrawing = false,
}: MyApplicationCardProps) {
  const isPending = application.status === 'PENDING';
  const position = application.position;
  const squad = position.squad;
  const appliedAt = new Date(application.createdAt);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    APPROVED: 'bg-green-500/20 text-green-400',
    REJECTED: 'bg-red-500/20 text-red-400',
    WITHDRAWN: 'bg-space-600 text-hull-400',
    EXPIRED: 'bg-space-600 text-hull-400',
  };

  const statusMessages: Record<string, string> = {
    PENDING: 'Waiting for response',
    APPROVED: 'You\'ve been accepted!',
    REJECTED: 'Application was not accepted',
    WITHDRAWN: 'You withdrew this application',
    EXPIRED: 'Application expired',
  };

  return (
    <div className="bg-space-800 rounded-xl border border-space-600 shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {squad.avatarUrl ? (
            <img
              src={squad.avatarUrl}
              alt={squad.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <span className="text-xl text-primary-400">
                {squad.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/squads/${squad.id}`}
              className="font-semibold text-hull-100 hover:text-primary-400"
            >
              {squad.name}
            </Link>
            <SquadRoleBadge role={position.role} size="sm" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
              {application.status.charAt(0) + application.status.slice(1).toLowerCase()}
            </span>
            <span className="text-sm text-hull-400">
              {statusMessages[application.status]}
            </span>
          </div>
          {application.message && (
            <p className="mt-2 text-sm text-hull-300 italic line-clamp-2">
              &ldquo;{application.message}&rdquo;
            </p>
          )}
          <p className="mt-2 text-xs text-hull-500">
            Applied {appliedAt.toLocaleDateString()}
          </p>
        </div>
      </div>
      {isPending && (
        <div className="mt-4">
          <button
            onClick={() => onWithdraw(application.id)}
            disabled={isWithdrawing}
            className="w-full px-4 py-2 text-sm font-medium text-hull-300 bg-space-700 rounded-lg hover:bg-space-600 transition-colors disabled:opacity-50"
          >
            {isWithdrawing ? 'Withdrawing...' : 'Withdraw Application'}
          </button>
        </div>
      )}
    </div>
  );
}
