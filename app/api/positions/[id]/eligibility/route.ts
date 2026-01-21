import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { positionService } from '@/lib/services/position-service';
import type { PositionEligibility } from '@/types/position';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface EligibilityApiResponse {
  success: boolean;
  data?: PositionEligibility;
  error?: string;
}

// GET /api/positions/[id]/eligibility - Check user eligibility for position
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<EligibilityApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: positionId } = await params;
    const eligibility = await positionService.checkEligibility(positionId, session.userId);

    return NextResponse.json({ success: true, data: eligibility });
  } catch (error) {
    console.error('Error checking eligibility:', error);
    const message = error instanceof Error ? error.message : 'Failed to check eligibility';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
