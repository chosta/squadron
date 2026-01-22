/**
 * Scenario Seeder Orchestrator
 *
 * Main orchestrator for seeding squads and users via natural language commands.
 * Designed to work with the Claude /seed skill for interactive handling.
 */

import { prisma } from '../../lib/prisma';
import { GeminiClient } from '../../lib/services/gemini-client';
import {
  resolveUser,
  resolveUsers,
  resolveUserByType,
  parseMemberString,
  isResolved,
  type ResolvedUser,
  type UnresolvedUser,
  type ParsedMember,
} from './user-resolver';
import type { SquadRole } from '../../types/squad';
import type { User, Squad, SquadMember } from '@prisma/client';

// Re-export for convenience
export {
  resolveUser,
  resolveUsers,
  resolveUserByType,
  parseMemberString,
  isResolved,
  type ResolvedUser,
  type UnresolvedUser,
  type ParsedMember,
};

export interface SquadMemberInput {
  user: User;
  role: SquadRole;
}

export interface CreateSquadOptions {
  name: string;
  description?: string;
  members: SquadMemberInput[];
  generateImage?: boolean;
}

export interface CreateSquadResult {
  squad: Squad;
  members: SquadMember[];
  imageGenerated: boolean;
}

// Default role rotation for members without specified roles
const DEFAULT_ROLE_ROTATION: SquadRole[] = [
  'ALPHA_CALLER',
  'TRADER',
  'DEV',
  'KOL',
  'DEGEN',
  'RESEARCHER',
  'COMMUNITY_BUILDER',
  'WHALE',
  'SUGAR_DADDY',
  'VIBE_CODER',
];

/**
 * Create a squad with members
 * First member becomes creator and captain
 */
export async function createSquadWithMembers(
  options: CreateSquadOptions
): Promise<CreateSquadResult> {
  const { name, description, members, generateImage = false } = options;

  if (members.length === 0) {
    throw new Error('At least one member is required to create a squad');
  }

  // First member is the creator and captain
  const creator = members[0];

  // Generate image if requested and Gemini is configured
  let avatarUrl: string | null = null;
  let imageGenerated = false;

  if (generateImage && GeminiClient.isConfigured()) {
    try {
      const gemini = GeminiClient.getInstance();
      avatarUrl = await gemini.generateSquadImage(name, description);
      imageGenerated = true;
      console.log(`Generated squad image for "${name}"`);
    } catch (error) {
      console.warn(`Failed to generate squad image: ${error}`);
    }
  }

  // Create squad with creator as first member
  const squad = await prisma.squad.create({
    data: {
      name,
      description,
      avatarUrl,
      maxSize: Math.max(members.length, 5),
      isFixedSize: false,
      isActive: members.length >= 2,
      creatorId: creator.user.id,
      captainId: creator.user.id,
      members: {
        create: {
          userId: creator.user.id,
          role: creator.role,
        },
      },
    },
  });

  // Add remaining members
  const memberRecords: SquadMember[] = [];
  for (let i = 1; i < members.length; i++) {
    const member = members[i];
    const memberRecord = await prisma.squadMember.create({
      data: {
        squadId: squad.id,
        userId: member.user.id,
        role: member.role,
      },
    });
    memberRecords.push(memberRecord);
  }

  // Update squad active status
  if (members.length >= 2) {
    await prisma.squad.update({
      where: { id: squad.id },
      data: { isActive: true },
    });
  }

  // Get the first member record
  const firstMember = await prisma.squadMember.findFirst({
    where: { squadId: squad.id, userId: creator.user.id },
  });

  return {
    squad,
    members: firstMember ? [firstMember, ...memberRecords] : memberRecords,
    imageGenerated,
  };
}

/**
 * Assign default roles to members without specified roles
 */
export function assignDefaultRoles(
  members: Array<{ user: User; role?: SquadRole }>
): SquadMemberInput[] {
  let roleIndex = 0;

  return members.map((member) => {
    if (member.role) {
      return { user: member.user, role: member.role };
    }

    // Assign from rotation
    const role = DEFAULT_ROLE_ROTATION[roleIndex % DEFAULT_ROLE_ROTATION.length];
    roleIndex++;

    return { user: member.user, role };
  });
}

