import { prisma } from '@/lib/prisma';
import type {
  SquadInvite,
  SquadInviteWithDetails,
  AcceptInviteResult,
  SquadRole,
} from '@/types/squad';
import { INVITE_EXPIRY_DAYS } from '@/types/squad';
import { squadService } from './squad-service';

const USER_SELECT = {
  id: true,
  ethosDisplayName: true,
  ethosUsername: true,
  ethosAvatarUrl: true,
} as const;

const INVITE_WITH_DETAILS_INCLUDE = {
  squad: { select: { id: true, name: true, avatarUrl: true } },
  inviter: { select: USER_SELECT },
  invitee: { select: USER_SELECT },
} as const;

export class InviteService {
  private static instance: InviteService;

  private constructor() {}

  static getInstance(): InviteService {
    if (!InviteService.instance) {
      InviteService.instance = new InviteService();
    }
    return InviteService.instance;
  }

  /**
   * Create a new squad invite (captain only)
   */
  async createInvite(
    squadId: string,
    inviterId: string,
    inviteeId: string,
    role: SquadRole,
    message?: string
  ): Promise<SquadInviteWithDetails> {
    // Verify inviter is captain
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      select: { captainId: true, maxSize: true, _count: { select: { members: true } } },
    });

    if (!squad) {
      throw new Error('Squad not found');
    }

    if (squad.captainId !== inviterId) {
      throw new Error('Only the captain can send invites');
    }

    // Check squad capacity
    if (squad._count.members >= squad.maxSize) {
      throw new Error('Squad is at maximum capacity');
    }

    // Check if invitee is already a member
    const existingMember = await prisma.squadMember.findFirst({
      where: { squadId, userId: inviteeId },
    });

    if (existingMember) {
      throw new Error('User is already a member of this squad');
    }

    // Check for existing pending invite
    const existingInvite = await prisma.squadInvite.findFirst({
      where: {
        squadId,
        inviteeId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      throw new Error('User already has a pending invite to this squad');
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    const invite = await prisma.squadInvite.create({
      data: {
        squadId,
        inviterId,
        inviteeId,
        role,
        message,
        expiresAt,
      },
      include: INVITE_WITH_DETAILS_INCLUDE,
    });

    return invite as unknown as SquadInviteWithDetails;
  }

  /**
   * Accept an invite
   */
  async acceptInvite(inviteId: string, inviteeId: string): Promise<AcceptInviteResult> {
    const invite = await prisma.squadInvite.findUnique({
      where: { id: inviteId },
      include: { squad: true },
    });

    if (!invite) {
      throw new Error('Invite not found');
    }

    if (invite.inviteeId !== inviteeId) {
      throw new Error('This invite is not for you');
    }

    if (invite.status !== 'PENDING') {
      throw new Error(`Invite has already been ${invite.status.toLowerCase()}`);
    }

    if (new Date() > invite.expiresAt) {
      await prisma.squadInvite.update({
        where: { id: inviteId },
        data: { status: 'EXPIRED' },
      });
      throw new Error('Invite has expired');
    }

    // Add member and update invite in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update invite status
      const updatedInvite = await tx.squadInvite.update({
        where: { id: inviteId },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      });

      // Add member using squad service logic
      const member = await tx.squadMember.create({
        data: {
          squadId: invite.squadId,
          userId: inviteeId,
          role: invite.role,
        },
      });

      // Update squad active status
      const memberCount = await tx.squadMember.count({
        where: { squadId: invite.squadId },
      });

      const squad = await tx.squad.update({
        where: { id: invite.squadId },
        data: { isActive: memberCount >= 2 },
      });

      return { invite: updatedInvite, member, squad };
    });

    return result as unknown as AcceptInviteResult;
  }

  /**
   * Decline an invite
   */
  async declineInvite(inviteId: string, inviteeId: string): Promise<SquadInvite> {
    const invite = await prisma.squadInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new Error('Invite not found');
    }

    if (invite.inviteeId !== inviteeId) {
      throw new Error('This invite is not for you');
    }

    if (invite.status !== 'PENDING') {
      throw new Error(`Invite has already been ${invite.status.toLowerCase()}`);
    }

    const updated = await prisma.squadInvite.update({
      where: { id: inviteId },
      data: {
        status: 'DECLINED',
        respondedAt: new Date(),
      },
    });

    return updated as unknown as SquadInvite;
  }

  /**
   * Cancel an invite (inviter/captain only)
   */
  async cancelInvite(inviteId: string, cancelerId: string): Promise<SquadInvite> {
    const invite = await prisma.squadInvite.findUnique({
      where: { id: inviteId },
      include: { squad: { select: { captainId: true } } },
    });

    if (!invite) {
      throw new Error('Invite not found');
    }

    // Allow cancellation by inviter or current captain
    if (invite.inviterId !== cancelerId && invite.squad.captainId !== cancelerId) {
      throw new Error('Only the inviter or captain can cancel this invite');
    }

    if (invite.status !== 'PENDING') {
      throw new Error(`Invite has already been ${invite.status.toLowerCase()}`);
    }

    const updated = await prisma.squadInvite.update({
      where: { id: inviteId },
      data: {
        status: 'CANCELLED',
        respondedAt: new Date(),
      },
    });

    return updated as unknown as SquadInvite;
  }

  /**
   * Get user's pending invites
   */
  async getUserPendingInvites(userId: string): Promise<SquadInviteWithDetails[]> {
    const invites = await prisma.squadInvite.findMany({
      where: {
        inviteeId: userId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      include: INVITE_WITH_DETAILS_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return invites as unknown as SquadInviteWithDetails[];
  }

  /**
   * Get pending invites for a squad (captain only)
   */
  async getSquadPendingInvites(squadId: string, captainId: string): Promise<SquadInviteWithDetails[]> {
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      select: { captainId: true },
    });

    if (!squad) {
      throw new Error('Squad not found');
    }

    if (squad.captainId !== captainId) {
      throw new Error('Only the captain can view pending invites');
    }

    const invites = await prisma.squadInvite.findMany({
      where: {
        squadId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      include: INVITE_WITH_DETAILS_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return invites as unknown as SquadInviteWithDetails[];
  }

  /**
   * Get invite by ID with details
   */
  async getInvite(inviteId: string): Promise<SquadInviteWithDetails | null> {
    const invite = await prisma.squadInvite.findUnique({
      where: { id: inviteId },
      include: INVITE_WITH_DETAILS_INCLUDE,
    });

    return invite as unknown as SquadInviteWithDetails | null;
  }
}

export const inviteService = InviteService.getInstance();
