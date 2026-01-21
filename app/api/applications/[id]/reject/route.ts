import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { positionService } from '@/lib/services/position-service';
import type { Application } from '@/types/position';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface RejectApiResponse {
  success: boolean;
  data?: Application;
  error?: string;
}

// POST /api/applications/[id]/reject - Reject application (captain only)
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<RejectApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: applicationId } = await params;
    const application = await positionService.rejectApplication(applicationId, session.userId);

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error('Error rejecting application:', error);
    const message = error instanceof Error ? error.message : 'Failed to reject application';
    const status = message.includes('captain') ? 403 :
                   message.includes('not found') ? 404 :
                   message.includes('already') ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
