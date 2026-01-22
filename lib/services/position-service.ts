import { prisma } from '@/lib/prisma';
import { notificationService } from './notification-service';
import { ethosClient } from './ethos-client';
import type {
  OpenPosition,
  OpenPositionWithSquad,
  OpenPositionWithApplications,
  Application,
  ApplicationWithApplicant,
  ApplicationWithPosition,
  CreatePositionInput,
  PositionEligibility,
  ListPositionsFilter,
  EthosScoreTier,
  Benefit,
} from '@/types/position';
import {
  ETHOS_SCORE_TIERS,
  meetsScoreTier,
  getPositionExpiryDate,
  getApplicationExpiryDate,
} from '@/types/position';
import type { SquadRole } from '@/types/squad';

const USER_SELECT = {
  id: true,
  ethosProfileId: true,
  ethosDisplayName: true,
  ethosUsername: true,
  ethosAvatarUrl: true,
  ethosScore: true,
} as const;

const SQUAD_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
  captainId: true,
  maxSize: true,
  _count: { select: { members: true } },
  captain: { select: USER_SELECT },
  members: {
    select: {
      user: {
        select: {
          ethosScore: true,
          ethosAvatarUrl: true,
          ethosDisplayName: true,
          ethosUsername: true,
        },
      },
    },
  },
} as const;

export class PositionService {
  private static instance: PositionService;

  private constructor() {}

  static getInstance(): PositionService {
    if (!PositionService.instance) {
      PositionService.instance = new PositionService();
    }
    return PositionService.instance;
  }

  // ==================== Captain Methods ====================

