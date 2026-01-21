import { getSession } from '@/lib/auth/session';
import { squadService } from '@/lib/services/squad-service';
import { inviteService } from '@/lib/services/invite-service';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SquadMemberList } from '@/components/squads/SquadMemberList';
import { ManageSquadClient } from './ManageSquadClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageSquadPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const squad = await squadService.getSquad(id);

  if (!squad) {
    notFound();
  }

  // Check if user is a member
  const isMember = squad.members.some((m) => m.userId === session.userId);
  if (!isMember) {
    redirect('/dashboard/squads');
  }

  const isCaptain = squad.captainId === session.userId;

  // Get pending invites if captain
  const pendingInvites = isCaptain
    ? await inviteService.getSquadPendingInvites(id, session.userId)
    : [];

  return (
    <ManageSquadClient
      squad={squad}
      pendingInvites={pendingInvites}
      currentUserId={session.userId}
      isCaptain={isCaptain}
    />
  );
}
