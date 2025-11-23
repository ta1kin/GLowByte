# Примеры использования RabbitMQ

## Пример 1: Полный цикл импорта данных

```typescript
// ===== API Controller =====
@Post('upload')
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  // 1. Сохраняем файл
  const filename = `${Date.now()}_${file.originalname}`;
  fs.writeFileSync(`./uploads/${filename}`, file.buffer);

  // 2. Создаем запись в БД
  const upload = await this.dataService.createUpload(
    filename,
    'SUPPLIES'
  );

  // 3. API сразу возвращает ответ (не ждет обработки!)
  return upload; // { success: true, data: { id: 123, status: 'PENDING' } }
}

// ===== DataService =====
async createUpload(filename: string, fileType: FileType) {
  const upload = await this.prisma.upload.create({
    data: {
      filename,
      fileType,
      status: 'PENDING',
      rowsTotal: null,
      rowsProcessed: null,
    },
  });

  // Публикуем в очередь
  await this.queueService.publish('data.import', {
    uploadId: upload.id,
    filename,
    fileType,
  });

  return successResponse(upload, 'Upload queued for processing');
}

// ===== Consumer (автоматически запускается) =====
// DataImportConsumer.onModuleInit()
await this.queueService.consume('data.import', async (message, msg) => {
  await this.dataImportProcessor.processImport(
    message.uploadId,
    message.filename,
    message.fileType
  );
});

// ===== Processor =====
async processImport(uploadId: number, filename: string, fileType: FileType) {
  // 1. Обновляем статус
  await this.prisma.upload.update({
    where: { id: uploadId },
    data: { status: 'PROCESSING' },
  });

  // 2. Читаем файл
  const filePath = `./uploads/${filename}`;
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, { columns: true });

  // 3. Обрабатываем каждую строку
  let processed = 0;
  let failed = 0;

  for (const record of records) {
    try {
      await this.suppliesService.processRecord(record);
      processed++;
    } catch (error) {
      failed++;
      this.logger.warn('Failed to process record', 'DataImportProcessor', {
        record,
        error: error.message,
      });
    }
  }

  // 4. Обновляем финальный статус
  const status = failed === 0 ? 'COMPLETED' : 'PARTIAL';
  await this.prisma.upload.update({
    where: { id: uploadId },
    data: {
      status,
      rowsTotal: records.length,
      rowsProcessed: processed,
      rowsFailed: failed,
    },
  });
}
```

**Результат:**

- Пользователь получает ответ за ~100ms
- Обработка 10,000 строк происходит в фоне за ~30 секунд
- Пользователь может проверить статус: `GET /data/uploads/123`

---

## Пример 2: Прогноз с уведомлениями

```typescript
// ===== Пользователь запрашивает прогноз =====
POST /predictions/456
// Response: { success: true, data: { shtabelId: 456, queued: true } }

// ===== PredictionService =====
async createPrediction(shtabelId: number) {
  // Проверяем существование
  const stockpile = await this.prisma.shtabel.findUnique({
    where: { id: shtabelId },
  });

  if (!stockpile) {
    return errorResponse('Stockpile not found');
  }

  // Публикуем в очередь
  await this.queueService.publish('prediction.calculate', {
    shtabelId,
  });

  return successResponse(
    { shtabelId, queued: true },
    'Prediction queued'
  );
}

// ===== Consumer обрабатывает =====
await this.queueService.consume('prediction.calculate', async (message) => {
  const { shtabelId } = message;

  // 1. Получаем данные штабеля
  const stockpile = await this.prisma.shtabel.findUnique({
    where: { id: shtabelId },
    include: {
      temps: { orderBy: { recordDate: 'desc' }, take: 10 },
      supplies: { orderBy: { dateIn: 'desc' } },
    },
  });

  // 2. Вызываем ML Service
  const prediction = await this.mlService.predict(shtabelId);
  // Response: {
  //   model_name: 'xgboost_v1',
  //   risk_level: 'CRITICAL',
  //   predicted_date: '2024-01-15T10:00:00Z',
  //   confidence: 0.95
  // }

  // 3. Сохраняем прогноз
  const saved = await this.prisma.prediction.create({
    data: {
      ts: new Date(),
      skladId: stockpile.skladId,
      shtabelId,
      modelName: prediction.model_name,
      riskLevel: prediction.risk_level,
      predictedDate: new Date(prediction.predicted_date),
      confidence: prediction.confidence,
    },
  });

  // 4. Если критический риск → уведомления
  if (prediction.risk_level === 'CRITICAL') {
    const users = await this.prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        userSettings: { notifyCritical: true },
      },
    });

    for (const user of users) {
      // Создаем уведомление
      await this.notificationService.createNotification({
        userId: user.id,
        type: 'CRITICAL_RISK',
        title: '🚨 Критический риск возгорания',
        message: `Штабель #${shtabelId} имеет критический риск`,
        predictionId: saved.id,
        shtabelId,
      });

      // Отправляем в Telegram (через Bot Service)
      await this.botService.notifyUser(
        user.telegramId,
        `🚨 КРИТИЧЕСКИЙ РИСК!\n\nШтабель #${shtabelId} может загореться ${prediction.predicted_date}`
      );
    }
  }
});
```

---

## Пример 3: Обучение модели

```typescript
// ===== Администратор запускает обучение =====
POST /ml/train
Body: {
  "modelName": "xgboost_v1",
  "modelVersion": "2.0.0",
  "config": {
    "n_estimators": 200,
    "max_depth": 8,
    "learning_rate": 0.05
  }
}

