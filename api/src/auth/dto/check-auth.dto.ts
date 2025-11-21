import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CheckAuthDto {
  @ApiProperty({ description: 'Telegram user ID' })
  @IsString()
  @IsNotEmpty()
  telegramId: string;
}

