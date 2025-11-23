import { Module, forwardRef } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { LoggerModule } from '../common/logger/logger.module'
import { QueueModule } from '../queue/queue.module'
import { DataController } from './data.controller'
import { DataService } from './data.service'
import { FiresService } from './services/fires.service'
import { SuppliesService } from './services/supplies.service'
import { TemperatureService } from './services/temperature.service'
import { WeatherService } from './services/weather.service'

@Module({
	imports: [PrismaModule, forwardRef(() => QueueModule), LoggerModule],
	controllers: [DataController],
	providers: [
		DataService,
		SuppliesService,
		FiresService,
		TemperatureService,
		WeatherService,
	],
	exports: [
		DataService,
		SuppliesService,
		FiresService,
		TemperatureService,
		WeatherService,
	],
})
export class DataModule {}
