import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { notificationService } from '@/lib/services/notification-service';

interface MarkAllReadApiResponse {
  success: boolean;
  data?: { count: number };
  error?: string;
}

// POST /api/notifications/read-all - Mark all notifications as read
export async function POST(
  request: NextRequest
): Promise<NextResponse<MarkAllReadApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const count = await notificationService.markAllAsRead(session.userId);

    return NextResponse.json({ success: true, data: { count } });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    const message = error instanceof Error ? error.message : 'Failed to mark all as read';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
