import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { notificationService } from '@/lib/services/notification-service';
import type { Notification } from '@/types/position';

interface NotificationsApiResponse {
  success: boolean;
  data?: Notification[];
  error?: string;
}

// GET /api/notifications - Get user's notifications
export async function GET(
  request: NextRequest
): Promise<NextResponse<NotificationsApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const notifications = await notificationService.getUserNotifications(session.userId, {
      limit,
      offset,
      unreadOnly,
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch notifications';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
