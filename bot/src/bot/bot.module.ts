import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule } from '@nestjs/config';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // В Docker переменные передаются через environment, не через .env файл
      // envFilePath: '.env',
    }),
    TelegrafModule.forRoot({
      token: (() => {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) {
          console.error('❌ TELEGRAM_BOT_TOKEN не установлен!');
          console.error('Установите переменную TELEGRAM_BOT_TOKEN в корневом .env файле или через docker-compose.yml');
          throw new Error('TELEGRAM_BOT_TOKEN is required');
        }
        return token;
      })(),
    }),
  ],
  providers: [BotService, BotUpdate],
})
export class BotModule {}

