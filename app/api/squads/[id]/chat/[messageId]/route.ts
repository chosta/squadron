import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string; messageId: string }>;
}

// DELETE - Delete own message (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: squadId, messageId } = await params;

    // Find the message
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { senderId: true, squadId: true },
    });

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    // Verify the message belongs to this squad
    if (message.squadId !== squadId) {
      return NextResponse.json(
        { success: false, error: 'Message not found in this squad' },
        { status: 404 }
      );
    }

    // Only allow users to delete their own messages or captains to delete any message
    if (message.senderId !== session.userId) {
      const squad = await prisma.squad.findUnique({
        where: { id: squadId },
        select: { captainId: true },
      });

      if (squad?.captainId !== session.userId) {
        return NextResponse.json(
          { success: false, error: 'You can only delete your own messages' },
          { status: 403 }
        );
      }
    }

    // Soft delete the message
    await prisma.chatMessage.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Error deleting chat message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
