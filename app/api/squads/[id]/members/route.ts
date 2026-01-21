import { NextRequest, NextResponse } from 'next/server';
import { squadService } from '@/lib/services/squad-service';
import type { SquadMemberWithUser } from '@/types/squad';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface MembersApiResponse {
  success: boolean;
  data?: SquadMemberWithUser[];
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<MembersApiResponse>> {
  try {
    const { id } = await params;
    const squad = await squadService.getSquad(id);

    if (!squad) {
      return NextResponse.json(
        { success: false, error: 'Squad not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: squad.members });
  } catch (error) {
    console.error('Error fetching squad members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch squad members' },
      { status: 500 }
    );
  }
}
