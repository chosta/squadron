import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { squadService } from '@/lib/services/squad-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface LeaveApiResponse {
  success: boolean;
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<LeaveApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: squadId } = await params;
    await squadService.leaveSquad(squadId, session.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving squad:', error);
    const message = error instanceof Error ? error.message : 'Failed to leave squad';
    const status = message.includes('Captain') ? 403 : message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
