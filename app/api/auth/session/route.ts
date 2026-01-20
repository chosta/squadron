import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPrivyToken } from '@/lib/auth/privy-server';
import type { UserWithEthos, EthosData } from '@/types/auth';
import type { EthosUserStats } from '@/types/ethos';

interface SessionResponse {
  authenticated: boolean;
  user?: UserWithEthos;
}

/**
 * GET /api/auth/session
 *
 * Check current authentication session.
 * Returns user data if authenticated, or authenticated: false if not.
 */
export async function GET(request: NextRequest): Promise<NextResponse<SessionResponse>> {
  try {
    // Get Privy token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ authenticated: false });
    }

    const accessToken = authHeader.substring(7);
    const claims = await verifyPrivyToken(accessToken);

    if (!claims) {
      return NextResponse.json({ authenticated: false });
    }

    // Find user by Privy ID
    const user = await prisma.user.findUnique({
      where: { privyId: claims.userId },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    // Transform to UserWithEthos response
    const userResponse: UserWithEthos = {
      id: user.id,
      privyId: user.privyId,
      privyDid: user.privyDid,
      ethosData: extractEthosData(user),
      email: user.email,
      customDisplayName: user.customDisplayName,
      preferences: user.preferences as UserWithEthos['preferences'],
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return NextResponse.json({ authenticated: true, user: userResponse });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}

/**
 * Extract Ethos data from database user record
 */
function extractEthosData(user: {
  ethosProfileId: number | null;
  ethosUserId: number | null;
  ethosUsername: string | null;
  ethosDisplayName: string | null;
  ethosAvatarUrl: string | null;
  ethosDescription: string | null;
  ethosScore: number | null;
  ethosStatus: string | null;
  ethosXHandle: string | null;
  ethosXId: string | null;
  ethosDiscordId: string | null;
  ethosFarcasterId: string | null;
  ethosTelegramId: string | null;
  ethosPrimaryWallet: string | null;
  ethosWallets: string[];
  ethosXpTotal: number | null;
  ethosXpStreakDays: number | null;
  ethosInfluenceFactor: number | null;
  ethosInfluencePercentile: number | null;
  ethosUserkeys: string[];
  ethosRawData: unknown;
  ethosLastSyncedAt: Date | null;
}): EthosData {
  let stats: EthosUserStats | null = null;
  if (user.ethosRawData && typeof user.ethosRawData === 'object') {
    const rawData = user.ethosRawData as { stats?: EthosUserStats };
    stats = rawData.stats || null;
  }

  return {
    profileId: user.ethosProfileId,
    userId: user.ethosUserId,
    username: user.ethosUsername,
    displayName: user.ethosDisplayName,
    avatarUrl: user.ethosAvatarUrl,
    description: user.ethosDescription,
    score: user.ethosScore,
    status: user.ethosStatus,
    xHandle: user.ethosXHandle,
    xId: user.ethosXId,
    discordId: user.ethosDiscordId,
    farcasterId: user.ethosFarcasterId,
    telegramId: user.ethosTelegramId,
    primaryWallet: user.ethosPrimaryWallet,
    wallets: user.ethosWallets,
    xpTotal: user.ethosXpTotal,
    xpStreakDays: user.ethosXpStreakDays,
    influenceFactor: user.ethosInfluenceFactor,
    influencePercentile: user.ethosInfluencePercentile,
    userkeys: user.ethosUserkeys,
    stats,
    lastSyncedAt: user.ethosLastSyncedAt,
  };
}
