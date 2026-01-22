'use client';

import type { ApplicationWithApplicant } from '@/types/position';
import { ApplicationCard } from './ApplicationCard';

interface ApplicationListProps {
  applications: ApplicationWithApplicant[];
  onApprove: (applicationId: string) => Promise<void>;
  onReject: (applicationId: string) => Promise<void>;
  isProcessing?: string;
  isPositionOpen?: boolean;
}

export function ApplicationList({
  applications,
  onApprove,
  onReject,
  isProcessing,
  isPositionOpen = true,
}: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <p className="text-sm text-hull-400 text-center py-4">
        No applications yet
      </p>
    );
  }

  // Sort: pending first, then by date
  const sortedApplications = [...applications].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-3">
      {sortedApplications.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          onApprove={onApprove}
          onReject={onReject}
          isProcessing={isProcessing === application.id}
          isPositionOpen={isPositionOpen}
        />
      ))}
    </div>
  );
}
