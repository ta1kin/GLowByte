import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exception.filter'
import { setResponseLogger } from './common/helpers/api.response.helper'
import { LoggingInterceptor } from './common/interceptor/all-logging.interceptor'
import { AppLogger } from './common/logger/logger.service'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const appLogger = app.get(AppLogger)
	// Устанавливаем логгер для использования в хелперах
	setResponseLogger(appLogger)

	// CORS configuration
	const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
	app.enableCors({
		origin: corsOrigin.split(','),
		credentials: true,
	})

	// Global validation pipe
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		})
	)

	// Global interceptors and filters
	app.useGlobalInterceptors(new LoggingInterceptor(appLogger))
	app.useGlobalFilters(new AllExceptionsFilter(appLogger))

	// Swagger documentation
	const config = new DocumentBuilder()
		.setTitle('Coal Fire Predictor API')
		.setDescription('API for predicting coal self-ignition in storage yards')
		.setVersion('1.0')
		.addTag('auth', 'Аутентификация')
		.addTag('user', 'Управление пользователями')
		.addTag('data', 'Импорт данных')
		.addTag('stockpiles', 'Управление штабелями')
		.addTag('predictions', 'Прогнозы самовозгорания')
		.addTag('analytics', 'Аналитика и метрики')
		.addTag('notifications', 'Уведомления')
		.addBearerAuth()
		.build()
	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api/docs', app, document)

	const apiPort = parseInt(process.env.PORT || '3000')

	console.log('🔥 Попытка запуска HTTP сервера...')
	await app.listen(apiPort)
	console.log('📡 HTTP сервер слушает порт', apiPort)
	console.log('✅ HTTP сервер успешно запущен')

	appLogger.log(`API сервер запущен на порту ${apiPort}`, 'Bootstrap')
}

// Глобальный захват ошибок
process.on('unhandledRejection', (reason, promise) => {
	console.error('🚨 Unhandled Rejection:', reason)
})

process.on('uncaughtException', error => {
	console.error('🚨 Uncaught Exception:', error)
})

void bootstrap()
