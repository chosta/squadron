import { NextRequest, NextResponse } from 'next/server';
import { positionService } from '@/lib/services/position-service';
import type { OpenPositionWithSquad, ListPositionsFilter, EthosScoreTier } from '@/types/position';
import type { SquadRole } from '@/types/squad';

interface PositionsApiResponse {
  success: boolean;
  data?: OpenPositionWithSquad[];
  error?: string;
}

// GET /api/positions - Browse all open positions
export async function GET(
  request: NextRequest
): Promise<NextResponse<PositionsApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    const filter: ListPositionsFilter = {
      role: searchParams.get('role') as SquadRole | undefined,
      ethosScoreTier: searchParams.get('ethosScoreTier') as EthosScoreTier | undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0,
    };

    const positions = await positionService.listOpenPositions(filter);

    return NextResponse.json({ success: true, data: positions });
  } catch (error) {
    console.error('Error fetching positions:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch positions';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
