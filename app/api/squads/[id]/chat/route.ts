import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { CHAT_DEFAULTS } from '@/types/chat';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch chat messages
export async function GET(
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

    const { id: squadId } = await params;
    const { searchParams } = new URL(request.url);

    const beforeId = searchParams.get('before');
    const limit = Math.min(
      parseInt(searchParams.get('limit') || String(CHAT_DEFAULTS.MAX_MESSAGES_PER_FETCH)),
      100
    );

    // Verify user is a member of this squad
    const membership = await prisma.squadMember.findUnique({
      where: {
        squadId_userId: {
          squadId,
          userId: session.userId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Not a member of this squad' },
        { status: 403 }
      );
    }

    // Verify squad is active (has 2+ members)
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      select: { isActive: true },
    });

    if (!squad?.isActive) {
      return NextResponse.json(
        { success: false, error: 'Chat is only available for active squads with 2+ members' },
        { status: 400 }
      );
    }

    // Build query
    const whereClause: {
      squadId: string;
      isDeleted: boolean;
      createdAt?: { lt: Date };
    } = {
      squadId,
      isDeleted: false,
    };

    if (beforeId) {
      const beforeMessage = await prisma.chatMessage.findUnique({
        where: { id: beforeId },
        select: { createdAt: true },
      });

      if (beforeMessage) {
        whereClause.createdAt = { lt: beforeMessage.createdAt };
      }
    }

    // Fetch messages (newest first, then reverse for display)
    const messages = await prisma.chatMessage.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            ethosDisplayName: true,
            ethosUsername: true,
            ethosAvatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });

    const hasMore = messages.length > limit;
    const returnMessages = hasMore ? messages.slice(0, -1) : messages;

    // Reverse to get chronological order (oldest first)
    returnMessages.reverse();

    return NextResponse.json({
      success: true,
      data: {
        messages: returnMessages,
        hasMore,
        oldestMessageId: returnMessages[0]?.id || null,
      },
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(
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

    const { id: squadId } = await params;
    const body = await request.json();
    const { content } = body;

    // Validate content
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length < CHAT_DEFAULTS.MIN_MESSAGE_LENGTH) {
      return NextResponse.json(
        { success: false, error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    if (trimmedContent.length > CHAT_DEFAULTS.MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Message cannot exceed ${CHAT_DEFAULTS.MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Verify user is a member of this squad
    const membership = await prisma.squadMember.findUnique({
      where: {
        squadId_userId: {
          squadId,
          userId: session.userId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Not a member of this squad' },
        { status: 403 }
      );
    }

    // Verify squad is active
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      select: { isActive: true },
    });

    if (!squad?.isActive) {
      return NextResponse.json(
        { success: false, error: 'Chat is only available for active squads with 2+ members' },
        { status: 400 }
      );
    }

    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        content: trimmedContent,
        squadId,
        senderId: session.userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            ethosDisplayName: true,
            ethosUsername: true,
            ethosAvatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
