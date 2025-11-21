import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/logger/logger.service';
import { successResponse, errorResponse } from '../common/helpers/api.response.helper';

@Injectable()
export class UserService {
  private readonly logger = new AppLogger();
  private readonly CONTEXT = 'UserService';

  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          userSettings: true,
        },
      });

      if (!user) {
        return errorResponse('User not found');
      }

      return successResponse(user, 'User profile retrieved');
    } catch (error) {
      this.logger.error('Error getting user profile', error.stack, this.CONTEXT);
      return errorResponse('Failed to get user profile', error);
    }
  }

  async updateUserSettings(userId: number, settings: any) {
    try {
      const updated = await this.prisma.userSettings.upsert({
        where: { userId },
        update: settings,
        create: {
          userId,
          ...settings,
        },
      });

      return successResponse(updated, 'Settings updated');
    } catch (error) {
      this.logger.error('Error updating user settings', error.stack, this.CONTEXT);
      return errorResponse('Failed to update settings', error);
    }
  }
}

