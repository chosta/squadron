import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type {
  Squad,
  SquadWithMembers,
  SquadMember,
  SquadRole,
  CreateSquadInput,
  UpdateSquadInput,
  SquadCreationEligibility,
} from '@/types/squad';
import { calculateSquadCreationLimit, SQUAD_MIN_SIZE, SQUAD_MAX_SIZE } from '@/types/squad';

const USER_SELECT = {
  id: true,
  ethosProfileId: true,
  ethosDisplayName: true,
  ethosUsername: true,
  ethosAvatarUrl: true,
  ethosScore: true,
} as const;

const MEMBER_SELECT = {
  id: true,
  joinedAt: true,
  squadId: true,
  userId: true,
  role: true,
  user: { select: USER_SELECT },
} as const;

const SQUAD_WITH_MEMBERS_INCLUDE = {
  members: { select: MEMBER_SELECT },
  creator: { select: USER_SELECT },
  captain: { select: USER_SELECT },
  _count: {
    select: {
      members: true,
      openPositions: { where: { isOpen: true } },
    },
  },
} as const;

export class SquadService {
  private static instance: SquadService;

  private constructor() {}

  static getInstance(): SquadService {
    if (!SquadService.instance) {
      SquadService.instance = new SquadService();
    }
    return SquadService.instance;
  }

  /**
   * Create a new squad with the creator as the first member and captain
   */
  async createSquad(creatorId: string, input: CreateSquadInput): Promise<SquadWithMembers> {
    const { name, description, avatarUrl, maxSize = 5, isFixedSize = false, role = 'DEGEN' } = input;

    // Validate max size
    const validatedMaxSize = Math.min(Math.max(maxSize, SQUAD_MIN_SIZE), SQUAD_MAX_SIZE);

    // Create squad with creator as first member and captain
    const squad = await prisma.squad.create({
      data: {
        name,
        description,
        avatarUrl,
        maxSize: validatedMaxSize,
        isFixedSize,
        isActive: false, // Will be active when 2+ members
        creatorId,
        captainId: creatorId,
        members: {
          create: {
            userId: creatorId,
            role,
          },
        },
      },
      include: SQUAD_WITH_MEMBERS_INCLUDE,
    });

    return squad as unknown as SquadWithMembers;
  }

  /**
   * Get a squad by ID with all members
   */
  async getSquad(id: string): Promise<SquadWithMembers | null> {
    const squad = await prisma.squad.findUnique({
      where: { id },
      include: SQUAD_WITH_MEMBERS_INCLUDE,
    });

    return squad as unknown as SquadWithMembers | null;
  }

  /**
   * Get all squads for a user (as member)
   */
  async getUserSquads(userId: string): Promise<SquadWithMembers[]> {
    const squads = await prisma.squad.findMany({
      where: {
        members: { some: { userId } },
      },
      include: SQUAD_WITH_MEMBERS_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return squads as unknown as SquadWithMembers[];
  }

  /**
   * List all active squads with pagination
   */
  async listSquads(params: {
    page?: number;
    limit?: number;
    activeOnly?: boolean;
  }): Promise<{ squads: SquadWithMembers[]; total: number }> {
    const { page = 1, limit = 20, activeOnly = false } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.SquadWhereInput = activeOnly ? { isActive: true } : {};

    const [squads, total] = await Promise.all([
      prisma.squad.findMany({
        where,
        include: SQUAD_WITH_MEMBERS_INCLUDE,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.squad.count({ where }),
    ]);

    return {
      squads: squads as unknown as SquadWithMembers[],
      total,
    };
  }

  /**
   * Update squad (captain only)
   */
  async updateSquad(
    squadId: string,
    captainId: string,
    input: UpdateSquadInput
  ): Promise<SquadWithMembers> {
    // Verify caller is captain
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      select: { captainId: true, _count: { select: { members: true } } },
    });

    if (!squad) {
      throw new Error('Squad not found');
    }

    if (squad.captainId !== captainId) {
      throw new Error('Only the captain can update the squad');
    }

    // Validate maxSize if provided
    const updateData: Prisma.SquadUpdateInput = { ...input };
    if (input.maxSize !== undefined) {
      const validatedMaxSize = Math.min(Math.max(input.maxSize, SQUAD_MIN_SIZE), SQUAD_MAX_SIZE);
      if (validatedMaxSize < squad._count.members) {
        throw new Error('Cannot reduce max size below current member count');
      }
      updateData.maxSize = validatedMaxSize;
    }

    const updated = await prisma.squad.update({
      where: { id: squadId },
      data: updateData,
      include: SQUAD_WITH_MEMBERS_INCLUDE,
    });

    return updated as unknown as SquadWithMembers;
  }

  /**
   * Dismantle squad (creator or captain only)
   */
  async dismantleSquad(squadId: string, userId: string): Promise<void> {
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      select: { creatorId: true, captainId: true },
    });

    if (!squad) {
      throw new Error('Squad not found');
    }

    if (squad.creatorId !== userId && squad.captainId !== userId) {
      throw new Error('Only the creator or captain can dismantle the squad');
    }

    await prisma.squad.delete({ where: { id: squadId } });
  }

