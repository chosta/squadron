import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { inviteService } from '@/lib/services/invite-service';
import type { CreateInviteInput, SquadInviteWithDetails } from '@/types/squad';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface InvitesApiResponse {
  success: boolean;
  data?: SquadInviteWithDetails | SquadInviteWithDetails[];
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<InvitesApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: squadId } = await params;
    const invites = await inviteService.getSquadPendingInvites(squadId, session.userId);

    return NextResponse.json({ success: true, data: invites });
  } catch (error) {
    console.error('Error fetching squad invites:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch invites';
    const status = message.includes('captain') ? 403 : message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<InvitesApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: squadId } = await params;
    const body: CreateInviteInput = await request.json();

    if (!body.inviteeId) {
      return NextResponse.json(
        { success: false, error: 'Invitee ID is required' },
        { status: 400 }
      );
    }

    if (!body.role) {
      return NextResponse.json(
        { success: false, error: 'Role is required' },
        { status: 400 }
      );
    }

    const invite = await inviteService.createInvite(
      squadId,
      session.userId,
      body.inviteeId,
      body.role,
      body.message
    );

    return NextResponse.json({ success: true, data: invite }, { status: 201 });
  } catch (error) {
    console.error('Error creating invite:', error);
    const message = error instanceof Error ? error.message : 'Failed to create invite';
    const status = message.includes('captain') || message.includes('already') ? 403 :
                   message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
