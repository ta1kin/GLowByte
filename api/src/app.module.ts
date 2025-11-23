import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from '../prisma/prisma.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { LoggerModule } from './common/logger/logger.module'
import { DataModule } from './data/data.module'
import { MlModule } from './ml/ml.module'
import { NotificationModule } from './notification/notification.module'
import { PredictionModule } from './prediction/prediction.module'
import { QueueModule } from './queue/queue.module'
import { RedisModule } from './redis/redis.module'
import { StockpileModule } from './stockpile/stockpile.module'
import { UserModule } from './user/user.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		LoggerModule,
		PrismaModule,
		RedisModule,
		QueueModule,
		AuthModule,
		UserModule,
		DataModule,
		StockpileModule,
		PredictionModule,
		AnalyticsModule,
		NotificationModule,
		MlModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
