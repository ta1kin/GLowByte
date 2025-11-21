import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, CheckAuthDto } from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with Telegram ID' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.telegramId, loginDto.userData);
  }

  @Post('check')
  @ApiOperation({ summary: 'Check authentication status' })
  @ApiBody({ type: CheckAuthDto })
  async checkAuth(@Body() checkAuthDto: CheckAuthDto) {
    return this.authService.checkAuth(checkAuthDto.telegramId);
  }
}

