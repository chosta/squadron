'use client';

import { useState } from 'react';
import type { ApplicationWithPosition } from '@/types/position';
import { MyApplicationCard } from '@/components/applications/MyApplicationCard';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';

interface MyApplicationsClientProps {
  initialApplications: ApplicationWithPosition[];
}

export function MyApplicationsClient({ initialApplications }: MyApplicationsClientProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    setWithdrawingId(applicationId);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setApplications((prev) =>
          prev.map((a) =>
            a.id === applicationId
              ? { ...a, status: 'WITHDRAWN' as const, respondedAt: new Date().toISOString() }
              : a
          )
        );
      } else {
        alert(data.error || 'Failed to withdraw application');
      }
    } catch (error) {
      console.error('Failed to withdraw:', error);
      alert('Failed to withdraw application');
    } finally {
      setWithdrawingId(null);
    }
  };

  const pendingApplications = applications.filter((a) => a.status === 'PENDING');
  const pastApplications = applications.filter((a) => a.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="mt-1 text-gray-600">Track your applications to join squads</p>
        </div>
        <Link
          href="/squads/positions"
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Browse Positions
        </Link>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Browse open positions and apply to join a squad"
          action={
            <Link
              href="/squads/positions"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Positions
            </Link>
          }
        />
      ) : (
        <>
          {pendingApplications.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Pending ({pendingApplications.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingApplications.map((application) => (
                  <MyApplicationCard
                    key={application.id}
                    application={application}
                    onWithdraw={handleWithdraw}
                    isWithdrawing={withdrawingId === application.id}
                  />
                ))}
              </div>
            </div>
          )}

          {pastApplications.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Past Applications ({pastApplications.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastApplications.map((application) => (
                  <MyApplicationCard
                    key={application.id}
                    application={application}
                    onWithdraw={handleWithdraw}
                    isWithdrawing={withdrawingId === application.id}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
