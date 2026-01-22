'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SquadForm } from '@/components/squads/SquadForm';
import { SquadQuota } from '@/components/squads/SquadQuota';
import type { CreateSquadInput, SquadCreationEligibility } from '@/types/squad';

export default function CreateSquadPage() {
  const router = useRouter();
  const [eligibility, setEligibility] = useState<SquadCreationEligibility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users/me/squads/eligibility')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEligibility(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (data: CreateSquadInput) => {
    const response = await fetch('/api/squads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create squad');
    }

    router.push(`/dashboard/squads/${result.data.id}`);
  };

  const canCreate = eligibility?.canCreate ?? true;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-hull-100">Create Squad</h1>
        <p className="mt-1 text-hull-400">
          Start a new squad and invite members to join.
        </p>
      </div>

      <SquadQuota variant="banner" className="mb-6" />

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-hull-400">Loading...</p>
          </CardContent>
        </Card>
      ) : !canCreate ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-hull-100">Squad Limit Reached</h3>
            <p className="mt-2 text-hull-400">
              You&apos;ve reached your maximum of {eligibility?.maxAllowed} squad{eligibility?.maxAllowed === 1 ? '' : 's'}.
              Increase your Ethos Score to create more squads.
            </p>
            <Link
              href="/dashboard/squads"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-space-700 text-hull-300 rounded-lg text-sm font-medium hover:bg-space-600 transition-colors"
            >
              Back to My Squads
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Squad Details</CardTitle>
          </CardHeader>
          <CardContent>
            <SquadForm mode="create" onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
