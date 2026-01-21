import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { notificationService } from '@/lib/services/notification-service';

interface UnreadCountApiResponse {
  success: boolean;
  data?: { count: number };
  error?: string;
}

// GET /api/notifications/unread-count - Get unread notification count
export async function GET(
  request: NextRequest
): Promise<NextResponse<UnreadCountApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const count = await notificationService.getUnreadCount(session.userId);

    return NextResponse.json({ success: true, data: { count } });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch unread count';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
