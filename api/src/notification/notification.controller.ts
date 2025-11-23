import {
	Controller,
	Get,
	Put,
	Param,
	ParseIntPipe,
	Req,
	UnauthorizedException,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Request } from 'express'
import { NotificationService } from './notification.service'

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@Get()
	@ApiOperation({ summary: 'Get user notifications' })
	@ApiBearerAuth()
	async getNotifications(
		@Req() req: Request & { user?: { id: number } },
	) {
		const userId = req.user?.id
		if (!userId) {
			throw new UnauthorizedException('User not authenticated')
		}
		return this.notificationService.getNotifications(userId)
	}

	@Put(':id/read')
	@ApiOperation({ summary: 'Mark notification as read' })
	@ApiBearerAuth()
	async markAsRead(
		@Param('id', ParseIntPipe) id: number,
		@Req() req: Request & { user?: { id: number } },
	) {
		const userId = req.user?.id
		if (!userId) {
			throw new UnauthorizedException('User not authenticated')
		}
		return this.notificationService.markAsRead(id, userId)
	}
}

