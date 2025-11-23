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

   Создайте файл `.env` в корне проекта с переменными:

   ```env
   # Docker Hub Configuration
   DOCKER_USER=your_dockerhub_username

   # Database Configuration
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=coalfire

   # RabbitMQ Configuration
   RABBITMQ_USER=guest
   RABBITMQ_PASSWORD=guest

   # Telegram Bot Configuration
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

   # Client URL
   CLIENT_URL=http://localhost:5173
   ```

   Также создайте файлы `.env` в директориях `api/`, `bot/` и `ml-service/` на основе `.env.example`

3. **Соберите и загрузите образы на DockerHub** (первый раз)

   **Для PowerShell (Windows):**

   ```powershell
   # Убедитесь, что вы авторизованы в DockerHub
   docker login

   # Соберите и загрузите все образы
   .\build-and-push.ps1 ta1kin77

   # Или загрузите образы по отдельности:
   .\build-and-push-api.ps1 ta1kin77
   .\build-and-push-bot.ps1 ta1kin77
   .\build-and-push-ml-service.ps1 ta1kin77
   ```

   **Для Bash/Linux/WSL:**

   ```bash
   # Убедитесь, что вы авторизованы в DockerHub
   docker login

   # Соберите и загрузите все образы
   ./build-and-push.sh your_dockerhub_username

   # Или загрузите образы по отдельности:
   ./build-and-push-api.sh your_dockerhub_username
   ./build-and-push-bot.sh your_dockerhub_username
   ./build-and-push-ml-service.sh your_dockerhub_username
   ```

4. **Запустите через Docker Compose**

   ```bash
   docker-compose up -d
   ```

5. **Инициализируйте базу данных**

   ```bash
   # Войдите в контейнер API
   docker exec -it coalfire-api sh

   # Выполните миграции Prisma
   bunx prisma migrate dev
   bunx prisma generate
   ```

6. **Проверьте работу сервисов**

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

## Docker Hub - Сборка и загрузка образов

Проект использует образы из DockerHub. Для сборки и загрузки образов используйте скрипты:

### Сборка всех образов

**PowerShell (Windows):**

```powershell
.\build-and-push.ps1 your_dockerhub_username
```

**Bash/Linux/WSL:**

```bash
./build-and-push.sh your_dockerhub_username
```

### Сборка отдельных сервисов

**PowerShell (Windows):**

```powershell
.\build-and-push-api.ps1 your_dockerhub_username
.\build-and-push-bot.ps1 your_dockerhub_username
.\build-and-push-ml-service.ps1 your_dockerhub_username
.\build-and-push-client.ps1 your_dockerhub_username
.\build-and-push-nginx.ps1 your_dockerhub_username
```

**Bash/Linux/WSL:**

```bash
./build-and-push-api.sh your_dockerhub_username
./build-and-push-bot.sh your_dockerhub_username
./build-and-push-ml-service.sh your_dockerhub_username
./build-and-push-nginx.sh your_dockerhub_username
```

### Обновление сервисов после загрузки новых образов

```bash
# Загрузить последние версии образов
docker compose pull

# Перезапустить сервисы
docker compose up -d
```

**Важно:** Перед использованием скриптов убедитесь, что вы авторизованы в DockerHub:

```bash
docker login
```

## Nginx для Production

Проект включает конфигурацию Nginx для production окружения с доменом `vmestedate.ru` и поддержкой Telegram Mini App.

### Установка SSL сертификатов

Поместите SSL сертификаты в директорию `nginx/ssl/`:

- `fullchain.pem` — полный сертификат
- `privkey.pem` — приватный ключ

Подробные инструкции по получению сертификатов (Let's Encrypt) см. в `nginx/README.md`.

### Запуск с Nginx

```bash
# Запуск всех сервисов включая Nginx
docker-compose --profile nginx up -d

# Или только Nginx (если другие сервисы уже запущены)
docker-compose --profile nginx up -d nginx
```

### Сборка и загрузка образа Nginx

```powershell
.\build-and-push-nginx.ps1 your_dockerhub_username
```

Подробнее см. `nginx/README.md`.

## Следующие шаги

3. Добавить frontend (React Telegram Mini App)
4. Добавить тесты
5. Настроить CI/CD

## Лицензия

UNLICENSED
