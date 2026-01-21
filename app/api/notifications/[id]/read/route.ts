import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { notificationService } from '@/lib/services/notification-service';
import type { Notification } from '@/types/position';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface MarkReadApiResponse {
  success: boolean;
  data?: Notification;
  error?: string;
}

// POST /api/notifications/[id]/read - Mark notification as read
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<MarkReadApiResponse>> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: notificationId } = await params;
    const notification = await notificationService.markAsRead(notificationId, session.userId);

    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    const message = error instanceof Error ? error.message : 'Failed to mark as read';
    const status = message.includes('Not authorized') ? 403 :
                   message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
