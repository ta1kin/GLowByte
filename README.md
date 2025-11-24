# Coal Fire Predictor - Система прогнозирования самовозгорания угля

Комплексная система для прогнозирования самовозгорания угля при открытом хранении на складах. Использует машинное обучение (XGBoost) для анализа температурных данных, метеорологических условий и исторических данных о возгораниях.

## 🌐 Информация о развертывании

- **Production сервер**: `62.181.44.52`
- **Домен**: `vmeste-date.ru`
- **Telegram бот**: `@Ta1_devBot`
- **ML Service**: `http://62.181.44.52:8000`

---

## 🚀 Быстрый старт

### Через Production сервер

1. **Откройте API документацию**: https://vmeste-date.ru/api/docs
2. **Или используйте Telegram бот**: [@Ta1_devBot](https://t.me/Ta1_devBot)

### Основные операции

- **Загрузка данных**: `POST /api/data/upload`
- **Создание прогноза**: `POST /api/predictions`
- **Просмотр прогнозов**: `GET /api/predictions`
- **Метрики модели**: `GET /api/analytics/metrics`

---

## 📖 Сценарии использования

### Сценарий 1: Загрузка данных из CSV файлов

**Цель**: Импортировать исторические данные в систему

#### Вариант А: Через curl

```bash
curl -X POST "https://vmeste-date.ru/api/data/upload" \
  -F "file=@fires.csv" \
  -F "fileType=FIRES"
```

#### Вариант В: Через PowerShell скрипт

```powershell
# Используйте скрипт upload-training-data.ps1
.\upload-training-data.ps1 -File "fires.csv" -FileType "FIRES" -ApiUrl "https://vmeste-date.ru"
```

**Формат CSV файлов**:

- `fires.csv`: Склад, Штабель, Дата начала, Груз
- `supplies.csv`: Склад, Штабель, ВыгрузкаНаСклад, Наим. ЕТСНГ
- `temperature.csv`: Склад, Штабель, Дата акта, Максимальная температура
- `weather_data_*.csv`: date, temp_air, humidity, precip

---

### Сценарий 2: Создание прогноза для штабеля

**Цель**: Получить прогноз риска самовозгорания для конкретного штабеля


```bash
curl -X POST "https://vmeste-date.ru/api/predictions" \
  -H "Content-Type: application/json" \
  -d '{
    "shtabelId": 1,
    "horizonDays": 7
  }'
```

---

### Сценарий 3: Массовое прогнозирование

**Цель**: Рассчитать прогнозы для всех активных штабелей

```bash
curl -X POST "https://vmeste-date.ru/api/predictions/batch/calculate"
```

Или через Swagger: `POST /api/predictions/batch/calculate`

---

### Сценарий 4: Прогнозирование на основе CSV файлов

**Цель**: Получить прогнозы напрямую из CSV файлов без загрузки в БД

#### Через PowerShell скрипт

```powershell
.\predict-from-csv.ps1 `
  -FiresFile "fires.csv" `
  -SuppliesFile "supplies.csv" `
  -TemperatureFile "temperature.csv" `
  -MlServiceUrl "http://62.181.44.52:8000" `
  -HorizonDays 7
```

#### Через curl

```bash
curl -X POST "http://62.181.44.52:8000/predict/csv?horizon_days=7" \
  -F "fires=@fires.csv" \
  -F "supplies=@supplies.csv" \
  -F "temperature=@temperature.csv"
```

#### Через Python

```python
import requests

url = "http://62.181.44.52:8000/predict/csv"
files = {
    'fires': open('fires.csv', 'rb'),
    'supplies': open('supplies.csv', 'rb'),
    'temperature': open('temperature.csv', 'rb')
}
params = {'horizon_days': 7}

response = requests.post(url, files=files, params=params)
print(response.json())
```

**Результат**: Список прогнозов для каждой записи в temperature.csv

---

### Сценарий 5: Валидация модели на тестовых данных

**Цель**: Проверить точность модели на тестовом датасете

#### Через PowerShell скрипт

```powershell
.\validate-model.ps1 `
  -CsvFile "test_data.csv" `
  -MlServiceUrl "http://62.181.44.52:8000" `
  -ModelName "coal_fire_model" `
  -ModelVersion "1.0.0"
```

#### Через curl

```bash
curl -X POST "http://62.181.44.52:8000/validate?model_name=coal_fire_model&model_version=1.0.0" \
  -F "file=@test_data.csv"
```

**Результат**: Метрики точности (accuracy, precision, recall, F1-score, MAE, RMSE)

---

### Сценарий 6: Обучение модели

**Цель**: Обучить новую версию модели на актуальных данных

```bash
curl -X POST "https://vmeste-date.ru/api/ml/train" \
  -H "Content-Type: application/json" \
  -d '{
    "modelName": "coal_fire_model",
    "modelVersion": "1.0.1",
    "config": {
      "n_estimators": 300,
      "max_depth": 6,
      "learning_rate": 0.1
    }
  }'
