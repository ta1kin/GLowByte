# Руководство по тестированию системы

Подробное пошаговое руководство по настройке и тестированию всей системы Coal Fire Predictor.

## Предварительные требования

- Docker и Docker Compose установлены
- Git установлен
- Терминал/командная строка

## Шаг 1: Проверка структуры проекта

Убедитесь, что структура проекта следующая:

```
GlowByte/
├── api/
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
├── bot/
│   ├── .env.example
│   ├── Dockerfile
│   └── src/
├── ml-service/
│   ├── .env.example
│   ├── Dockerfile
│   ├── requirements.txt
│   └── src/
├── docker-compose.yml
└── README.md
```

## Шаг 2: Настройка переменных окружения

### 2.1. API (.env)

Создайте файл `api/.env` на основе `api/.env.example`:

```bash
cd api
cp .env.example .env
```

Отредактируйте `api/.env`:

```env
# База данных
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/coalfire?schema=public

# Приложение
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# ML Service
ML_SERVICE_URL=http://ml-service:8000

# CORS
CORS_ORIGIN=http://localhost:5173

# Загрузка файлов
UPLOADS_DIR=./uploads

# Логирование
LOG_LEVEL=debug
```

### 2.2. Bot (.env)

Создайте файл `bot/.env`:

```bash
cd ../bot
cp .env.example .env
```

Отредактируйте `bot/.env`:

```env
# Приложение
NODE_ENV=development
PORT=9000

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here

# API
API_URL=http://api:3000

# Frontend (Telegram Mini App)
CLIENT_URL=http://localhost:5173
```

**Важно:** Замените `your_bot_token_here` на реальный токен бота от @BotFather в Telegram.

### 2.3. ML Service (.env)

Создайте файл `ml-service/.env`:

```bash
cd ../ml-service
cp .env.example .env
```

Отредактируйте `ml-service/.env`:

```env
# База данных
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/coalfire

# Модели ML
MODEL_PATH=./models
MODEL_VERSION=1.0.0

# API
API_URL=http://api:3000

# Приложение
ENVIRONMENT=development
```

## Шаг 3: Запуск инфраструктуры через Docker Compose

### 3.1. Запуск всех сервисов

Из корневой директории проекта:

```bash
cd C:\Users\Admin\Documents\projects\GlowByte
docker-compose up -d
```

Эта команда запустит:
- PostgreSQL (порт 5432)
- Redis (порт 6379)
- RabbitMQ (порты 5672, 15672)
- API (порт 3000)
- Bot (порт 9000)
- ML Service (порт 8000)

### 3.2. Проверка статуса сервисов

```bash
docker-compose ps
```

Все сервисы должны быть в статусе `Up` или `Up (healthy)`.

### 3.3. Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f api
docker-compose logs -f ml-service
docker-compose logs -f bot
```

## Шаг 4: Инициализация базы данных

### 4.1. Вход в контейнер API

```bash
docker exec -it coalfire-api sh
```

### 4.2. Генерация Prisma Client

```bash
bunx prisma generate
```

### 4.3. Создание миграций

```bash
bunx prisma migrate dev --name init
```

Эта команда:
- Создаст все таблицы в базе данных
- Применит миграции
- Создаст файлы миграций в `api/prisma/migrations/`

### 4.4. Проверка базы данных

```bash
bunx prisma studio
```

Prisma Studio откроется в браузере на `http://localhost:5555`. Вы сможете просмотреть все таблицы.

**Выйдите из Prisma Studio (Ctrl+C) и из контейнера (exit)**

## Шаг 5: Проверка работы сервисов

### 5.1. Проверка API

Откройте в браузере:
- **Swagger документация**: http://localhost:3000/api/docs
- **Health check**: http://localhost:3000/health (если есть endpoint)

Или через curl:

```bash
curl http://localhost:3000/api/docs
```

### 5.2. Проверка ML Service

```bash
curl http://localhost:8000/health
```