  /**
   * Create a new open position for a squad (captain only)
   */
  async createPosition(
    squadId: string,
    captainId: string,
    input: CreatePositionInput
  ): Promise<OpenPositionWithSquad> {
    // Verify captain
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      select: {
        captainId: true,
        maxSize: true,
        _count: { select: { members: true, openPositions: true } },
      },
    });

    if (!squad) {
      throw new Error('Squad not found');
    }

    if (squad.captainId !== captainId) {
      throw new Error('Only the captain can create positions');
    }

    // Check available slots (current members + open positions < maxSize)
    const freeSlots = squad.maxSize - squad._count.members;
    const openPositionCount = await prisma.openPosition.count({
      where: { squadId, isOpen: true, expiresAt: { gt: new Date() } },
    });

    if (openPositionCount >= freeSlots) {
      throw new Error('No available slots for new positions');
    }

    const expiresAt = getPositionExpiryDate();

    const position = await prisma.openPosition.create({
      data: {
        squadId,
        role: input.role,
        description: input.description,
        ethosScoreTier: input.ethosScoreTier ?? 'BELOW_1400',
        requiresMutualVouch: input.requiresMutualVouch ?? false,
        benefits: input.benefits ?? [],
        expiresAt,
      },
      include: {
        squad: { select: SQUAD_SELECT },
        _count: { select: { applications: true } },
      },
    });

    return position as unknown as OpenPositionWithSquad;
  }

  /**
   * Delete an open position (captain only)
   * Notifies all pending applicants
   */
  async deletePosition(positionId: string, captainId: string): Promise<void> {
    const position = await prisma.openPosition.findUnique({
      where: { id: positionId },
      include: {
        squad: { select: { id: true, name: true, captainId: true } },
        applications: {
          where: { status: 'PENDING' },
          select: { id: true, applicantId: true },
        },
      },
    });

    if (!position) {
      throw new Error('Position not found');
    }

    if (position.squad.captainId !== captainId) {
      throw new Error('Only the captain can delete positions');
    }

    // Transaction: reject all pending applications and delete position
    await prisma.$transaction(async (tx) => {
      // Reject all pending applications
      await tx.application.updateMany({
        where: { positionId, status: 'PENDING' },
        data: { status: 'REJECTED', respondedAt: new Date() },
      });

      // Delete position
      await tx.openPosition.delete({ where: { id: positionId } });
    });

    // Notify all pending applicants (outside transaction)
    for (const app of position.applications) {
      await notificationService.notifyPositionDeleted(
        app.applicantId,
        position.squad.name,
        position.squad.id,
        positionId,
        app.id
      );
    }
  }

  /**
   * Get all positions for a squad (with application counts)
   */
  async getSquadPositions(squadId: string): Promise<OpenPositionWithApplications[]> {
    const positions = await prisma.openPosition.findMany({
      where: { squadId },
      include: {
        applications: {
          include: { applicant: { select: USER_SELECT } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return positions as unknown as OpenPositionWithApplications[];
  }

  /**
   * Get applications for a specific position (captain only)
   */
  async getPositionApplications(
    positionId: string,
    captainId: string
  ): Promise<ApplicationWithApplicant[]> {
    const position = await prisma.openPosition.findUnique({
      where: { id: positionId },
      select: { squad: { select: { captainId: true } } },
    });

    if (!position) {
      throw new Error('Position not found');
    }

    if (position.squad.captainId !== captainId) {
      throw new Error('Only the captain can view applications');
    }

    const applications = await prisma.application.findMany({
      where: { positionId },
      include: { applicant: { select: USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });

    return applications as unknown as ApplicationWithApplicant[];
  }

  /**
   * Approve an application (captain only)
   * Adds member to squad and closes position
   */
  async approveApplication(
    applicationId: string,
    captainId: string
  ): Promise<{ application: Application; memberId: string }> {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        position: {
          include: {
            squad: {
              select: {
                id: true,
                name: true,
                captainId: true,
                maxSize: true,
                _count: { select: { members: true } },
              },
            },
          },
        },
        applicant: { select: { id: true, ethosScore: true, ethosProfileId: true } },
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.position.squad.captainId !== captainId) {
      throw new Error('Only the captain can approve applications');
    }

    if (application.status !== 'PENDING') {
      throw new Error(`Application has already been ${application.status.toLowerCase()}`);
    }

    if (!application.position.isOpen) {
      throw new Error('Position is no longer open');
    }

    // Re-verify eligibility at approval time
    const eligibility = await this.checkEligibility(
      application.positionId,
      application.applicantId
    );

    if (!eligibility.eligible) {
      throw new Error('Applicant no longer meets eligibility requirements');
    }

    // Check squad capacity
    if (application.position.squad._count.members >= application.position.squad.maxSize) {
      throw new Error('Squad is at maximum capacity');
    }

    // Transaction: approve application, add member, close position, reject other apps
    const result = await prisma.$transaction(async (tx) => {
      // Approve the application
      const approved = await tx.application.update({
        where: { id: applicationId },
        data: { status: 'APPROVED', respondedAt: new Date() },
      });

      // Add member to squad
      const member = await tx.squadMember.create({
        data: {
          squadId: application.position.squadId,
          userId: application.applicantId,
          role: application.position.role,
        },
      });

      // Update squad active status
      const memberCount = await tx.squadMember.count({
        where: { squadId: application.position.squadId },
      });

      await tx.squad.update({
        where: { id: application.position.squadId },
        data: { isActive: memberCount >= 2 },
      });

      // Close the position
      await tx.openPosition.update({
        where: { id: application.positionId },
        data: { isOpen: false },
      });

      // Reject all other pending applications for this position
      const otherApps = await tx.application.findMany({
        where: { positionId: application.positionId, status: 'PENDING', id: { not: applicationId } },
        select: { id: true, applicantId: true },
      });

      await tx.application.updateMany({
        where: { positionId: application.positionId, status: 'PENDING', id: { not: applicationId } },
        data: { status: 'REJECTED', respondedAt: new Date() },
      });

      return { approved, member, otherApps };
    });

    // Notify approved applicant
    await notificationService.notifyApplicationApproved(
      application.applicantId,
      application.position.squad.name,
      application.position.squad.id,
      application.positionId,
      applicationId
    );

    // Notify rejected applicants
    for (const app of result.otherApps) {
      await notificationService.notifyApplicationRejected(
        app.applicantId,
        application.position.squad.name,
        application.position.squad.id,
        application.positionId,
        app.id
      );
    }

    return { application: result.approved as unknown as Application, memberId: result.member.id };
  }

  /**
   * Reject an application (captain only)
   */
  async rejectApplication(applicationId: string, captainId: string): Promise<Application> {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        position: {
          include: { squad: { select: { id: true, name: true, captainId: true } } },
        },
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.position.squad.captainId !== captainId) {
      throw new Error('Only the captain can reject applications');
    }

    if (application.status !== 'PENDING') {
      throw new Error(`Application has already been ${application.status.toLowerCase()}`);
    }

    const rejected = await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'REJECTED', respondedAt: new Date() },
    });

    // Notify applicant
    await notificationService.notifyApplicationRejected(
      application.applicantId,
      application.position.squad.name,
      application.position.squad.id,
      application.positionId,
      applicationId
    );

    return rejected as unknown as Application;
  }

  // ==================== Public Methods ====================

  /**
   * List all open positions (browse)
   */
  async listOpenPositions(filter: ListPositionsFilter = {}): Promise<OpenPositionWithSquad[]> {
    const { role, ethosScoreTier, benefits, limit = 20, offset = 0 } = filter;

    const positions = await prisma.openPosition.findMany({
      where: {
        isOpen: true,
        expiresAt: { gt: new Date() },
        ...(role ? { role } : {}),
        ...(ethosScoreTier ? { ethosScoreTier } : {}),
        ...(benefits && benefits.length > 0 ? { benefits: { hasSome: benefits } } : {}),
      },
      include: {
        squad: { select: SQUAD_SELECT },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return positions as unknown as OpenPositionWithSquad[];
  }

  /**
   * Get a single position by ID
   */
  async getPosition(positionId: string): Promise<OpenPositionWithSquad | null> {
    const position = await prisma.openPosition.findUnique({
      where: { id: positionId },
      include: {
        squad: { select: SQUAD_SELECT },
        _count: { select: { applications: true } },
      },
    });

    return position as unknown as OpenPositionWithSquad | null;
  }

  // ==================== Applicant Methods ====================

  /**
   * Apply to a position
   */
  async applyToPosition(
    positionId: string,
    applicantId: string,
    message?: string
  ): Promise<ApplicationWithPosition> {
    // Check eligibility first
    const eligibility = await this.checkEligibility(positionId, applicantId);

    if (!eligibility.eligible) {
      if (eligibility.isAlreadyMember) {
        throw new Error('You are already a member of this squad');
      }
      if (eligibility.hasExistingApplication) {
        throw new Error('You have already applied to this position');
      }
      if (!eligibility.meetsScoreRequirement) {
        throw new Error(`Your Ethos score does not meet the minimum requirement of ${eligibility.requiredMinScore}`);
      }
      if (!eligibility.meetsMutualVouchRequirement) {
        throw new Error('This position requires a mutual vouch with the squad captain');
      }
      throw new Error('You are not eligible for this position');
    }

    const position = await prisma.openPosition.findUnique({
      where: { id: positionId },
      include: { squad: { select: { id: true, name: true, captainId: true } } },
    });

    if (!position) {
      throw new Error('Position not found');
    }

    if (!position.isOpen || new Date() > position.expiresAt) {
      throw new Error('Position is no longer accepting applications');
    }

    const expiresAt = getApplicationExpiryDate();

    const application = await prisma.application.create({
      data: {
        positionId,
        applicantId,
        message,
        expiresAt,
      },
      include: {
        position: {
          include: { squad: { select: SQUAD_SELECT } },
        },
      },
    });

    // Get applicant name for notification
    const applicant = await prisma.user.findUnique({
      where: { id: applicantId },
      select: { ethosDisplayName: true, ethosUsername: true },
    });
    const applicantName = applicant?.ethosDisplayName || applicant?.ethosUsername || 'Someone';

    // Notify captain
    await notificationService.notifyApplicationReceived(
      position.squad.captainId,
      applicantName,
      position.squad.name,
      position.squad.id,
      positionId,
      application.id
    );

    return application as unknown as ApplicationWithPosition;
  }

  /**
   * Withdraw an application (applicant only)
   */
  async withdrawApplication(applicationId: string, applicantId: string): Promise<Application> {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.applicantId !== applicantId) {
      throw new Error('This is not your application');
    }

    if (application.status !== 'PENDING') {
      throw new Error(`Application has already been ${application.status.toLowerCase()}`);
    }

    const withdrawn = await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'WITHDRAWN', respondedAt: new Date() },
    });

    return withdrawn as unknown as Application;
  }

  /**
   * Get user's applications
   */
  async getUserApplications(userId: string): Promise<ApplicationWithPosition[]> {
    const applications = await prisma.application.findMany({
      where: { applicantId: userId },
      include: {
        position: {
          include: { squad: { select: SQUAD_SELECT } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications as unknown as ApplicationWithPosition[];
  }

  // ==================== Utility Methods ====================

  /**
   * Check if a user is eligible for a position
   */
  async checkEligibility(positionId: string, userId: string): Promise<PositionEligibility> {
    const position = await prisma.openPosition.findUnique({
      where: { id: positionId },
      include: {
        squad: {
          select: {
            id: true,
            captainId: true,
            captain: { select: { ethosProfileId: true } },
          },
        },
      },
    });

    if (!position) {
      throw new Error('Position not found');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        ethosScore: true,
        ethosProfileId: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if already a member
    const existingMember = await prisma.squadMember.findFirst({
      where: { squadId: position.squadId, userId },
    });
    const isAlreadyMember = !!existingMember;

    // Check for existing application
    const existingApplication = await prisma.application.findFirst({
      where: {
        positionId,
        applicantId: userId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });
    const hasExistingApplication = !!existingApplication;

    // Check score requirement
    const requiredMinScore = ETHOS_SCORE_TIERS[position.ethosScoreTier].min;
    const meetsScoreRequirement = meetsScoreTier(user.ethosScore, position.ethosScoreTier);

    // Check mutual vouch requirement
    let hasMutualVouch = true;
    if (position.requiresMutualVouch) {
      hasMutualVouch = await this.checkMutualVouch(
        user.ethosProfileId,
        position.squad.captain?.ethosProfileId
      );
    }
    const meetsMutualVouchRequirement = !position.requiresMutualVouch || hasMutualVouch;

    const eligible =
      !isAlreadyMember &&
      !hasExistingApplication &&
      meetsScoreRequirement &&
      meetsMutualVouchRequirement;

    return {
      eligible,
      meetsScoreRequirement,
      meetsMutualVouchRequirement,
      userScore: user.ethosScore,
      requiredMinScore,
      requiresMutualVouch: position.requiresMutualVouch,
      hasMutualVouch,
      isAlreadyMember,
      hasExistingApplication,
    };
  }

  /**
   * Check if two users have a mutual vouch on Ethos
   */
  private async checkMutualVouch(
    userProfileId: number | null,
    captainProfileId: number | null
  ): Promise<boolean> {
    if (!userProfileId || !captainProfileId) {
      return false;
    }

    try {
      const userKey = `profileId:${userProfileId}`;
      const result = await ethosClient.getMutualVouchers(userKey);
      if (!result.ok || !result.data) {
        return false;
      }

      // Check if captain is in mutual vouchers list
      const captainKey = `profileId:${captainProfileId}`;
      return result.data.includes(captainKey);
    } catch {
      // If API fails, default to no mutual vouch
      return false;
    }
  }

  /**
   * Close excess positions when squad fills via invite
   * Called after accepting an invite
   */
  async closeExcessPositions(squadId: string): Promise<number> {
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      select: {
        id: true,
        name: true,
        maxSize: true,
        _count: { select: { members: true } },
      },
    });

    if (!squad) {
      return 0;
    }

    const freeSlots = squad.maxSize - squad._count.members;

    if (freeSlots >= 1) {
      return 0; // Still have room
    }

    // Close all open positions and notify applicants
    const positions = await prisma.openPosition.findMany({
      where: { squadId, isOpen: true },
      include: {
        applications: {
          where: { status: 'PENDING' },
          select: { id: true, applicantId: true },
        },
      },
    });

    await prisma.openPosition.updateMany({
      where: { squadId, isOpen: true },
      data: { isOpen: false },
    });

    await prisma.application.updateMany({
      where: {
        position: { squadId, isOpen: false },
        status: 'PENDING',
      },
      data: { status: 'REJECTED', respondedAt: new Date() },
    });

    // Notify all affected applicants
    for (const position of positions) {
      for (const app of position.applications) {
        await notificationService.notifyPositionDeleted(
          app.applicantId,
          squad.name,
          squadId,
          position.id,
          app.id
        );
      }
    }

    return positions.length;
  }

  /**
   * Process expirations (for cron job)
   */
  async processExpirations(): Promise<{ expiredPositions: number; expiredApplications: number }> {
    const now = new Date();

    // Expire positions
    const expiredPositions = await prisma.openPosition.updateMany({
      where: { isOpen: true, expiresAt: { lt: now } },
      data: { isOpen: false },
    });

    // Find applications that will expire
    const applicationsToExpire = await prisma.application.findMany({
      where: { status: 'PENDING', expiresAt: { lt: now } },
      include: {
        position: { include: { squad: { select: { id: true, name: true } } } },
      },
    });

    // Expire applications
    const expiredApplications = await prisma.application.updateMany({
      where: { status: 'PENDING', expiresAt: { lt: now } },
      data: { status: 'EXPIRED', respondedAt: now },
    });

    // Notify expired applicants
    for (const app of applicationsToExpire) {
      await notificationService.notifyApplicationExpired(
        app.applicantId,
        app.position.squad.name,
        app.position.squad.id,
        app.positionId,
        app.id
      );
    }

    return {
      expiredPositions: expiredPositions.count,
      expiredApplications: expiredApplications.count,
    };
  }
}

export const positionService = PositionService.getInstance();
