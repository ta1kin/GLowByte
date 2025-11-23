# Быстрый старт для тестирования

## 1. Подготовка окружения (5 минут)

### 1.1. Создайте файлы .env

```bash
# В корне проекта
cd C:\Users\Admin\Documents\projects\GlowByte

# API
cd api
copy .env.example .env
# Отредактируйте .env - проверьте DATABASE_URL, RABBITMQ_URL

# Bot
cd ../bot
copy .env.example .env
# Отредактируйте .env - добавьте TELEGRAM_BOT_TOKEN

# ML Service
cd ../ml-service
copy .env.example .env
# Отредактируйте .env - проверьте DATABASE_URL
```

### 1.2. Минимальные настройки .env

**api/.env:**
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/coalfire
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
ML_SERVICE_URL=http://ml-service:8000
PORT=3000
```

**bot/.env:**
```env
TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather
API_URL=http://api:3000
```

**ml-service/.env:**
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/coalfire
```

## 2. Запуск системы (2 минуты)

```bash
# Из корневой директории
cd C:\Users\Admin\Documents\projects\GlowByte

# Запуск всех сервисов
docker-compose up -d

# Проверка статуса
docker-compose ps
```

## 3. Инициализация базы данных (3 минуты)

```bash
# Вход в контейнер API
docker exec -it coalfire-api sh

# Генерация Prisma Client
bunx prisma generate

# Создание миграций
bunx prisma migrate dev --name init

# Выход из контейнера
exit
```

## 4. Проверка работы (2 минуты)

### 4.1. Проверка API

Откройте в браузере:
- http://localhost:3000/health
- http://localhost:3000/api/docs

### 4.2. Проверка ML Service

```bash
curl http://localhost:8000/health
```

### 4.3. Проверка RabbitMQ

Откройте: http://localhost:15672
- Логин: `guest`
- Пароль: `guest`

## 5. Быстрый тест (5 минут)

### 5.1. Создайте склад через Swagger

1. Откройте http://localhost:3000/api/docs
2. Найдите `POST /stockpiles/sklads`
3. Нажмите "Try it out"
4. Вставьте:
```json
{
  "number": 1,
  "name": "Тестовый склад"
}
```
5. Нажмите "Execute"

### 5.2. Создайте штабель

1. Найдите `POST /stockpiles`
2. Вставьте:
```json
{
  "skladId": 1,
  "label": "ТЕСТ-001",
  "mark": "A1",
  "mass_t": 500.0
}
```

### 5.3. Создайте прогноз

1. Найдите `POST /predictions`
2. Вставьте:
```json
{
  "shtabelId": 1,
  "horizonDays": 7
}
```

### 5.4. Проверьте результат

1. Найдите `GET /predictions`
2. Добавьте query параметр: `shtabelId=1`
3. Выполните запрос

## 6. Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Логи API
docker-compose logs -f api

# Логи ML Service
docker-compose logs -f ml-service
```

## Готово! 🎉

Если все работает, переходите к подробному руководству: `TESTING_GUIDE.md`

