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
    // Single prediction consumer
    await this.queueService.consume('prediction.calculate', async (message, msg) => {
      this.logger.log(
        `Processing prediction: shtabel ${message.shtabelId}`,
        this.CONTEXT,
        { shtabelId: message.shtabelId },
      );

      try {
        await this.predictionProcessor.processPrediction(message.shtabelId);
        this.logger.log(
          `Prediction completed: shtabel ${message.shtabelId}`,
          this.CONTEXT,
        );
      } catch (error) {
        this.logger.error(
          `Prediction failed: shtabel ${message.shtabelId}`,
          error.stack,
          this.CONTEXT,
          { shtabelId: message.shtabelId, error },
        );
        throw error;
      }
    });

    // Batch prediction consumer
    await this.queueService.consume('prediction.batch', async (message, msg) => {
      this.logger.log(
        `Processing batch prediction: ${message.shtabelIds?.length || 0} stockpiles`,
        this.CONTEXT,
        { count: message.shtabelIds?.length },
      );

      try {
        await this.predictionProcessor.processBatchPredictions(
          message.shtabelIds || [],
        );
        this.logger.log('Batch prediction completed', this.CONTEXT);
      } catch (error) {
        this.logger.error(
          'Batch prediction failed',
          error.stack,
          this.CONTEXT,
          { error },
        );
        throw error;
      }
    });

    this.logger.log('Prediction consumers started', this.CONTEXT);
  }
}

