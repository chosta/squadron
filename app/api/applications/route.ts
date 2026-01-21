import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { positionService } from '@/lib/services/position-service';
import type { ApplicationWithPosition } from '@/types/position';

interface ApplicationsApiResponse {
  success: boolean;
  data?: ApplicationWithPosition[];
  error?: string;
}

// GET /api/applications - Get user's applications
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApplicationsApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const applications = await positionService.getUserApplications(session.userId);

    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch applications';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
