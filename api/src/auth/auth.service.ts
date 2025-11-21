import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/logger/logger.service';
import { successResponse, errorResponse } from '../common/helpers/api.response.helper';

@Injectable()
export class AuthService {
  private readonly logger = new AppLogger();
  private readonly CONTEXT = 'AuthService';

  constructor(private prisma: PrismaService) {}

  async validateTelegramUser(telegramId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user || user.status !== 'ACTIVE') {
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error('Error validating telegram user', error.stack, this.CONTEXT);
      return null;
    }
  }

  async login(telegramId: string, userData?: any) {
    try {
      let user = await this.prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            telegramId,
            username: userData?.username,
            firstName: userData?.first_name,
            lastName: userData?.last_name,
            fullName: userData?.first_name && userData?.last_name
              ? `${userData.first_name} ${userData.last_name}`
              : userData?.first_name || userData?.username || null,
            role: 'OPERATOR',
            status: 'ACTIVE',
          },
        });

        // Create default user settings
        await this.prisma.userSettings.create({
          data: {
            userId: user.id,
          },
        });

        this.logger.log(`New user created: ${telegramId}`, this.CONTEXT);
      } else {
        // Update user data if provided
        if (userData) {
          user = await this.prisma.user.update({
            where: { telegramId },
            data: {
              username: userData.username || user.username,
              firstName: userData.first_name || user.firstName,
              lastName: userData.last_name || user.lastName,
              fullName: userData.first_name && userData.last_name
                ? `${userData.first_name} ${userData.last_name}`
                : userData.first_name || userData.username || user.fullName,
            },
          });
        }
      }

      return successResponse(user, 'Login successful');
    } catch (error) {
      this.logger.error('Error during login', error.stack, this.CONTEXT);
      return errorResponse('Login failed', error);
    }
  }

  async checkAuth(telegramId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { telegramId },
        include: {
          userSettings: true,
        },
      });

      if (!user) {
        return successResponse(null, 'User not found');
      }

      if (user.status !== 'ACTIVE') {
        return successResponse({ status: user.status }, 'User is not active');
      }

      return successResponse(user, 'User authenticated');
    } catch (error) {
      this.logger.error('Error checking auth', error.stack, this.CONTEXT);
      return errorResponse('Auth check failed', error);
    }
  }
}

