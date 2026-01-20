import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPrivyToken } from '@/lib/auth/privy-server';
import type { UserWithEthos, EthosData, UpdateUserRequest } from '@/types/auth';
import type { EthosUserStats } from '@/types/ethos';
import { ETHOS_READONLY_FIELDS } from '@/types/ethos';

interface MeResponse {
  success: boolean;
  user?: UserWithEthos;
  error?: string;
}

/**
 * GET /api/users/me
 *
 * Get the current authenticated user's profile.
 */
export async function GET(request: NextRequest): Promise<NextResponse<MeResponse>> {
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

    const user = await prisma.user.findUnique({
      where: { privyId: claims.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

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
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/me
 *
 * Update the current user's editable fields only.
 * Ethos fields are read-only and will be rejected.
 */
export async function PATCH(request: NextRequest): Promise<NextResponse<MeResponse>> {
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

    const body: UpdateUserRequest = await request.json();

    // Check for attempts to modify read-only Ethos fields
    const attemptedReadonlyFields = Object.keys(body).filter((key) =>
      ETHOS_READONLY_FIELDS.includes(key as typeof ETHOS_READONLY_FIELDS[number])
    );

    if (attemptedReadonlyFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot modify read-only Ethos fields: ${attemptedReadonlyFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Only allow editable fields
    const updateData: Record<string, unknown> = {};
    if (body.email !== undefined) updateData.email = body.email;
    if (body.customDisplayName !== undefined) updateData.customDisplayName = body.customDisplayName;
    if (body.preferences !== undefined) updateData.preferences = body.preferences;

    const user = await prisma.user.update({
      where: { id: existingUser.id },
      data: updateData,
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

    return NextResponse.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('Update user error:', error);
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
