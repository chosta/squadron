import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { positionService } from '@/lib/services/position-service';
import type { Application } from '@/types/position';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface ApproveApiResponse {
  success: boolean;
  data?: { application: Application; memberId: string };
  error?: string;
}

// POST /api/applications/[id]/approve - Approve application (captain only)
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApproveApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: applicationId } = await params;
    const result = await positionService.approveApplication(applicationId, session.userId);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error approving application:', error);
    const message = error instanceof Error ? error.message : 'Failed to approve application';
    const status = message.includes('captain') ? 403 :
                   message.includes('not found') ? 404 :
                   message.includes('already') || message.includes('no longer') || message.includes('maximum') || message.includes('eligibility') ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
