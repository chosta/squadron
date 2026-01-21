import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { inviteService } from '@/lib/services/invite-service';
import type { SquadInvite } from '@/types/squad';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface DeclineApiResponse {
  success: boolean;
  data?: SquadInvite;
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<DeclineApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const invite = await inviteService.declineInvite(id, session.userId);

    return NextResponse.json({ success: true, data: invite });
  } catch (error) {
    console.error('Error declining invite:', error);
    const message = error instanceof Error ? error.message : 'Failed to decline invite';
    const status = message.includes('not for you') ? 403 :
                   message.includes('not found') ? 404 :
                   message.includes('already been') ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
