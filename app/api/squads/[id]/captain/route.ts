import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { squadService } from '@/lib/services/squad-service';
import type { SquadWithMembers } from '@/types/squad';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface CaptainApiResponse {
  success: boolean;
  data?: SquadWithMembers;
  error?: string;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<CaptainApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: squadId } = await params;
    const body: { newCaptainId: string } = await request.json();

    if (!body.newCaptainId) {
      return NextResponse.json(
        { success: false, error: 'New captain ID is required' },
        { status: 400 }
      );
    }

    const squad = await squadService.transferCaptaincy(squadId, session.userId, body.newCaptainId);

    return NextResponse.json({ success: true, data: squad });
  } catch (error) {
    console.error('Error transferring captaincy:', error);
    const message = error instanceof Error ? error.message : 'Failed to transfer captaincy';
    const status = message.includes('captain') ? 403 : message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
