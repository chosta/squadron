'use client';

import type { ApplicationWithApplicant } from '@/types/position';
import { UserAvatarWithValidator } from '@/components/users/UserAvatarWithValidator';

interface ApplicationCardProps {
  application: ApplicationWithApplicant;
  onApprove: (applicationId: string) => Promise<void>;
  onReject: (applicationId: string) => Promise<void>;
  isProcessing?: boolean;
  isPositionOpen?: boolean;
}

export function ApplicationCard({
  application,
  onApprove,
  onReject,
  isProcessing = false,
  isPositionOpen = true,
}: ApplicationCardProps) {
  const isPending = application.status === 'PENDING';
  const applicant = application.applicant;
  const appliedAt = new Date(application.createdAt);
  const expiresAt = new Date(application.expiresAt);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    WITHDRAWN: 'bg-gray-100 text-gray-600',
    EXPIRED: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <UserAvatarWithValidator
          src={applicant.ethosAvatarUrl}
          name={applicant.ethosDisplayName || applicant.ethosUsername}
          ethosProfileId={applicant.ethosProfileId}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">
              {applicant.ethosDisplayName || applicant.ethosUsername || 'Unknown'}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
              {application.status.charAt(0) + application.status.slice(1).toLowerCase()}
            </span>
          </div>
          {applicant.ethosScore && (
            <p className="text-sm text-gray-500">
              Score: {applicant.ethosScore}
            </p>
          )}
          {application.message && (
            <p className="mt-2 text-sm text-gray-600 italic">
              &ldquo;{application.message}&rdquo;
            </p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            Applied {appliedAt.toLocaleDateString()}
            {isPending && daysUntilExpiry > 0 && ` • Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`}
          </p>
        </div>
      </div>
      {isPending && isPositionOpen && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onApprove(application.id)}
            disabled={isProcessing}
            className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(application.id)}
            disabled={isProcessing}
            className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
