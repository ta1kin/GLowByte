import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/logger/logger.service';
import { successResponse, errorResponse } from '../common/helpers/api.response.helper';

@Injectable()
export class NotificationService {
  private readonly logger = new AppLogger();
  private readonly CONTEXT = 'NotificationService';

  constructor(private prisma: PrismaService) {}

  async getNotifications(userId: number, limit = 50) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return successResponse(notifications, 'Notifications retrieved');
    } catch (error) {
      this.logger.error('Error getting notifications', error.stack, this.CONTEXT);
      return errorResponse('Failed to get notifications', error);
    }
  }

  async markAsRead(notificationId: number, userId: number) {
    try {
      const notification = await this.prisma.notification.update({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          status: 'READ',
          readAt: new Date(),
        },
      });

      return successResponse(notification, 'Notification marked as read');
    } catch (error) {
      this.logger.error('Error marking notification as read', error.stack, this.CONTEXT);
      return errorResponse('Failed to mark notification as read', error);
    }
  }

  async createNotification(data: {
    userId: number;
    type: string;
    title: string;
    message: string;
    data?: any;
    predictionId?: number;
    shtabelId?: number;
    skladId?: number;
  }) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type as any,
          title: data.title,
          message: data.message,
          data: data.data,
          predictionId: data.predictionId,
          shtabelId: data.shtabelId,
          skladId: data.skladId,
          status: 'PENDING',
        },
      });

      return successResponse(notification, 'Notification created');
    } catch (error) {
      this.logger.error('Error creating notification', error.stack, this.CONTEXT);
      return errorResponse('Failed to create notification', error);
    }
  }
}

