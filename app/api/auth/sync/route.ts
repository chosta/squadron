import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ethosClient, EthosClient } from '@/lib/services/ethos-client';
import { verifyPrivyToken } from '@/lib/auth/privy-server';
import type { AuthSyncRequest, AuthSyncResponse, UserWithEthos, EthosData } from '@/types/auth';
import type { EthosUserStats } from '@/types/ethos';

/**
 * POST /api/auth/sync
 *
 * Sync user authentication after Privy wallet connection.
 * - Verifies Privy token
 * - Fetches Ethos profile by wallet address
 * - Creates new user or updates existing user with fresh Ethos data
 * - Returns 403 if no Ethos profile found
 */
export async function POST(request: NextRequest): Promise<NextResponse<AuthSyncResponse>> {
  try {
    // Get Privy token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'AUTH_FAILED', message: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    const claims = await verifyPrivyToken(accessToken);

    if (!claims) {
      return NextResponse.json(
        { success: false, error: 'AUTH_FAILED', message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: AuthSyncRequest = await request.json();
    const { authMethod, walletAddress, xHandle, privyDid } = body;

    // Validate request based on auth method
    if (authMethod === 'wallet' && !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'AUTH_FAILED', message: 'Wallet address is required for wallet auth' },
        { status: 400 }
      );
    }

    if (authMethod === 'twitter' && !xHandle) {
      return NextResponse.json(
        { success: false, error: 'AUTH_FAILED', message: 'X handle is required for twitter auth' },
        { status: 400 }
      );
    }

    // Fetch Ethos profile based on auth method
    let ethosResponse;
    if (authMethod === 'twitter' && xHandle) {
      ethosResponse = await ethosClient.getUserByXHandle(xHandle);
    } else if (walletAddress) {
      ethosResponse = await ethosClient.getUserByAddress(walletAddress);
    } else {
      return NextResponse.json(
        { success: false, error: 'AUTH_FAILED', message: 'Invalid auth method or missing credentials' },
        { status: 400 }
      );
    }

    if (!ethosResponse.ok || !ethosResponse.data) {
      // No Ethos profile found - user cannot proceed
      return NextResponse.json(
        {
          success: false,
          error: 'ETHOS_PROFILE_REQUIRED',
          message: 'An Ethos profile is required to use this app. Visit ethos.network to create one.',
        },
        { status: 403 }
      );
    }

    const ethosUser = ethosResponse.data;
    const ethosDbFields = EthosClient.toDbFields(ethosUser);

    // Check if user already exists by privyId
    let user = await prisma.user.findUnique({
      where: { privyId: claims.userId },
    });

    // If not found by privyId, try by Ethos profile ID (for returning users who may have
    // signed in with a different method, e.g., wallet first then twitter)
    if (!user && ethosUser.profileId) {
      user = await prisma.user.findUnique({
        where: { ethosProfileId: ethosUser.profileId },
      });
    }

    if (user) {
      // Existing user - update with fresh Ethos data and link new privyId if needed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          privyId: claims.userId, // Update privyId in case user logged in with different method
          privyDid: privyDid || user.privyDid,
          ...ethosDbFields,
        },
      });
    } else {
      // New user - create with Ethos data
      user = await prisma.user.create({
        data: {
          privyId: claims.userId,
          privyDid: privyDid || null,
          ...ethosDbFields,
        },
      });
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

    return NextResponse.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('Auth sync error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
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
  // Extract stats from raw data if available
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
