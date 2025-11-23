# Команды для тестирования

Быстрая шпаргалка с командами для тестирования системы.

## Запуск и остановка

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка всех сервисов
docker-compose down

# Перезапуск конкретного сервиса
docker-compose restart api
docker-compose restart ml-service
docker-compose restart bot

# Просмотр статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
docker-compose logs -f api
docker-compose logs -f ml-service
```

## База данных

```bash
# Вход в контейнер API
docker exec -it coalfire-api sh

# Генерация Prisma Client
bunx prisma generate

# Создание миграций
bunx prisma migrate dev --name init

# Применение миграций
bunx prisma migrate deploy

# Открыть Prisma Studio
bunx prisma studio

# Сброс базы данных (осторожно!)
bunx prisma migrate reset
```

## Проверка сервисов

### API

```bash
# Health check
curl http://localhost:3000/health

# Swagger документация
# Откройте в браузере: http://localhost:3000/api/docs
```

### ML Service

```bash
# Health check
curl http://localhost:8000/health

# Model info
curl http://localhost:8000/model/info

# Prediction (требует существующий shtabel_id)
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"shtabel_id": 1, "horizon_days": 7}'
```

### RabbitMQ

```bash
# Management UI
# Откройте в браузере: http://localhost:15672
# Логин: guest, Пароль: guest
```

## Тестирование API через curl

### Создание склада

```bash
curl -X POST http://localhost:3000/stockpiles/sklads \
  -H "Content-Type: application/json" \
  -d '{
    "number": 1,
    "name": "Тестовый склад"
  }'
```

### Создание штабеля

```bash
curl -X POST http://localhost:3000/stockpiles \
  -H "Content-Type: application/json" \
  -d '{
    "skladId": 1,
    "label": "ТЕСТ-001",
    "mark": "A1",
    "mass_t": 500.0
  }'
```

### Создание прогноза

```bash
curl -X POST http://localhost:3000/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "shtabelId": 1,
    "horizonDays": 7
  }'
```

### Получение прогнозов

```bash
curl "http://localhost:3000/predictions?shtabelId=1"
```

## Отладка

```bash
# Просмотр логов с ошибками
docker-compose logs | grep -i error

# Просмотр последних 100 строк логов
docker-compose logs --tail=100

# Просмотр логов конкретного сервиса
docker-compose logs api --tail=50

# Пересборка образов
docker-compose build --no-cache

# Очистка неиспользуемых ресурсов
docker system prune -a
```

## Проверка подключений

```bash
# Проверка подключения к PostgreSQL
docker exec -it coalfire-postgres psql -U postgres -d coalfire -c "SELECT 1;"

# Проверка подключения к Redis
docker exec -it coalfire-redis redis-cli ping

# Проверка подключения к RabbitMQ
docker exec -it coalfire-rabbitmq rabbitmq-diagnostics ping
```

## Полезные команды Docker

```bash
# Просмотр использования ресурсов
docker stats

# Просмотр информации о контейнере
docker inspect coalfire-api

# Выполнение команды в контейнере
docker exec -it coalfire-api sh

# Копирование файла из контейнера
docker cp coalfire-api:/app/file.txt ./file.txt

# Копирование файла в контейнер
docker cp ./file.txt coalfire-api:/app/file.txt
```

