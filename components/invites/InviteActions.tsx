'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface InviteActionsProps {
  inviteId: string;
  onAccept: (inviteId: string) => Promise<void>;
  onDecline: (inviteId: string) => Promise<void>;
}

export function InviteActions({ inviteId, onAccept, onDecline }: InviteActionsProps) {
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null);

  const handleAccept = async () => {
    setLoading('accept');
    try {
      await onAccept(inviteId);
    } catch (error) {
      console.error('Failed to accept invite:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDecline = async () => {
    setLoading('decline');
    try {
      await onDecline(inviteId);
    } catch (error) {
      console.error('Failed to decline invite:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleAccept}
        loading={loading === 'accept'}
        disabled={loading !== null}
        className="flex-1"
      >
        Accept
      </Button>
      <Button
        variant="secondary"
        onClick={handleDecline}
        loading={loading === 'decline'}
        disabled={loading !== null}
        className="flex-1"
      >
        Decline
      </Button>
    </div>
  );
}
