# Coal Fire Predictor - Система прогнозирования самовозгорания угля

Веб-приложение для прогнозирования самовозгорания угля при открытом хранении на складах.

## Архитектура

- **Backend API**: NestJS + TypeScript + PostgreSQL + Prisma
- **Telegram Bot**: NestJS + Telegraf
- **ML Service**: Python + FastAPI
- **Frontend**: React (Telegram Mini App) - будет добавлен позже
- **Инфраструктура**: Docker, Docker Compose, RabbitMQ, Redis, Nginx

## Структура проекта

```
GlowByte/
├── api/                    # NestJS Backend API
│   ├── src/
│   │   ├── auth/          # Аутентификация
│   │   ├── user/          # Управление пользователями
│   │   ├── data/          # Импорт данных (CSV)
│   │   ├── stockpile/     # Управление штабелями
│   │   ├── prediction/    # Прогнозы самовозгорания
│   │   ├── analytics/     # Аналитика и метрики
│   │   ├── notification/  # Уведомления
│   │   ├── queue/         # RabbitMQ интеграция
│   │   ├── redis/         # Redis интеграция
│   │   └── prisma/        # Prisma ORM
│   └── prisma/
│       └── schema.prisma  # Схема базы данных
│
├── bot/                    # Telegram Bot
│   └── src/
│       └── bot/           # Логика бота
│
├── ml-service/            # ML Service (Python)
│   └── src/
│       └── main.py        # FastAPI приложение
│
└── docker-compose.yml     # Docker конфигурация
```

## Быстрый старт

### Предварительные требования

- Docker и Docker Compose
- Node.js 20+ (для локальной разработки)
- Python 3.11+ (для локальной разработки ML сервиса)

### Установка и запуск

1. **Клонируйте репозиторий** (если еще не сделано)

2. **Настройте переменные окружения**

   Создайте файлы `.env` в директориях `api/`, `bot/` и `ml-service/` на основе `.env.example`

   Основные переменные:
   ```env
   # API
   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/coalfire
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
   REDIS_HOST=redis
   ML_SERVICE_URL=http://ml-service:8000
   ```

3. **Запустите через Docker Compose**

   ```bash
   docker-compose up -d
   ```

4. **Инициализируйте базу данных**

   ```bash
   # Войдите в контейнер API
   docker exec -it coalfire-api sh

   # Выполните миграции Prisma
   bunx prisma migrate dev
   bunx prisma generate
   ```

5. **Проверьте работу сервисов**

   - API: http://localhost:3000
   - API Docs (Swagger): http://localhost:3000/api/docs
   - ML Service: http://localhost:8000
   - ML Service Health: http://localhost:8000/health
   - RabbitMQ Management: http://localhost:15672 (guest/guest)
   - Bot: работает на порту 9000

## Разработка

### Локальная разработка API

```bash
cd api
bun install
bunx prisma generate
bunx prisma migrate dev
bun run start:dev
```

### Локальная разработка Bot

```bash
cd bot
bun install
bun run start:dev
```

### Локальная разработка ML Service

```bash
cd ml-service
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

## Основные модули API

### Auth Module
- Аутентификация через Telegram ID
- Автоматическое создание пользователей
- Управление сессиями

### Data Module
- Импорт CSV файлов (supplies, fires, temperature, weather)
- Валидация и обработка данных
- Асинхронная обработка через RabbitMQ

### Stockpile Module
- Управление штабелями
- История температуры
- Текущее состояние штабелей

### Prediction Module
- Создание прогнозов самовозгорания
- Интеграция с ML Service
- Массовый расчет прогнозов

### Analytics Module
- Метрики качества модели
- Статистика точности прогнозов
- Dashboard статистика

### Notification Module
- Уведомления пользователям
- Интеграция с Telegram Bot
- Управление статусами уведомлений

## База данных

Схема базы данных определена в `api/prisma/schema.prisma`.

Основные сущности:
- **User** - пользователи системы
- **Sklad** - склады
- **Shtabel** - штабели угля
- **Supply** - данные о поставках
- **FireRecord** - записи о самовозгораниях
- **TempRecord** - температурные измерения
- **Weather** - метеоданные
- **Prediction** - прогнозы самовозгорания
- **ModelArtifact** - артефакты ML моделей
- **Metric** - метрики производительности моделей
- **Notification** - уведомления

## API Endpoints

### Auth
- `POST /auth/login` - Вход через Telegram ID
- `POST /auth/check` - Проверка аутентификации

### Data
- `POST /data/upload` - Загрузка CSV файла
- `GET /data/uploads` - Список загрузок
- `GET /data/uploads/:id` - Детали загрузки

### Stockpiles
- `GET /stockpiles` - Список штабелей
- `GET /stockpiles/:id` - Детали штабеля
- `GET /stockpiles/:id/temperature` - История температуры

### Predictions
- `GET /predictions` - Список прогнозов
- `GET /predictions/:id` - Детали прогноза
- `POST /predictions/:shtabelId` - Создать прогноз
- `POST /predictions/batch/calculate` - Массовый расчет

### Analytics
- `GET /analytics/metrics` - Метрики модели
- `GET /analytics/accuracy` - Точность прогнозов
- `GET /analytics/dashboard` - Статистика для dashboard

### Notifications
- `GET /notifications` - Список уведомлений
- `PUT /notifications/:id/read` - Отметить как прочитанное

Полная документация API доступна по адресу: http://localhost:3000/api/docs

## ML Service

FastAPI сервис для машинного обучения.

Endpoints:
- `POST /predict` - Прогноз для одного штабеля
- `POST /predict/batch` - Массовый прогноз
- `GET /metrics` - Метрики модели
- `GET /health` - Health check

## Telegram Bot

Бот для Telegram с интеграцией Mini App.

Команды:
- `/start` - Главное меню
- Кнопки для навигации по приложению
- Уведомления о критических рисках

## Следующие шаги

1. Реализовать обработку CSV файлов
2. Реализовать ML модель прогнозирования
3. Добавить frontend (React Telegram Mini App)
4. Настроить Nginx для production
5. Добавить тесты
6. Настроить CI/CD

## Лицензия

UNLICENSED
