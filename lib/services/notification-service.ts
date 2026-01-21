import { prisma } from '@/lib/prisma';
import type {
  Notification,
  NotificationType,
  CreateNotificationInput,
} from '@/types/position';

interface ListNotificationsOptions {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Create a notification for a user
   */
  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        squadId: input.squadId,
        positionId: input.positionId,
        applicationId: input.applicationId,
      },
    });

    return notification as unknown as Notification;
  }

  /**
   * Create notification for application received (captain)
   */
  async notifyApplicationReceived(
    captainId: string,
    applicantName: string,
    squadName: string,
    squadId: string,
    positionId: string,
    applicationId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId: captainId,
      type: 'APPLICATION_RECEIVED',
      title: 'New Application',
      message: `${applicantName} applied to join ${squadName}`,
      squadId,
      positionId,
      applicationId,
    });
  }

  /**
   * Create notification for application approved (applicant)
   */
  async notifyApplicationApproved(
    applicantId: string,
    squadName: string,
    squadId: string,
    positionId: string,
    applicationId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId: applicantId,
      type: 'APPLICATION_APPROVED',
      title: 'Application Approved',
      message: `Your application to join ${squadName} has been approved!`,
      squadId,
      positionId,
      applicationId,
    });
  }

  /**
   * Create notification for application rejected (applicant)
   */
  async notifyApplicationRejected(
    applicantId: string,
    squadName: string,
    squadId: string,
    positionId: string,
    applicationId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId: applicantId,
      type: 'APPLICATION_REJECTED',
      title: 'Application Rejected',
      message: `Your application to join ${squadName} was not accepted`,
      squadId,
      positionId,
      applicationId,
    });
  }

  /**
   * Create notification for application expired (applicant)
   */
  async notifyApplicationExpired(
    applicantId: string,
    squadName: string,
    squadId: string,
    positionId: string,
    applicationId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId: applicantId,
      type: 'APPLICATION_EXPIRED',
      title: 'Application Expired',
      message: `Your application to join ${squadName} has expired`,
      squadId,
      positionId,
      applicationId,
    });
  }

  /**
   * Create notification for position deleted (all pending applicants)
   */
  async notifyPositionDeleted(
    applicantId: string,
    squadName: string,
    squadId: string,
    positionId: string,
    applicationId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId: applicantId,
      type: 'POSITION_DELETED',
      title: 'Position Closed',
      message: `The position you applied for at ${squadName} has been closed`,
      squadId,
      positionId,
      applicationId,
    });
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(
    userId: string,
    options: ListNotificationsOptions = {}
  ): Promise<Notification[]> {
    const { limit = 20, offset = 0, unreadOnly = false } = options;

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return notifications as unknown as Notification[];
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Not authorized to modify this notification');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return updated as unknown as Notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });

    return result.count;
  }
}

export const notificationService = NotificationService.getInstance();
