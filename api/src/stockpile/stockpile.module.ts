import { Module } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { LoggerModule } from '../common/logger/logger.module'
import { StockpileController } from './stockpile.controller'
import { StockpileService } from './stockpile.service'

@Module({
	imports: [PrismaModule, LoggerModule],
	controllers: [StockpileController],
	providers: [StockpileService],
	exports: [StockpileService],
})
export class StockpileModule {}