```

Или через Swagger: `POST /api/ml/train`

---

### Сценарий 7: Просмотр метрик и аналитики

**Цель**: Оценить качество модели и получить статистику

#### Метрики модели

```bash
curl "http://62.181.44.52:8000/metrics"
```

#### Аналитика через API

```bash
# Метрики модели
curl "https://vmeste-date.ru/api/analytics/metrics?periodDays=30"

# Точность прогнозов
curl "https://vmeste-date.ru/api/analytics/accuracy"

# Dashboard статистика
curl "https://vmeste-date.ru/api/analytics/dashboard"

# Распределение рисков
curl "https://vmeste-date.ru/api/analytics/risk-distribution"
```

---

### Сценарий 8: Работа через Telegram бот

1. Откройте Telegram и найдите бота: [@Ta1_devBot](https://t.me/Ta1_devBot)
2. Отправьте команду `/start`
3. Используйте меню бота для:
   - Просмотра прогнозов
   - Получения уведомлений о критических рисках
   - Просмотра статистики

---

## 💻 Локальный запуск

### Требования

- Docker и Docker Compose
- Windows 10/11 или Linux
- Минимум 4 GB RAM
- 10 GB свободного места на диске

### Шаг 1: Клонирование репозитория

```bash
git clone <repository-url>
cd GlowByte
```

### Шаг 2: Настройка переменных окружения

#### API (.env в папке `api/`)

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/coalfire
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
ML_SERVICE_URL=http://ml-service:8000
PORT=3000
JWT_SECRET=your-secret-key
```

#### Bot (.env в папке `bot/`)

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
API_URL=http://api:3000
```

#### ML Service (.env в папке `ml-service/`)

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/coalfire
```

### Шаг 3: Запуск сервисов

```bash
# Запуск всех сервисов
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

### Шаг 4: Инициализация базы данных

```bash
# Вход в контейнер API
docker exec -it coalfire-api sh

# Генерация Prisma Client
bunx prisma generate

# Создание миграций
bunx prisma migrate dev --name init

# Выход
exit
```

### Шаг 5: Проверка работы

- **API**: http://localhost:3000/health
- **API Docs**: http://localhost:3000/api/docs
- **ML Service**: http://localhost:8000/health
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

### Шаг 6: Остановка сервисов

```bash
docker-compose down
```

---

## 🌍 Развертывание на хостинге

### Подготовка сервера

#### Требования к серверу

- Ubuntu 20.04+ или Debian 11+
- Минимум 4 CPU, 8 GB RAM, 50 GB SSD
- Docker и Docker Compose установлены
- Открытые порты: 80, 443, 22

#### Установка Docker

```bash
# Обновление системы
sudo apt-get update
sudo apt-get upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER
```

### Шаг 1: Клонирование проекта на сервер

```bash
# Подключение к серверу
ssh user@62.181.44.52

# Клонирование репозитория
git clone <repository-url>
cd GlowByte
```

### Шаг 2: Настройка переменных окружения

Создайте `.env` файлы для каждого сервиса с production значениями:

#### api/.env

```env
DATABASE_URL=postgresql://postgres:STRONG_PASSWORD@postgres:5432/coalfire
RABBITMQ_URL=amqp://guest:STRONG_PASSWORD@rabbitmq:5672
ML_SERVICE_URL=http://ml-service:8000
PORT=3000
JWT_SECRET=STRONG_SECRET_KEY
CLIENT_URL=https://vmeste-date.ru
NODE_ENV=production
```

#### bot/.env

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
API_URL=http://api:3000
```

#### ml-service/.env

```env
DATABASE_URL=postgresql://postgres:STRONG_PASSWORD@postgres:5432/coalfire
```

### Шаг 3: Настройка SSL сертификатов

#### Вариант A: Let's Encrypt (рекомендуется)

```bash
# Установка certbot
sudo apt-get install certbot

# Получение сертификата
sudo certbot certonly --standalone -d vmeste-date.ru -d www.vmeste-date.ru

# Копирование сертификатов
sudo cp /etc/letsencrypt/live/vmeste-date.ru/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/vmeste-date.ru/privkey.pem ./nginx/ssl/
sudo chmod 644 ./nginx/ssl/fullchain.pem
sudo chmod 600 ./nginx/ssl/privkey.pem
```

#### Вариант B: Self-signed (для тестирования)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/CN=vmeste-date.ru"
```

### Шаг 4: Настройка DNS

Убедитесь, что DNS записи настроены:

```
A     @              -> 62.181.44.52
A     www            -> 62.181.44.52
```

### Шаг 5: Сборка и загрузка Docker образов

#### Локально (на вашем компьютере)

```powershell
# Авторизация в DockerHub
docker login