Ожидаемый ответ:
```json
{
  "status": "healthy",
  "service": "ml-service",
  "version": "1.0.0",
  "database": "connected",
  "model": {
    "status": "not_loaded",
    "info": null
  }
}
```

### 5.3. Проверка RabbitMQ Management

Откройте в браузере: http://localhost:15672

- **Логин**: `guest`
- **Пароль**: `guest`

Проверьте:
- Queues должны быть созданы: `data.import`, `prediction.calculate`, `prediction.batch`, `model.train`
- Dead Letter Queues: `data.import.failed`, `prediction.calculate.failed`, и т.д.

## Шаг 6: Тестирование API Endpoints

### 6.1. Использование Swagger UI

Откройте http://localhost:3000/api/docs и протестируйте endpoints:

#### 6.1.1. Auth - Login

```json
POST /auth/login
{
  "telegramId": "123456789",
  "userData": {
    "first_name": "Test",
    "last_name": "User",
    "username": "testuser"
  }
}
```

#### 6.1.2. Data - Upload CSV

**Важно:** Для этого нужен реальный CSV файл. Пока можно пропустить.

#### 6.1.3. Stockpiles - Get All

```
GET /stockpiles
```

Должен вернуть пустой массив (если нет данных).

#### 6.1.4. Stockpiles - Create Sklad

```json
POST /stockpiles/sklads
{
  "number": 1,
  "name": "Склад №1",
  "locationRaw": "Северная часть территории"
}
```

#### 6.1.5. Stockpiles - Create Stockpile

```json
POST /stockpiles
{
  "skladId": 1,
  "label": "ШТ-001",
  "mark": "A1",
  "height_m": 5.5,
  "width_m": 10.0,
  "length_m": 20.0,
  "mass_t": 1000.0
}
```

#### 6.1.6. Predictions - Create Prediction

```json
POST /predictions
{
  "shtabelId": 1,
  "horizonDays": 7
}
```

Это отправит задачу в RabbitMQ очередь. Проверьте логи API и ML Service.

### 6.2. Тестирование через curl

#### Health Check

```bash
curl http://localhost:3000/health
```

#### Get Sklads

```bash
curl http://localhost:3000/stockpiles/sklads
```

#### Create Sklad

```bash
curl -X POST http://localhost:3000/stockpiles/sklads \
  -H "Content-Type: application/json" \
  -d '{
    "number": 1,
    "name": "Склад №1"
  }'
```

#### Create Stockpile

```bash
curl -X POST http://localhost:3000/stockpiles \
  -H "Content-Type: application/json" \
  -d '{
    "skladId": 1,
    "label": "ШТ-001",
    "mark": "A1",
    "mass_t": 1000.0
  }'
```

#### Create Prediction

```bash
curl -X POST http://localhost:3000/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "shtabelId": 1,
    "horizonDays": 7
  }'
```

## Шаг 7: Тестирование ML Service

### 7.1. Health Check

```bash
curl http://localhost:8000/health
```

### 7.2. Prediction (требует существующий shtabel_id)

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "shtabel_id": 1,
    "horizon_days": 7
  }'
```

### 7.3. Model Info

```bash
curl http://localhost:8000/model/info
```

### 7.4. Train Model (заглушка)

```bash
curl -X POST http://localhost:8000/train \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "xgboost_v1",
    "model_version": "1.0.0",
    "config": {}
  }'
