import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { squadService } from '@/lib/services/squad-service';
import type { SquadMember, SquadRole } from '@/types/squad';

interface RouteParams {
  params: Promise<{ id: string; memberId: string }>;
}

interface MemberApiResponse {
  success: boolean;
  data?: SquadMember | null;
  error?: string;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<MemberApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: squadId, memberId } = await params;
    const body: { role: SquadRole } = await request.json();

    if (!body.role) {
      return NextResponse.json(
        { success: false, error: 'Role is required' },
        { status: 400 }
      );
    }

    const member = await squadService.changeMemberRole(squadId, session.userId, memberId, body.role);

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error('Error updating member role:', error);
    const message = error instanceof Error ? error.message : 'Failed to update member role';
    const status = message.includes('captain') ? 403 : message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<MemberApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: squadId, memberId } = await params;
    await squadService.removeMember(squadId, session.userId, memberId);

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error('Error removing member:', error);
    const message = error instanceof Error ? error.message : 'Failed to remove member';
    const status = message.includes('captain') ? 403 : message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
