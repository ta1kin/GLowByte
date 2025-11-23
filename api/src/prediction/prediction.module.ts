import { Module, forwardRef } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { LoggerModule } from '../common/logger/logger.module'
import { QueueModule } from '../queue/queue.module'
import { MlService } from './ml.service'
import { PredictionController } from './prediction.controller'
import { PredictionService } from './prediction.service'

@Module({
	imports: [PrismaModule, forwardRef(() => QueueModule), LoggerModule],
	controllers: [PredictionController],
	providers: [PredictionService, MlService],
	exports: [PredictionService, MlService],
})
export class PredictionModule {}