/**
 * Parse a seed command and extract squad name, description, and member names
 */
export interface ParsedSeedCommand {
  squadName: string;
  description?: string;
  memberStrings: string[];
}

export function parseSeedCommand(command: string): ParsedSeedCommand | null {
  // Pattern: "... called <squad name>" or "... named <squad name>"
  const namedMatch = command.match(
    /(?:called|named)\s+["""]?([^"""]+?)["""]?\s*(?:$|\.|\n|The description)/i
  );

  // Pattern: "create squad <name>" or "add squad <name>"
  const createMatch = command.match(
    /(?:create|add)\s+squad\s+["""]?([^"""]+?)["""]?\s+(?:with|:)/i
  );

  const squadName = namedMatch?.[1]?.trim() || createMatch?.[1]?.trim();
  if (!squadName) {
    return null;
  }

  // Extract description
  // Pattern: "The description: ..." or "description: ..."
  const descMatch = command.match(
    /(?:The )?description[:\s]+(.+?)(?:$|\n\n)/i
  );
  const description = descMatch?.[1]?.trim();

  // Extract member names
  // Pattern: "of X users:" followed by comma-separated names
  // Or: "with:" followed by comma-separated names
  const membersMatch = command.match(
    /(?:users?[:]\s*|with[:\s]+)([^.]+?)(?:\s+called|\s+named|$)/i
  );

  let memberStrings: string[] = [];
  if (membersMatch) {
    memberStrings = membersMatch[1]
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.match(/^(?:and|&)$/i));
  }

  return {
    squadName,
    description,
    memberStrings,
  };
}

/**
 * Get existing squads for a user
 */
export async function getUserSquads(userId: string): Promise<Squad[]> {
  return prisma.squad.findMany({
    where: {
      members: { some: { userId } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get a squad by name
 */
export async function getSquadByName(name: string): Promise<Squad | null> {
  return prisma.squad.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
  });
}

/**
 * Delete a squad by ID (for cleanup)
 */
export async function deleteSquad(squadId: string): Promise<void> {
  await prisma.squad.delete({
    where: { id: squadId },
  });
}

/**
 * Get squad with members
 */
export async function getSquadWithMembers(squadId: string) {
  return prisma.squad.findUnique({
    where: { id: squadId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              ethosDisplayName: true,
              ethosUsername: true,
              ethosAvatarUrl: true,
              ethosScore: true,
            },
          },
        },
      },
      creator: {
        select: {
          id: true,
          ethosDisplayName: true,
          ethosUsername: true,
        },
      },
      captain: {
        select: {
          id: true,
          ethosDisplayName: true,
          ethosUsername: true,
        },
      },
    },
  });
}

/**
 * Add a single user to an existing squad
 */
export async function addUserToSquad(
  squadId: string,
  user: User,
  role: SquadRole
): Promise<SquadMember> {
  const squad = await prisma.squad.findUnique({
    where: { id: squadId },
    select: { maxSize: true, _count: { select: { members: true } } },
  });

  if (!squad) {
    throw new Error('Squad not found');
  }

  if (squad._count.members >= squad.maxSize) {
    throw new Error('Squad is at maximum capacity');
  }

  // Check if already a member
  const existing = await prisma.squadMember.findFirst({
    where: { squadId, userId: user.id },
  });

  if (existing) {
    throw new Error('User is already a member of this squad');
  }

  const member = await prisma.squadMember.create({
    data: { squadId, userId: user.id, role },
  });

  // Update active status
  const newCount = squad._count.members + 1;
  if (newCount >= 2) {
    await prisma.squad.update({
      where: { id: squadId },
      data: { isActive: true },
    });
  }

  return member;
}

/**
 * List all squads (for admin/debugging)
 */
export async function listAllSquads(): Promise<
  Array<Squad & { _count: { members: number } }>