// ===== MlService =====
async trainModel(modelName: string, modelVersion: string, config?: any) {
  // Публикуем в очередь
  await this.queueService.publish('model.train', {
    modelName,
    modelVersion,
    config: config || {},
  });

  return successResponse(
    { modelName, modelVersion, queued: true },
    'Model training queued'
  );
}

// ===== Consumer обрабатывает (может занять часы!) =====
await this.queueService.consume('model.train', async (message) => {
  const { modelName, modelVersion, config } = message;

  // 1. Создаем/обновляем запись модели
  let model = await this.prisma.modelArtifact.findFirst({
    where: { name: modelName, version: modelVersion },
  });

  if (!model) {
    model = await this.prisma.modelArtifact.create({
      data: {
        name: modelName,
        version: modelVersion,
        status: 'TRAINING',
        path: '',
        trainingData: config,
      },
    });
  } else {
    model = await this.prisma.modelArtifact.update({
      where: { id: model.id },
      data: { status: 'TRAINING' },
    });
  }

  // 2. Вызываем ML Service (долгая операция!)
  const response = await axios.post(
    `${ML_SERVICE_URL}/train`,
    {
      model_name: modelName,
      model_version: modelVersion,
      config,
    },
    { timeout: 7200000 } // 2 часа
  );

  // 3. Сохраняем результаты
  await this.prisma.modelArtifact.update({
    where: { id: model.id },
    data: {
      status: response.data.success ? 'ACTIVE' : 'FAILED',
      path: response.data.model_path,
      trainedAt: new Date(),
      trainMetrics: response.data.train_metrics,
      valMetrics: response.data.val_metrics,
      testMetrics: response.data.test_metrics,
    },
  });

  // 4. Сохраняем метрики
  await this.prisma.metric.create({
    data: {
      modelName,
      modelVersion,
      periodStart: new Date(response.data.metrics.period_start),
      periodEnd: new Date(response.data.metrics.period_end),
      accuracy_within_2d: response.data.metrics.accuracy_within_2d,
      mae_days: response.data.metrics.mae_days,
      // ... другие метрики
    },
  });
});
```

---

## Пример 4: Обработка ошибок и Retry

```typescript
// ===== Consumer с обработкой ошибок =====
await this.queueService.consume('data.import', async (message, msg) => {
  try {
    await this.processor.processImport(message.uploadId, ...);
    // Успешно → ACK
    this.channel.ack(msg);
  } catch (error) {
    const retryCount = msg.properties.headers?.['x-retry-count'] || 0;

    this.logger.error('Processing failed', error.stack, 'Consumer', {
      uploadId: message.uploadId,
      retryCount,
      error: error.message,
    });

    if (retryCount < 3) {
      // Попытка 1, 2, 3 → возвращаем в очередь
      this.logger.warn(`Retrying (${retryCount + 1}/3)`, 'Consumer');

      // Обновляем headers
      const headers = {
        ...msg.properties.headers,
        'x-retry-count': retryCount + 1,
      };

      // Публикуем обратно в очередь
      this.channel.publish(
        'coalfire',
        'data.import',
        msg.content,
        { headers, persistent: true }
      );

      // Подтверждаем оригинальное сообщение
      this.channel.ack(msg);
    } else {
      // После 3 попыток → в DLQ
      this.logger.error('Max retries reached, sending to DLQ', 'Consumer');

      // Обновляем статус в БД
      await this.prisma.upload.update({
        where: { id: message.uploadId },
        data: {
          status: 'FAILED',
          errors: {
            error: error.message,
            stack: error.stack,
            retries: retryCount,
          },
        },
      });

      // Отправляем в DLQ
      this.channel.nack(msg, false, false);
    }
  }
});
```

---

## Пример 5: Мониторинг через API

```typescript
// Проверка статуса импорта
GET /data/uploads/123
Response: {
  "success": true,
  "data": {
    "id": 123,
    "status": "PROCESSING",
    "rowsTotal": 10000,
    "rowsProcessed": 5432,
    "rowsFailed": 5,
    "createdAt": "2024-01-10T10:00:00Z"
  }
}

// Проверка статуса модели
GET /ml/models
Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "xgboost_v1",
      "version": "2.0.0",
      "status": "TRAINING",
      "trainedAt": null,
      "createdAt": "2024-01-10T09:00:00Z"
    }
  ]
}

// Проверка последних прогнозов
GET /predictions?shtabelId=456&limit=5
Response: {
  "success": true,
  "data": [
    {
      "id": 789,
      "shtabelId": 456,
      "riskLevel": "CRITICAL",
      "predictedDate": "2024-01-15T10:00:00Z",
      "confidence": 0.95,
      "ts": "2024-01-10T10:00:00Z"
    }
  ]
}
```

---

## Полезные команды для отладки

### Просмотр очередей через RabbitMQ Management

1. Откройте http://localhost:15672
2. Перейдите в раздел "Queues"
3. Выберите очередь (например, `data.import`)
4. Нажмите "Get messages" для просмотра сообщений

### Проверка логов

```bash
# Логи API
docker logs coalfire-api -f

# Логи RabbitMQ
docker logs coalfire-rabbitmq -f

# Поиск ошибок
docker logs coalfire-api | grep ERROR
```

### Очистка очереди (для тестирования)

В RabbitMQ Management UI:

1. Выберите очередь
2. Нажмите "Purge Messages"
3. Все сообщения будут удалены

### Переотправка сообщения из DLQ

1. Откройте DLQ (например, `data.import.failed`)
2. Нажмите "Get messages"
3. Скопируйте содержимое сообщения
4. Перейдите в основную очередь (`data.import`)
5. Нажмите "Publish message"
6. Вставьте содержимое и опубликуйте
