import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { squadService } from '@/lib/services/squad-service';
import type { UpdateSquadInput, SquadWithMembers } from '@/types/squad';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface SquadApiResponse {
  success: boolean;
  data?: SquadWithMembers | null;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<SquadApiResponse>> {
  try {
    const { id } = await params;
    const squad = await squadService.getSquad(id);

    if (!squad) {
      return NextResponse.json(
        { success: false, error: 'Squad not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: squad });
  } catch (error) {
    console.error('Error fetching squad:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch squad' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<SquadApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body: UpdateSquadInput = await request.json();

    const squad = await squadService.updateSquad(id, session.userId, body);

    return NextResponse.json({ success: true, data: squad });
  } catch (error) {
    console.error('Error updating squad:', error);
    const message = error instanceof Error ? error.message : 'Failed to update squad';
    const status = message.includes('captain') ? 403 : message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<SquadApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await squadService.dismantleSquad(id, session.userId);

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error('Error deleting squad:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete squad';
    const status = message.includes('Only the') ? 403 : message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
