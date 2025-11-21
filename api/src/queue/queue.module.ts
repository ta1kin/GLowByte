import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { DataImportConsumer } from './consumers/data-import.consumer';
import { PredictionConsumer } from './consumers/prediction.consumer';
import { ModelTrainingConsumer } from './consumers/model-training.consumer';
import { DataImportProcessor } from './consumers/processors/data-import.processor';
import { PredictionProcessor } from './consumers/processors/prediction.processor';
import { ModelTrainingProcessor } from './consumers/processors/model-training.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { DataModule } from '../data/data.module';
import { PredictionModule } from '../prediction/prediction.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, DataModule, PredictionModule, NotificationModule],
  providers: [
    QueueService,
    // Consumers
    DataImportConsumer,
    PredictionConsumer,
    ModelTrainingConsumer,
    // Processors
    DataImportProcessor,
    PredictionProcessor,
    ModelTrainingProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}
