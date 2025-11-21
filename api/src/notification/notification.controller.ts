import { Controller, Get, Put, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  async getNotifications() {
    // TODO: Get userId from auth guard
    const userId = 1; // Placeholder
    return this.notificationService.getNotifications(userId);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    // TODO: Get userId from auth guard
    const userId = 1; // Placeholder
    return this.notificationService.markAsRead(id, userId);
  }
}

