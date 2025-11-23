# Переменные окружения

Данный документ описывает все переменные окружения, необходимые для работы системы.

## Структура .env файлов

Проект использует несколько `.env` файлов:
- `.env` (корневой) - для Docker Compose
- `api/.env` - для API сервиса
- `bot/.env` - для Telegram бота
- `ml-service/.env` - для ML сервиса

## Корневой .env (для Docker Compose)

Создайте файл `.env` в корне проекта:

```env
# Docker Hub
DOCKER_USER=your_dockerhub_username

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=coalfire

# RabbitMQ
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=your_secure_password

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Client URL
CLIENT_URL=https://vmestedate.ru
```

### Описание переменных

| Переменная | Описание | Обязательно | Значение по умолчанию |
|------------|----------|-------------|----------------------|
| `DOCKER_USER` | Имя пользователя DockerHub для образов | Да | - |
| `POSTGRES_USER` | Пользователь PostgreSQL | Нет | `postgres` |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL | Да | - |
| `POSTGRES_DB` | Имя базы данных | Нет | `coalfire` |
| `RABBITMQ_USER` | Пользователь RabbitMQ | Нет | `guest` |
| `RABBITMQ_PASSWORD` | Пароль RabbitMQ | Да | - |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота | Да (если используется бот) | - |
| `CLIENT_URL` | URL фронтенда | Нет | `https://vmestedate.ru` |

## api/.env

Создайте файл `api/.env` в директории `api/`:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/coalfire

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# ML Service
ML_SERVICE_URL=http://ml-service:8000
ML_SERVICE_MAX_RETRIES=3
ML_SERVICE_RETRY_DELAY=1000

# Server
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://vmestedate.ru

# File Upload
UPLOADS_DIR=./uploads
```

### Описание переменных

| Переменная | Описание | Обязательно | Значение по умолчанию |
|------------|----------|-------------|----------------------|
| `DATABASE_URL` | URL подключения к PostgreSQL | Да | - |
| `REDIS_HOST` | Хост Redis | Нет | `redis` |
| `REDIS_PORT` | Порт Redis | Нет | `6379` |
| `RABBITMQ_URL` | URL подключения к RabbitMQ | Да | - |
| `ML_SERVICE_URL` | URL ML сервиса | Да | `http://ml-service:8000` |
| `ML_SERVICE_MAX_RETRIES` | Максимум повторных попыток | Нет | `3` |
| `ML_SERVICE_RETRY_DELAY` | Задержка между попытками (мс) | Нет | `1000` |
| `PORT` | Порт API сервера | Нет | `3000` |
| `NODE_ENV` | Окружение | Нет | `production` |
| `CORS_ORIGIN` | Разрешенный источник для CORS | Нет | `http://localhost:5173` |
| `UPLOADS_DIR` | Директория для загрузок | Нет | `./uploads` |

## bot/.env

Создайте файл `bot/.env` в директории `bot/`:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# API
API_URL=http://api:3000

# Client URL
CLIENT_URL=https://vmestedate.ru

# Server
PORT=9000
```

### Описание переменных

| Переменная | Описание | Обязательно | Значение по умолчанию |
|------------|----------|-------------|----------------------|
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота | Да | - |
| `API_URL` | URL API сервиса | Да | `http://api:3000` |
| `CLIENT_URL` | URL фронтенда | Нет | `https://vmestedate.ru` |
| `PORT` | Порт бота | Нет | `9000` |

## ml-service/.env

Создайте файл `ml-service/.env` в директории `ml-service/`:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/coalfire

# Model
MODEL_PATH=./models
MODEL_VERSION=1.0.0

# API
API_URL=http://api:3000

# Environment
ENVIRONMENT=production
```

### Описание переменных

| Переменная | Описание | Обязательно | Значение по умолчанию |
|------------|----------|-------------|----------------------|
| `DATABASE_URL` | URL подключения к PostgreSQL | Да | - |
| `MODEL_PATH` | Путь к директории с моделями | Нет | `./models` |
| `MODEL_VERSION` | Версия модели по умолчанию | Нет | `1.0.0` |
| `API_URL` | URL API сервиса | Нет | `http://localhost:3000` |
| `ENVIRONMENT` | Окружение | Нет | `development` |

## Быстрая настройка

### 1. Скопируйте примеры файлов

```bash
# Корневой .env
cp .env.example .env

# API .env
cp api/.env.example api/.env

# Bot .env (если используется)
cp bot/.env.example bot/.env

# ML Service .env
cp ml-service/.env.example ml-service/.env
```

### 2. Заполните обязательные переменные

**В корневом `.env`:**
- `DOCKER_USER` - ваш DockerHub username
- `POSTGRES_PASSWORD` - надежный пароль для PostgreSQL
- `RABBITMQ_PASSWORD` - надежный пароль для RabbitMQ
- `TELEGRAM_BOT_TOKEN` - токен бота (если используется)

**В `api/.env`:**
- `DATABASE_URL` - должен соответствовать настройкам из корневого `.env`
- `RABBITMQ_URL` - должен соответствовать настройкам из корневого `.env`

**В `bot/.env`:**
- `TELEGRAM_BOT_TOKEN` - тот же токен, что и в корневом `.env`
- `API_URL` - URL API сервиса

**В `ml-service/.env`:**
- `DATABASE_URL` - должен соответствовать настройкам из корневого `.env`

### 3. Для локальной разработки

Если вы запускаете сервисы локально (не через Docker), измените:
- `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/coalfire`
- `RABBITMQ_URL`: `amqp://guest:guest@localhost:5672`
- `ML_SERVICE_URL`: `http://localhost:8000`
- `API_URL`: `http://localhost:3000`
- `REDIS_HOST`: `localhost`

## Безопасность

⚠️ **ВАЖНО:**
- Никогда не коммитьте `.env` файлы в git
- Используйте сильные пароли для production
- Регулярно обновляйте пароли
- Не используйте значения по умолчанию в production

## Проверка переменных

После настройки проверьте, что все переменные установлены:

```bash
# Проверка корневого .env
cat .env

# Проверка API .env
cat api/.env

# Проверка Bot .env
cat bot/.env

# Проверка ML Service .env
cat ml-service/.env
```

