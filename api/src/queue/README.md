# RabbitMQ Queue System

Система очередей для асинхронной обработки больших операций: ETL, обучение моделей и прогнозирование.

## Архитектура

### Exchanges
- `coalfire` - основной exchange для маршрутизации сообщений
- `coalfire.dlx` - dead letter exchange для неудачных сообщений

### Queues

#### Основные очереди:
1. **data.import** - обработка импорта CSV файлов
   - Routing key: `data.import`
   - TTL: 1 час
   - DLQ: `data.import.failed`

2. **prediction.calculate** - расчет прогноза для одного штабеля
   - Routing key: `prediction.calculate`
   - TTL: 30 минут
   - DLQ: `prediction.calculate.failed`

3. **prediction.batch** - массовый расчет прогнозов
   - Routing key: `prediction.batch`
   - TTL: 1 час
   - DLQ: `prediction.batch.failed`

4. **model.train** - обучение ML модели
   - Routing key: `model.train`
   - TTL: 2 часа
   - DLQ: `model.train.failed`

## Использование

### Публикация сообщений

```typescript
// Импорт данных
await queueService.publish('data.import', {
  uploadId: 123,
  filename: 'supplies.csv',
  fileType: 'SUPPLIES',
});

// Прогноз для одного штабеля
await queueService.publish('prediction.calculate', {
  shtabelId: 456,
});

// Массовый прогноз
await queueService.publish('prediction.batch', {
  shtabelIds: [1, 2, 3, 4, 5],
});

// Обучение модели
await queueService.publish('model.train', {
  modelName: 'xgboost_v1',
  modelVersion: '2.0.0',
  config: {
    n_estimators: 100,
    max_depth: 6,
  },
});
```

## Consumers

Consumers автоматически запускаются при старте приложения:

- `DataImportConsumer` - обрабатывает импорт CSV
- `PredictionConsumer` - обрабатывает прогнозы
- `ModelTrainingConsumer` - обрабатывает обучение моделей

## Retry механизм

- Максимум 3 попытки повтора
- После 3 неудачных попыток сообщение отправляется в DLQ
- Сообщения в DLQ требуют ручной обработки

## Мониторинг

RabbitMQ Management UI доступен по адресу: http://localhost:15672
- Логин: guest
- Пароль: guest

