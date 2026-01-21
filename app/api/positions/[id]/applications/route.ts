import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { positionService } from '@/lib/services/position-service';
import type { ApplicationWithApplicant, ApplicationWithPosition, ApplyToPositionInput } from '@/types/position';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface ApplicationsApiResponse {
  success: boolean;
  data?: ApplicationWithApplicant[] | ApplicationWithPosition;
  error?: string;
}

// GET /api/positions/[id]/applications - List applications (captain only)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApplicationsApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: positionId } = await params;
    const applications = await positionService.getPositionApplications(positionId, session.userId);

    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch applications';
    const status = message.includes('captain') ? 403 :
                   message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

// POST /api/positions/[id]/applications - Apply to position
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApplicationsApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: positionId } = await params;
    const body: ApplyToPositionInput = await request.json().catch(() => ({}));

    const application = await positionService.applyToPosition(
      positionId,
      session.userId,
      body.message
    );

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    console.error('Error applying to position:', error);
    const message = error instanceof Error ? error.message : 'Failed to apply';
    const status = message.includes('not eligible') || message.includes('already') || message.includes('does not meet') || message.includes('requires') ? 400 :
                   message.includes('not found') ? 404 :
                   message.includes('no longer') ? 410 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
