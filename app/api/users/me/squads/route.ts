import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { squadService } from '@/lib/services/squad-service';
import type { SquadWithMembers } from '@/types/squad';

interface SquadsApiResponse {
  success: boolean;
  data?: SquadWithMembers[];
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<SquadsApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const squads = await squadService.getUserSquads(session.userId);

    return NextResponse.json({ success: true, data: squads });
  } catch (error) {
    console.error('Error fetching user squads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch squads' },
      { status: 500 }
    );
  }
}
