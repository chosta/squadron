'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SquadForm } from '@/components/squads/SquadForm';
import type { CreateSquadInput } from '@/types/squad';

export default function CreateSquadPage() {
  const router = useRouter();

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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Squad</h1>
        <p className="mt-1 text-gray-600">
          Start a new squad and invite members to join.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Squad Details</CardTitle>
        </CardHeader>
        <CardContent>
          <SquadForm mode="create" onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
