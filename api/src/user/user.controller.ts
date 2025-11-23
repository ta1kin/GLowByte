import { Controller, Get, Put, Body, Req, UnauthorizedException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Request } from 'express'
import { UserService } from './user.service'
import { UpdateUserSettingsDto } from './dto'

@ApiTags('User')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	@ApiOperation({ summary: 'Get user profile' })
	@ApiBearerAuth()
	async getProfile(@Req() req: Request & { user?: { id: number } }) {
		const userId = req.user?.id
		if (!userId) {
			throw new UnauthorizedException('User not authenticated')
		}
		return this.userService.getUserProfile(userId)
	}

	@Put('settings')
	@ApiOperation({ summary: 'Update user settings' })
	@ApiBearerAuth()
	async updateSettings(
		@Req() req: Request & { user?: { id: number } },
		@Body() settings: UpdateUserSettingsDto,
	) {
		const userId = req.user?.id
		if (!userId) {
			throw new UnauthorizedException('User not authenticated')
		}
		return this.userService.updateUserSettings(userId, settings)
	}
}