```

## Шаг 8: Проверка RabbitMQ

### 8.1. Через Management UI

1. Откройте http://localhost:15672
2. Войдите (guest/guest)
3. Перейдите в раздел **Queues**
4. Проверьте наличие очередей:
   - `data.import`
   - `prediction.calculate`
   - `prediction.batch`
   - `model.train`
   - И соответствующие `.failed` очереди

### 8.2. Проверка сообщений

После создания прогноза:
1. Перейдите в очередь `prediction.calculate`
2. Проверьте, что сообщение было обработано
3. Если есть ошибки, проверьте очередь `prediction.calculate.failed`

## Шаг 9: Тестирование полного цикла

### 9.1. Создание тестовых данных

1. **Создать склад**:
```bash
POST /stockpiles/sklads
{
  "number": 1,
  "name": "Тестовый склад"
}
```

2. **Создать штабель**:
```bash
POST /stockpiles
{
  "skladId": 1,
  "label": "ТЕСТ-001",
  "mark": "A1",
  "mass_t": 500.0
}
```

3. **Создать прогноз**:
```bash
POST /predictions
{
  "shtabelId": 1,
  "horizonDays": 7
}
```

### 9.2. Проверка результата

1. Проверьте логи API:
```bash
docker-compose logs api | grep -i prediction
```

2. Проверьте логи ML Service:
```bash
docker-compose logs ml-service | grep -i prediction
```

3. Проверьте прогноз в базе:
```bash
GET /predictions?shtabelId=1
```

## Шаг 10: Проверка ошибок и отладка

### 10.1. Проверка логов

```bash
# Все логи
docker-compose logs --tail=100

# Логи с ошибками
docker-compose logs | grep -i error

# Логи конкретного сервиса
docker-compose logs api --tail=50
```

### 10.2. Проверка подключений

```bash
# Проверка подключения к БД из API
docker exec -it coalfire-api sh
bunx prisma studio
```

### 10.3. Перезапуск сервисов

Если что-то не работает:

```bash
# Перезапуск конкретного сервиса
docker-compose restart api

# Перезапуск всех сервисов
docker-compose restart

# Полная перезагрузка
docker-compose down
docker-compose up -d
```

## Шаг 11: Тестирование с реальными данными (опционально)

### 11.1. Подготовка CSV файлов

Создайте тестовые CSV файлы в формате:

**supplies.csv**:
```csv
Склад,Штабель,ВыгрузкаНаСклад,Наим. ЕТСНГ,ПогрузкаНаСудно,На склад, тн,На судно, тн
1,ШТ-001,2024-01-15,A1,2024-02-01,1000,500
```

**temperature.csv**:
```csv
Склад,Штабель,Марка,Макс. температура,Пикет,Дата акта,Смена
1,ШТ-001,A1,45.5,П-1,2024-01-20,1
```

### 11.2. Загрузка через API

Используйте Swagger UI или curl для загрузки файлов.

## Типичные проблемы и решения

### Проблема: API не запускается

**Решение:**
1. Проверьте логи: `docker-compose logs api`
2. Убедитесь, что БД доступна: `docker-compose ps postgres`
3. Проверьте переменные окружения в `api/.env`

### Проблема: Prisma миграции не применяются

**Решение:**
1. Убедитесь, что DATABASE_URL правильный
2. Проверьте, что PostgreSQL запущен: `docker-compose ps postgres`
3. Попробуйте: `bunx prisma migrate reset` (осторожно: удалит данные)

### Проблема: ML Service не подключается к БД

**Решение:**
1. Проверьте `ml-service/.env` - DATABASE_URL должен указывать на `postgres:5432`
2. Проверьте логи: `docker-compose logs ml-service`

### Проблема: RabbitMQ очереди не создаются

**Решение:**
1. Проверьте, что RabbitMQ запущен: `docker-compose ps rabbitmq`
2. Проверьте логи API: `docker-compose logs api | grep -i rabbit`
3. Перезапустите API: `docker-compose restart api`

## Следующие шаги

После успешного тестирования:

1. ✅ Интегрировать реальную модель в ML Service
2. ✅ Настроить production окружение
3. ✅ Добавить мониторинг и алертинг
4. ✅ Написать тесты
5. ✅ Настроить CI/CD

## Полезные команды

```bash
# Остановить все сервисы
docker-compose down

# Остановить и удалить volumes (осторожно!)
docker-compose down -v

# Пересобрать образы
docker-compose build --no-cache

# Просмотр использования ресурсов
docker stats

# Очистка неиспользуемых ресурсов
docker system prune -a
```

