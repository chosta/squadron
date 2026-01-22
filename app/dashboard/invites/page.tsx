'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { SquadInviteWithDetails } from '@/types/squad';
import { InviteCard } from '@/components/invites/InviteCard';

export default function InvitesPage() {
  const router = useRouter();
  const [invites, setInvites] = useState<SquadInviteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const response = await fetch('/api/invites');
      const result = await response.json();
      if (result.success) {
        setInvites(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch invites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (inviteId: string) => {
    const response = await fetch(`/api/invites/${inviteId}/accept`, {
      method: 'POST',
    });

    const result = await response.json();
    if (result.success) {
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      router.push(`/dashboard/squads/${result.data.squad.id}`);
    } else {
      alert(result.error);
    }
  };

  const handleDecline = async (inviteId: string) => {
    const response = await fetch(`/api/invites/${inviteId}/decline`, {
      method: 'POST',
    });

    const result = await response.json();
    if (result.success) {
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-hull-100">Invites</h1>
          <p className="mt-1 text-hull-400">Loading your pending invites...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-space-800 rounded-xl border border-space-600 shadow-sm p-6 animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-lg bg-space-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-space-700 rounded w-3/4" />
                  <div className="h-4 bg-space-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-hull-100">Invites</h1>
        <p className="mt-1 text-hull-400">
          {invites.length === 0
            ? 'No pending invites at the moment.'
            : `You have ${invites.length} pending invite${invites.length === 1 ? '' : 's'}.`}
        </p>
      </div>

      {invites.length === 0 ? (
        <div className="bg-space-800 rounded-xl border border-space-600 shadow-sm p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-space-700 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-hull-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-hull-100">No pending invites</h3>
          <p className="mt-2 text-hull-400">
            When someone invites you to join their squad, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invites.map((invite) => (
            <InviteCard
              key={invite.id}
              invite={invite}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
        </div>
      )}
    </div>
  );
}
