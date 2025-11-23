"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const all_exception_filter_1 = require("./common/filters/all-exception.filter");
const api_response_helper_1 = require("./common/helpers/api.response.helper");
const all_logging_interceptor_1 = require("./common/interceptor/all-logging.interceptor");
const logger_service_1 = require("./common/logger/logger.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const appLogger = app.get(logger_service_1.AppLogger);
    (0, api_response_helper_1.setResponseLogger)(appLogger);
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
    app.enableCors({
        origin: corsOrigin.split(','),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalInterceptors(new all_logging_interceptor_1.LoggingInterceptor(appLogger));
    app.useGlobalFilters(new all_exception_filter_1.AllExceptionsFilter(appLogger));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Coal Fire Predictor API')
        .setDescription('API for predicting coal self-ignition in storage yards')
        .setVersion('1.0')
        .addTag('System', 'Системные endpoints')
        .addTag('auth', 'Аутентификация')
        .addTag('user', 'Управление пользователями')
        .addTag('data', 'Импорт данных')
        .addTag('stockpiles', 'Управление штабелями')
        .addTag('predictions', 'Прогнозы самовозгорания')
        .addTag('analytics', 'Аналитика и метрики')
        .addTag('notifications', 'Уведомления')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const apiPort = parseInt(process.env.PORT || '3000');
    console.log('🔥 Попытка запуска HTTP сервера...');
    await app.listen(apiPort);
    console.log('📡 HTTP сервер слушает порт', apiPort);
    console.log('✅ HTTP сервер успешно запущен');
    appLogger.log(`API сервер запущен на порту ${apiPort}`, 'Bootstrap');
}
process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection:', reason);
});
process.on('uncaughtException', error => {
    console.error('🚨 Uncaught Exception:', error);
});
void bootstrap();
//# sourceMappingURL=main.js.map