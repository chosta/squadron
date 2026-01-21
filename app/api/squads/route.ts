import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { squadService } from '@/lib/services/squad-service';
import type { CreateSquadInput, SquadWithMembers } from '@/types/squad';

interface SquadsApiResponse {
  success: boolean;
  data?: SquadWithMembers | SquadWithMembers[];
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<SquadsApiResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const { squads, total } = await squadService.listSquads({ page, limit, activeOnly });

    return NextResponse.json({
      success: true,
      data: squads,
      meta: { total, page, limit },
    });
  } catch (error) {
    console.error('Error fetching squads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch squads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<SquadsApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user can create more squads
    const eligibility = await squadService.canUserCreateSquad(session.userId);
    if (!eligibility.canCreate) {
      return NextResponse.json(
        {
          success: false,
          error: `You have reached your squad creation limit (${eligibility.maxAllowed}). Increase your Ethos score to create more squads.`
        },
        { status: 403 }
      );
    }

    const body: CreateSquadInput = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Squad name is required' },
        { status: 400 }
      );
    }

    const squad = await squadService.createSquad(session.userId, body);

    return NextResponse.json({ success: true, data: squad }, { status: 201 });
  } catch (error) {
    console.error('Error creating squad:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create squad' },
      { status: 500 }
    );
  }
}
