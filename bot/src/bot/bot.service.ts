import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';
import axios from 'axios';

@Injectable()
export class BotService {
  private readonly apiUrl = process.env.API_URL || 'http://localhost:3000';
  private readonly clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  async start(ctx: Context) {
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📊 Открыть приложение',
              web_app: {
                url: this.clientUrl,
              },
            },
          ],
          [
            {
              text: '📈 Прогнозы',
              callback_data: 'predictions',
            },
            {
              text: '⚠️ Критические риски',
              callback_data: 'critical_risks',
            },
          ],
          [
            {
              text: '❓ Помощь',
              callback_data: 'help',
            },
          ],
        ],
      },
    };

    await ctx.reply(
      '🔥 Добро пожаловать в систему прогнозирования самовозгорания угля!\n\n' +
        'Используйте кнопки ниже для навигации.',
      inlineKeyboard,
    );
  }

  async showPredictions(ctx: Context) {
    try {
      const response = await axios.get(`${this.apiUrl}/predictions?limit=10`);
      const predictions = response.data.data || [];

      if (predictions.length === 0) {
        await ctx.answerCbQuery('Нет доступных прогнозов');
        return;
      }

      let message = '📈 Последние прогнозы:\n\n';
      predictions.slice(0, 5).forEach((pred: any, index: number) => {
        const riskEmoji = this.getRiskEmoji(pred.riskLevel);
        message += `${index + 1}. ${riskEmoji} Штабель #${pred.shtabel.label}\n`;
        if (pred.predictedDate) {
          const date = new Date(pred.predictedDate);
          message += `   Дата: ${date.toLocaleDateString('ru-RU')}\n`;
        }
        message += `   Уровень риска: ${pred.riskLevel}\n\n`;
      });

      await ctx.editMessageText(message, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ Назад', callback_data: 'back_to_main' }],
          ],
        },
      });
    } catch (error) {
      await ctx.answerCbQuery('Ошибка при получении прогнозов');
    }
  }

  async showCriticalRisks(ctx: Context) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/predictions?riskLevel=CRITICAL&limit=10`,
      );
      const predictions = response.data.data || [];

      if (predictions.length === 0) {
        await ctx.answerCbQuery('Нет критических рисков');
        return;
      }

      let message = '⚠️ КРИТИЧЕСКИЕ РИСКИ:\n\n';
      predictions.forEach((pred: any, index: number) => {
        message += `🚨 ${index + 1}. Штабель #${pred.shtabel.label}\n`;
        message += `   Склад: ${pred.shtabel.sklad.number}\n`;
        if (pred.predictedDate) {
          const date = new Date(pred.predictedDate);
          message += `   Прогноз: ${date.toLocaleDateString('ru-RU')}\n`;
        }
        message += '\n';
      });

      await ctx.editMessageText(message, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ Назад', callback_data: 'back_to_main' }],
          ],
        },
      });
    } catch (error) {
      await ctx.answerCbQuery('Ошибка при получении критических рисков');
    }
  }

  async showHelp(ctx: Context) {
    const message =
      '❓ Помощь\n\n' +
      '📊 Открыть приложение - запуск веб-приложения\n' +
      '📈 Прогнозы - просмотр последних прогнозов\n' +
      '⚠️ Критические риски - список штабелей с высоким риском\n\n' +
      'Для получения дополнительной информации обратитесь к администратору.';

    await ctx.editMessageText(message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '⬅️ Назад', callback_data: 'back_to_main' }],
        ],
      },
    });
  }

  async backToMain(ctx: Context) {
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📊 Открыть приложение',
              web_app: {
                url: this.clientUrl,
              },
            },
          ],
          [
            {
              text: '📈 Прогнозы',
              callback_data: 'predictions',
            },
            {
              text: '⚠️ Критические риски',
              callback_data: 'critical_risks',
            },
          ],
          [
            {
              text: '❓ Помощь',
              callback_data: 'help',
            },
          ],
        ],
      },
    };

    await ctx.editMessageText(
      '🔥 Добро пожаловать в систему прогнозирования самовозгорания угля!\n\n' +
        'Используйте кнопки ниже для навигации.',
      inlineKeyboard,
    );
  }

  async notifyUser(telegramId: string, message: string) {
    try {
      await this.bot.telegram.sendMessage(telegramId, message);
    } catch (error) {
      console.error(`Error sending notification to ${telegramId}:`, error);
    }
  }

  private getRiskEmoji(riskLevel: string): string {
    switch (riskLevel) {
      case 'CRITICAL':
        return '🚨';
      case 'HIGH':
        return '⚠️';
      case 'MEDIUM':
        return '⚡';
      case 'LOW':
        return '✅';
      default:
        return '📊';
    }
  }
}