  /**
   * Remove a member from squad (captain only, cannot remove self)
   */
  async removeMember(squadId: string, captainId: string, memberId: string): Promise<void> {
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      select: { captainId: true },
    });

    if (!squad) {
      throw new Error('Squad not found');
    }

    if (squad.captainId !== captainId) {
      throw new Error('Only the captain can remove members');
    }

    const member = await prisma.squadMember.findUnique({
      where: { id: memberId },
      select: { userId: true, squadId: true },
    });

    if (!member || member.squadId !== squadId) {
      throw new Error('Member not found in this squad');
    }

    if (member.userId === captainId) {
      throw new Error('Captain cannot remove themselves. Transfer captaincy first.');
    }

    await prisma.squadMember.delete({ where: { id: memberId } });
    await this.updateSquadActiveStatus(squadId);
  }

  /**
   * Leave squad (non-captain only)
   */
  async leaveSquad(squadId: string, userId: string): Promise<void> {
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      select: { captainId: true },
    });

    if (!squad) {
      throw new Error('Squad not found');
    }

    if (squad.captainId === userId) {
      throw new Error('Captain cannot leave. Transfer captaincy first or dismantle the squad.');
    }

    await prisma.squadMember.deleteMany({
      where: { squadId, userId },
    });

    await this.updateSquadActiveStatus(squadId);
  }

  /**
   * Change member's role (captain only)
   */
  async changeMemberRole(
    squadId: string,
    captainId: string,
    memberId: string,
    newRole: SquadRole
  ): Promise<SquadMember> {
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      select: { captainId: true },
    });

    if (!squad) {
      throw new Error('Squad not found');
    }

    if (squad.captainId !== captainId) {
      throw new Error('Only the captain can change member roles');
    }

    const member = await prisma.squadMember.findUnique({
      where: { id: memberId },
      select: { squadId: true },
    });

    if (!member || member.squadId !== squadId) {
      throw new Error('Member not found in this squad');
    }

    const updated = await prisma.squadMember.update({
      where: { id: memberId },
      data: { role: newRole },
    });

    return updated as unknown as SquadMember;
  }

  /**
   * Transfer captaincy to another member
   */
  async transferCaptaincy(
    squadId: string,
    currentCaptainId: string,
    newCaptainId: string
  ): Promise<SquadWithMembers> {
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      select: { captainId: true },
    });

    if (!squad) {
      throw new Error('Squad not found');
    }

    if (squad.captainId !== currentCaptainId) {
      throw new Error('Only the current captain can transfer captaincy');
    }

    // Verify new captain is a member
    const newCaptainMember = await prisma.squadMember.findFirst({
      where: { squadId, userId: newCaptainId },
    });

    if (!newCaptainMember) {
      throw new Error('New captain must be a member of the squad');
    }

    const updated = await prisma.squad.update({
      where: { id: squadId },
      data: { captainId: newCaptainId },
      include: SQUAD_WITH_MEMBERS_INCLUDE,
    });

    return updated as unknown as SquadWithMembers;
  }

  /**
   * Check if user can create more squads based on Ethos score
   */
  async canUserCreateSquad(userId: string): Promise<SquadCreationEligibility> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { ethosScore: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const maxAllowed = calculateSquadCreationLimit(user.ethosScore);

    const currentCount = await prisma.squad.count({
      where: { creatorId: userId },
    });

    return {
      canCreate: currentCount < maxAllowed,
      currentCount,
      maxAllowed,
      ethosScore: user.ethosScore,
    };
  }

  /**
   * Update squad's active status based on member count
   */
  private async updateSquadActiveStatus(squadId: string): Promise<void> {
    const memberCount = await prisma.squadMember.count({
      where: { squadId },
    });

    await prisma.squad.update({
      where: { id: squadId },
      data: { isActive: memberCount >= SQUAD_MIN_SIZE },
    });
  }

  /**
   * Add member directly to squad (used by invite service)
   */
  async addMember(squadId: string, userId: string, role: SquadRole): Promise<SquadMember> {
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
    const existingMember = await prisma.squadMember.findFirst({
      where: { squadId, userId },
    });

    if (existingMember) {
      throw new Error('User is already a member of this squad');
    }

    const member = await prisma.squadMember.create({
      data: { squadId, userId, role },
    });

    await this.updateSquadActiveStatus(squadId);

    return member as unknown as SquadMember;
  }
}

export const squadService = SquadService.getInstance();
