import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { inviteService } from '@/lib/services/invite-service';
import type { SquadInviteWithDetails, SquadInvite } from '@/types/squad';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface InviteApiResponse {
  success: boolean;
  data?: SquadInviteWithDetails | SquadInvite | null;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<InviteApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const invite = await inviteService.getInvite(id);

    if (!invite) {
      return NextResponse.json(
        { success: false, error: 'Invite not found' },
        { status: 404 }
      );
    }

    // Only allow invitee or inviter to see the invite
    if (invite.inviteeId !== session.userId && invite.inviterId !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: invite });
  } catch (error) {
    console.error('Error fetching invite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invite' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<InviteApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const invite = await inviteService.cancelInvite(id, session.userId);

    return NextResponse.json({ success: true, data: invite });
  } catch (error) {
    console.error('Error cancelling invite:', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel invite';
    const status = message.includes('Only the') ? 403 :
                   message.includes('not found') ? 404 :
                   message.includes('already been') ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
