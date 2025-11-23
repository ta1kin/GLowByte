import { Injectable, OnModuleInit } from '@nestjs/common';
import { QueueService } from '../queue.service';
import { PredictionProcessor } from './processors/prediction.processor';
import { AppLogger } from '../../common/logger/logger.service';

@Injectable()
export class PredictionConsumer implements OnModuleInit {
  private readonly logger = new AppLogger();
  private readonly CONTEXT = 'PredictionConsumer';

  constructor(
    private queueService: QueueService,
    private predictionProcessor: PredictionProcessor,
  ) {}

  async onModuleInit() {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    try {
      await this.queueService.consume('prediction.calculate', async (message, msg) => {
      this.logger.log(
        `Обработка прогноза: штабель ${message.shtabelId}`,
        this.CONTEXT,
        { shtabelId: message.shtabelId },
      );

      try {
        await this.predictionProcessor.processPrediction(
          message.shtabelId,
          message.horizonDays,
        );
        this.logger.log(
          `Прогноз завершен: штабель ${message.shtabelId}`,
          this.CONTEXT,
        );
      } catch (error) {
        this.logger.error(
          `Прогноз завершился ошибкой: штабель ${message.shtabelId}`,
          error instanceof Error ? error.stack : String(error),
          this.CONTEXT,
          { shtabelId: message.shtabelId, error },
        );
        throw error;
      }
    });

    await this.queueService.consume('prediction.batch', async (message, msg) => {
      this.logger.log(
        `Обработка пакетного прогноза: ${message.shtabelIds?.length || 0} штабелей`,
        this.CONTEXT,
        { count: message.shtabelIds?.length },
      );

      try {
        await this.predictionProcessor.processBatchPredictions(
          message.shtabelIds || [],
        );
        this.logger.log('Пакетный прогноз завершен', this.CONTEXT);
      } catch (error) {
        this.logger.error(
          'Пакетный прогноз завершился ошибкой',
          error instanceof Error ? error.stack : String(error),
          this.CONTEXT,
          { error },
        );
        throw error;
      }
    });

    this.logger.log('Потребители прогнозов запущены', this.CONTEXT);
    } catch (error) {
      this.logger.error(
        'Не удалось запустить потребители прогнозов',
        (error instanceof Error ? error.stack : String(error)),
        this.CONTEXT,
        { error }
      );
    }
  }
}

