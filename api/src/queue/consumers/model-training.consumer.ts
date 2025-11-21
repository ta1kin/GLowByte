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
    await this.queueService.consume('model.train', async (message, msg) => {
      this.logger.log(
        `Processing model training: ${message.modelName || 'default'}`,
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
          `Model training completed: ${message.modelName}`,
          this.CONTEXT,
        );
      } catch (error) {
        this.logger.error(
          `Model training failed: ${message.modelName}`,
          error.stack,
          this.CONTEXT,
          { modelName: message.modelName, error },
        );
        throw error;
      }
    });

    this.logger.log('Model training consumer started', this.CONTEXT);
  }
}

