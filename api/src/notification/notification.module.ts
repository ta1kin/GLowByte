import { Module } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { LoggerModule } from '../common/logger/logger.module'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'

@Module({
	imports: [PrismaModule, LoggerModule],
	controllers: [NotificationController],
	providers: [NotificationService],
	exports: [NotificationService],
})
export class NotificationModule {}
