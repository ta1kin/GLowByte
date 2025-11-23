import { Module } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { LoggerModule } from '../common/logger/logger.module'
import { AnalyticsController } from './analytics.controller'
import { AnalyticsService } from './analytics.service'

@Module({
	imports: [PrismaModule, LoggerModule],
	controllers: [AnalyticsController],
	providers: [AnalyticsService],
	exports: [AnalyticsService],
})
export class AnalyticsModule {}
