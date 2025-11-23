import { Module, forwardRef } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { DataModule } from '../data/data.module'
import { NotificationModule } from '../notification/notification.module'
import { PredictionModule } from '../prediction/prediction.module'
import { DataImportConsumer } from './consumers/data-import.consumer'
import { ModelTrainingConsumer } from './consumers/model-training.consumer'
import { PredictionConsumer } from './consumers/prediction.consumer'
import { DataImportProcessor } from './consumers/processors/data-import.processor'
import { ModelTrainingProcessor } from './consumers/processors/model-training.processor'
import { PredictionProcessor } from './consumers/processors/prediction.processor'
import { QueueService } from './queue.service'

@Module({
	imports: [
		PrismaModule,
		forwardRef(() => DataModule),
		forwardRef(() => PredictionModule),
		NotificationModule,
	],
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
