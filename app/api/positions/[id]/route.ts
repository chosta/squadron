import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { positionService } from '@/lib/services/position-service';
import type { OpenPositionWithSquad } from '@/types/position';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface PositionApiResponse {
  success: boolean;
  data?: OpenPositionWithSquad;
  error?: string;
}

// GET /api/positions/[id] - Get position details
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<PositionApiResponse>> {
  try {
    const { id: positionId } = await params;
    const position = await positionService.getPosition(positionId);

    if (!position) {
      return NextResponse.json(
        { success: false, error: 'Position not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: position });
  } catch (error) {
    console.error('Error fetching position:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch position';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/positions/[id] - Delete position (captain only)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<{ success: boolean; error?: string }>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: positionId } = await params;
    await positionService.deletePosition(positionId, session.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting position:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete position';
    const status = message.includes('captain') ? 403 :
                   message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
