import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [users, squads, openPositionCount] = await Promise.all([
      // Get 5 users with avatars
      prisma.user.findMany({
        where: {
          ethosAvatarUrl: { not: null },
        },
        select: {
          id: true,
          ethosDisplayName: true,
          ethosUsername: true,
          ethosAvatarUrl: true,
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      // Get 5 squads with avatars
      prisma.squad.findMany({
        where: {
          avatarUrl: { not: null },
        },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      // Count open positions
      prisma.openPosition.count({
        where: {
          isOpen: true,
          expiresAt: { gt: new Date() },
        },
      }),
    ]);

    return NextResponse.json({
      users,
      squads,
      openPositionCount,
    });
  } catch (error) {
    console.error('Landing stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing stats' },
      { status: 500 }
    );
  }
}
