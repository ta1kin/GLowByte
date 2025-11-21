import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Request() req: any) {
    return this.userService.getUserProfile(req.user.id);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update user settings' })
  async updateSettings(@Request() req: any, @Body() settings: any) {
    return this.userService.updateUserSettings(req.user.id, settings);
  }
}