> {
  return prisma.squad.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * List all seeded users (users with seed: prefix in privyId)
 */
export async function listSeededUsers(): Promise<User[]> {
  return prisma.user.findMany({
    where: { privyId: { startsWith: 'seed:' } },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Result of a clear operation
 */
export interface ClearResult {
  usersDeleted: number;
  squadsDeleted: number;
  membershipsDeleted: number;
}

/**
 * Delete all seeded data (squads and seeded users)
 */
export async function deleteAllSeededData(): Promise<ClearResult> {
  // Get all seeded user IDs
  const seededUsers = await prisma.user.findMany({
    where: { privyId: { startsWith: 'seed:' } },
    select: { id: true },
  });

  const seededUserIds = seededUsers.map((u) => u.id);

  // Delete memberships for seeded users
  const membershipsResult = await prisma.squadMember.deleteMany({
    where: { userId: { in: seededUserIds } },
  });

  // Delete squads created by seeded users
  const squadsResult = await prisma.squad.deleteMany({
    where: { creatorId: { in: seededUserIds } },
  });

  // Delete seeded users
  const usersResult = await prisma.user.deleteMany({
    where: { privyId: { startsWith: 'seed:' } },
  });

  return {
    squadsDeleted: squadsResult.count,
    usersDeleted: usersResult.count,
    membershipsDeleted: membershipsResult.count,
  };
}

/**
 * Delete seeded users by category/role
 */
export async function deleteSeededUsersByCategory(
  role: SquadRole
): Promise<ClearResult> {
  // Get seeded users with this role
  const usersToDelete = await prisma.user.findMany({
    where: {
      privyId: { startsWith: 'seed:' },
      primarySquadRole: role,
    },
    select: { id: true },
  });

  const userIds = usersToDelete.map((u) => u.id);

  if (userIds.length === 0) {
    return { usersDeleted: 0, squadsDeleted: 0, membershipsDeleted: 0 };
  }

  // Delete memberships first
  const membershipsResult = await prisma.squadMember.deleteMany({
    where: { userId: { in: userIds } },
  });

  // Delete squads created by these users
  const squadsResult = await prisma.squad.deleteMany({
    where: { creatorId: { in: userIds } },
  });

  // Delete the users
  const usersResult = await prisma.user.deleteMany({
    where: { id: { in: userIds } },
  });

  return {
    usersDeleted: usersResult.count,
    squadsDeleted: squadsResult.count,
    membershipsDeleted: membershipsResult.count,
  };
}

/**
 * Delete seeded users by X handles
 */
export async function deleteSeededUsersByHandles(
  handles: string[]
): Promise<ClearResult> {
  // Normalize handles
  const normalizedHandles = handles.map((h) => h.replace(/^@/, '').toLowerCase());

  // Get seeded users with matching handles
  const usersToDelete = await prisma.user.findMany({
    where: {
      privyId: { startsWith: 'seed:' },
      ethosXHandle: { in: normalizedHandles, mode: 'insensitive' },
    },
    select: { id: true },
  });

  const userIds = usersToDelete.map((u) => u.id);

  if (userIds.length === 0) {
    return { usersDeleted: 0, squadsDeleted: 0, membershipsDeleted: 0 };
  }

  // Delete memberships first
  const membershipsResult = await prisma.squadMember.deleteMany({
    where: { userId: { in: userIds } },
  });

  // Delete squads created by these users
  const squadsResult = await prisma.squad.deleteMany({
    where: { creatorId: { in: userIds } },
  });

  // Delete the users
  const usersResult = await prisma.user.deleteMany({
    where: { id: { in: userIds } },
  });

  return {
    usersDeleted: usersResult.count,
    squadsDeleted: squadsResult.count,
    membershipsDeleted: membershipsResult.count,
  };
}

/**
 * Delete all seeded squads (preserves users)
 */
export async function deleteAllSeededSquads(): Promise<{ squadsDeleted: number }> {
  // Get all seeded user IDs
  const seededUsers = await prisma.user.findMany({
    where: { privyId: { startsWith: 'seed:' } },
    select: { id: true },
  });

  const seededUserIds = seededUsers.map((u) => u.id);

  // Delete squads created by seeded users
  const squadsResult = await prisma.squad.deleteMany({
    where: { creatorId: { in: seededUserIds } },
  });

  return {
    squadsDeleted: squadsResult.count,
  };
}
