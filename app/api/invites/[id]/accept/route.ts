import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { inviteService } from '@/lib/services/invite-service';
import type { AcceptInviteResult } from '@/types/squad';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface AcceptApiResponse {
  success: boolean;
  data?: AcceptInviteResult;
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<AcceptApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const result = await inviteService.acceptInvite(id, session.userId);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error accepting invite:', error);
    const message = error instanceof Error ? error.message : 'Failed to accept invite';
    const status = message.includes('not for you') ? 403 :
                   message.includes('not found') ? 404 :
                   message.includes('already been') || message.includes('expired') ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
