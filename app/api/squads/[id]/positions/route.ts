import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { positionService } from '@/lib/services/position-service';
import type { OpenPositionWithSquad, OpenPositionWithApplications, CreatePositionInput } from '@/types/position';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface PositionsApiResponse {
  success: boolean;
  data?: OpenPositionWithSquad | OpenPositionWithApplications[];
  error?: string;
}

// GET /api/squads/[id]/positions - List squad's positions
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<PositionsApiResponse>> {
  try {
    const { id: squadId } = await params;
    const positions = await positionService.getSquadPositions(squadId);

    return NextResponse.json({ success: true, data: positions });
  } catch (error) {
    console.error('Error fetching squad positions:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch positions';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/squads/[id]/positions - Create position (captain only)
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<PositionsApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: squadId } = await params;
    const body: CreatePositionInput = await request.json();

    if (!body.role) {
      return NextResponse.json(
        { success: false, error: 'Role is required' },
        { status: 400 }
      );
    }

    const position = await positionService.createPosition(squadId, session.userId, body);

    return NextResponse.json({ success: true, data: position }, { status: 201 });
  } catch (error) {
    console.error('Error creating position:', error);
    const message = error instanceof Error ? error.message : 'Failed to create position';
    const status = message.includes('captain') ? 403 :
                   message.includes('not found') ? 404 :
                   message.includes('No available') ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
