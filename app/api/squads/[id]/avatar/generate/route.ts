import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { squadService } from '@/lib/services/squad-service';
import { GeminiClient, type MemberAvatarInfo } from '@/lib/services/gemini-client';
import type { SquadWithMembers } from '@/types/squad';

const MAX_AVATAR_REGENERATIONS = 3;

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface AvatarGenerateApiResponse {
  success: boolean;
  data?: SquadWithMembers;
  remainingAttempts?: number;
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<AvatarGenerateApiResponse>> {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if Gemini is configured
    if (!GeminiClient.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Image generation service not configured' },
        { status: 503 }
      );
    }

    const { id: squadId } = await params;

    // Get squad with members
    const squad = await squadService.getSquad(squadId);
    if (!squad) {
      return NextResponse.json(
        { success: false, error: 'Squad not found' },
        { status: 404 }
      );
    }

    // Verify user is captain
    if (squad.captainId !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'Only the captain can generate squad avatars' },
        { status: 403 }
      );
    }

    // Check regeneration limit
    if (squad.avatarRegenerationCount >= MAX_AVATAR_REGENERATIONS) {
      return NextResponse.json(
        {
          success: false,
          error: 'Avatar regeneration limit reached',
          remainingAttempts: 0
        },
        { status: 429 }
      );
    }

    const geminiClient = GeminiClient.getInstance();

    // Separate captain from other members
    const captainMember = squad.members.find(m => m.userId === squad.captainId);
    const otherMembers = squad.members.filter(m => m.userId !== squad.captainId);

    // Prepare member info for avatar analysis
    const membersToAnalyze: MemberAvatarInfo[] = otherMembers.map(m => ({
      avatarUrl: m.user.ethosAvatarUrl || '',
      role: m.role,
      isCaptain: false,
    }));

    const captainAvatarInfo: MemberAvatarInfo = {
      avatarUrl: captainMember?.user.ethosAvatarUrl || '',
      role: captainMember?.role || 'Captain',
      isCaptain: true,
    };

    // Step 1: Analyze member avatars
    let memberDescriptions: string[] = [];
    let captainDescription = 'Team leader';

    try {
      // Analyze captain's avatar
      if (captainAvatarInfo.avatarUrl) {
        const captainAnalysis = await geminiClient.analyzeAvatars([captainAvatarInfo]);
        captainDescription = captainAnalysis[0] || 'Team leader';
      }

      // Analyze other members' avatars
      if (membersToAnalyze.length > 0) {
        memberDescriptions = await geminiClient.analyzeAvatars(membersToAnalyze);
      }
    } catch (analysisError) {
      console.error('Avatar analysis failed, using defaults:', analysisError);
      // Continue with default descriptions
      memberDescriptions = otherMembers.map(() => 'Team member');
    }

    // Step 2: Generate the squad avatar
    const avatarUrl = await geminiClient.generateSquadAvatar({
      squadName: squad.name,
      description: squad.description || undefined,
      memberDescriptions,
      captainDescription,
      memberRoles: otherMembers.map(m => m.role),
      captainRole: captainMember?.role || 'Captain',
    });

    // Update the squad with the new avatar and increment regeneration count
    await prisma.squad.update({
      where: { id: squadId },
      data: {
        avatarUrl,
        avatarRegenerationCount: squad.avatarRegenerationCount + 1,
      },
    });

    // Get the updated squad with all relations
    const updatedSquad = await squadService.getSquad(squadId);
    const remainingAttempts = MAX_AVATAR_REGENERATIONS - (squad.avatarRegenerationCount + 1);

    return NextResponse.json({ success: true, data: updatedSquad ?? undefined, remainingAttempts });
  } catch (error) {
    console.error('Error generating squad avatar:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate avatar';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
