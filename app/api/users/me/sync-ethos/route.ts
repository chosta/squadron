import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ethosClient, EthosClient } from '@/lib/services/ethos-client';
import { verifyPrivyToken } from '@/lib/auth/privy-server';
import type { UserWithEthos, EthosData } from '@/types/auth';
import type { EthosUserStats } from '@/types/ethos';

interface SyncEthosResponse {
  success: boolean;
  user?: UserWithEthos;
  error?: string;
  message?: string;
}

/**
 * POST /api/users/me/sync-ethos
 *
 * Manually refresh Ethos data for the current user.
 * Fetches fresh data from Ethos API and updates user record.
 */
export async function POST(request: NextRequest): Promise<NextResponse<SyncEthosResponse>> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    const claims = await verifyPrivyToken(accessToken);

    if (!claims) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { privyId: claims.userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Determine how to fetch Ethos data
    // Priority: 1. Primary wallet, 2. Profile ID, 3. User ID
    let ethosResponse;

    if (existingUser.ethosPrimaryWallet) {
      ethosResponse = await ethosClient.getUserByAddress(existingUser.ethosPrimaryWallet);
    } else if (existingUser.ethosProfileId) {
      ethosResponse = await ethosClient.getUserByProfileId(existingUser.ethosProfileId);
    } else if (existingUser.ethosUserId) {
      ethosResponse = await ethosClient.getUserById(existingUser.ethosUserId);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'No Ethos identifier found',
          message: 'Unable to sync Ethos data. No wallet, profile ID, or user ID on record.',
        },
        { status: 400 }
      );
    }

    if (!ethosResponse.ok || !ethosResponse.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ethos API error',
          message: 'Failed to fetch Ethos profile. Please try again later.',
        },
        { status: 502 }
      );
    }

    const ethosDbFields = EthosClient.toDbFields(ethosResponse.data);

    const user = await prisma.user.update({
      where: { id: existingUser.id },
      data: ethosDbFields,
    });

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

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'Ethos data synced successfully',
    });
  } catch (error) {
    console.error('Sync Ethos error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
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
