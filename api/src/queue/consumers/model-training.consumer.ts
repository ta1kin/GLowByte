import { Injectable, OnModuleInit } from '@nestjs/common';
import { QueueService } from '../queue.service';
import { ModelTrainingProcessor } from './processors/model-training.processor';
import { AppLogger } from '../../common/logger/logger.service';

@Injectable()
export class ModelTrainingConsumer implements OnModuleInit {
  private readonly logger = new AppLogger();
  private readonly CONTEXT = 'ModelTrainingConsumer';

  constructor(
    private queueService: QueueService,
    private modelTrainingProcessor: ModelTrainingProcessor,
  ) {}

  async onModuleInit() {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    try {
      await this.queueService.consume('model.train', async (message, msg) => {
      this.logger.log(
        `Обработка обучения модели: ${message.modelName || 'default'}`,
        this.CONTEXT,
        {
          modelName: message.modelName,
          modelVersion: message.modelVersion,
          config: message.config,
        },
      );

      try {
        await this.modelTrainingProcessor.processTraining(
          message.modelName,
          message.modelVersion,
          message.config,
        );
        this.logger.log(
          `Обучение модели завершено: ${message.modelName}`,
          this.CONTEXT,
        );
      } catch (error) {
        this.logger.error(
          `Обучение модели завершилось ошибкой: ${message.modelName}`,
          (error instanceof Error ? error.stack : String(error)),
          this.CONTEXT,
          { modelName: message.modelName, error },
        );
        throw error;
      }
    });

    this.logger.log('Потребитель обучения модели запущен', this.CONTEXT);
    } catch (error) {
      this.logger.error(
        'Не удалось запустить потребитель обучения модели',
        (error instanceof Error ? error.stack : String(error)),
        this.CONTEXT,
        { error }
      );
    }
  }
}

