import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { inviteService } from '@/lib/services/invite-service';
import type { SquadInviteWithDetails } from '@/types/squad';

interface InvitesApiResponse {
  success: boolean;
  data?: SquadInviteWithDetails[];
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<InvitesApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const invites = await inviteService.getUserPendingInvites(session.userId);

    return NextResponse.json({ success: true, data: invites });
  } catch (error) {
    console.error('Error fetching user invites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invites' },
      { status: 500 }
    );
  }
}
