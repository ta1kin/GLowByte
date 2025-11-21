import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Telegram user ID' })
  @IsString()
  @IsNotEmpty()
  telegramId: string;

  @ApiProperty({ description: 'Additional user data from Telegram', required: false })
  @IsObject()
  @IsOptional()
  userData?: {
    username?: string;
    first_name?: string;
    last_name?: string;
  };
}

