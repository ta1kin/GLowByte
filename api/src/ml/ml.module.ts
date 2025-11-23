import { Module, forwardRef } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { LoggerModule } from '../common/logger/logger.module'
import { QueueModule } from '../queue/queue.module'
import { MlController } from './ml.controller'
import { MlService } from './ml.service'

@Module({
	imports: [PrismaModule, forwardRef(() => QueueModule), LoggerModule],
	controllers: [MlController],
	providers: [MlService],
	exports: [MlService],
})
export class MlModule {}