# Сборка и загрузка всех образов
.\build-and-push.ps1 your_dockerhub_username
.\build-and-push-nginx.ps1 your_dockerhub_username
```

#### На сервере

```bash
# Авторизация в DockerHub
docker login

# Загрузка образов
docker pull your_dockerhub_username/coalfire-api:latest
docker pull your_dockerhub_username/coalfire-bot:latest
docker pull your_dockerhub_username/coalfire-ml-service:latest
docker pull your_dockerhub_username/coalfire-client:latest
docker pull your_dockerhub_username/coalfire-nginx:latest
```

### Шаг 6: Запуск сервисов

```bash
# Запуск всех сервисов включая Nginx
docker-compose --profile nginx up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

### Шаг 7: Инициализация базы данных

```bash
# Вход в контейнер API
docker exec -it coalfire-api sh

# Генерация Prisma Client
bunx prisma generate

# Применение миграций
bunx prisma migrate deploy

# Выход
exit
```

### Шаг 8: Проверка работы

```bash
# Проверка Nginx
curl -I https://vmeste-date.ru/health

# Проверка API
curl https://vmeste-date.ru/api/health

# Проверка ML Service
curl http://62.181.44.52:8000/health
```

### Шаг 9: Настройка автообновления SSL

```bash
# Добавление в crontab
sudo crontab -e

# Добавьте строку:
0 0 * * * certbot renew --quiet --deploy-hook "cd /path/to/GlowByte && docker-compose --profile nginx restart nginx"
```

### Шаг 10: Настройка firewall

```bash
# Разрешить необходимые порты
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 📡 API эндпоинты

### Основные эндпоинты

#### Данные

- `POST /api/data/upload` - Загрузка CSV файлов
- `GET /api/data/uploads` - Список загрузок

#### Штабели

- `GET /api/stockpiles` - Список штабелей
- `POST /api/stockpiles` - Создание штабеля
- `GET /api/stockpiles/:id` - Детали штабеля
- `GET /api/stockpiles/:id/temperature` - История температуры

#### Прогнозирование

- `POST /api/predictions` - Создание прогноза
- `GET /api/predictions` - Список прогнозов
- `POST /api/predictions/batch/calculate` - Массовое прогнозирование

#### ML Service

- `POST /predict` - Прогноз для штабеля (ML Service)
- `POST /predict/csv` - Прогноз из CSV файлов (ML Service)
- `POST /validate` - Валидация модели (ML Service)
- `POST /train` - Обучение модели (ML Service)
- `GET /metrics` - Метрики модели (ML Service)

#### Аналитика

- `GET /api/analytics/metrics` - Метрики модели
- `GET /api/analytics/accuracy` - Точность прогнозов
- `GET /api/analytics/dashboard` - Dashboard статистика

**Полная документация**: https://vmeste-date.ru/api/docs

---

## 🔧 Troubleshooting

### Проблема: Сервисы не запускаются

```bash
# Проверка логов
docker-compose logs -f

# Проверка статуса
docker-compose ps

# Перезапуск сервисов
docker-compose restart
```

### Проблема: База данных не подключается

```bash
# Проверка подключения к PostgreSQL
docker exec -it coalfire-postgres psql -U postgres -d coalfire

# Проверка переменных окружения
docker exec -it coalfire-api env | grep DATABASE_URL
```

### Проблема: ML Service не отвечает

```bash
# Проверка логов ML Service
docker-compose logs -f ml-service

# Проверка health endpoint
curl http://localhost:8000/health

# Перезапуск ML Service
docker-compose restart ml-service
```

### Проблема: SSL сертификат не работает

```bash
# Проверка сертификатов
ls -la nginx/ssl/

# Проверка конфигурации Nginx
docker exec coalfire-nginx nginx -t

# Перезагрузка Nginx
docker exec coalfire-nginx nginx -s reload
```

### Проблема: RabbitMQ недоступен

```bash
# Проверка RabbitMQ
docker-compose logs -f rabbitmq

# Проверка Management UI
curl http://localhost:15672
```

---

## 📚 Дополнительная документация

- [CLIENT.md](./CLIENT.md) - Описание Веб приложения
- [QUICK_START.md](./QUICK_START.md) - Быстрый старт для разработчиков
- [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) - Детальная инструкция по production развертыванию
- [SYSTEM_DESCRIPTION.md](./SYSTEM_DESCRIPTION.md) - Подробное описание системы
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Полная документация API
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Руководство по тестированию

---

## 📞 Контакты и поддержка

- **Telegram бот**: [@Ta1_devBot](https://t.me/Ta1_devBot)
- **Production сервер**: 62.181.44.52
- **Домен**: vmeste-date.ru

---

**Версия**: 1.0.0  
**Последнее обновление**: 2025-01-20
