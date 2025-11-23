# Nginx Configuration для Production

## Описание

Конфигурация Nginx для production окружения с доменом `vmestedate.ru` и поддержкой Telegram Mini App.

## Структура

```
nginx/
├── nginx.conf          # Основная конфигурация Nginx
├── Dockerfile          # Dockerfile для сборки образа Nginx
├── ssl/                # SSL сертификаты (не в git)
│   ├── fullchain.pem
│   └── privkey.pem
├── logs/               # Логи Nginx
└── cache/              # Кеш Nginx
```

## Особенности

### 1. Telegram Mini App Support
- Настроены CORS заголовки для всех Telegram доменов
- Content-Security-Policy для iframe в Telegram
- Поддержка X-Frame-Options для встраивания в Telegram

### 2. Маршрутизация
- `/api/` → API сервис (порт 3000)
- `/ml/` → ML Service (порт 8000)
- `/` → Фронтенд (будет добавлен позже)

### 3. Безопасность
- SSL/TLS с современными протоколами (TLS 1.3, TLS 1.2)
- Защита от DDoS (rate limiting)
- Блокировка подозрительных запросов
- Security headers (HSTS, CSP, X-Frame-Options и др.)

### 4. Производительность
- Gzip и Brotli сжатие
- Кеширование статических файлов
- HTTP/2 поддержка
- Оптимизация соединений

## Установка SSL сертификатов

### Вариант 1: Let's Encrypt (рекомендуется)

1. Установите certbot:
```bash
sudo apt-get update
sudo apt-get install certbot
```

2. Получите сертификат:
```bash
sudo certbot certonly --standalone -d vmestedate.ru -d www.vmestedate.ru
```

3. Скопируйте сертификаты:
```bash
sudo cp /etc/letsencrypt/live/vmestedate.ru/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/vmestedate.ru/privkey.pem ./nginx/ssl/
sudo chmod 644 ./nginx/ssl/fullchain.pem
sudo chmod 600 ./nginx/ssl/privkey.pem
```

4. Настройте автообновление (cron):
```bash
0 0 * * * certbot renew --quiet --deploy-hook "docker-compose -f /path/to/docker-compose.yml restart nginx"
```

### Вариант 2: Self-signed (для тестирования)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/CN=vmestedate.ru"
```

## Запуск

### С Nginx (production)
```bash
docker-compose --profile nginx up -d
```

### Без Nginx (разработка)
```bash
docker-compose up -d
```

## Проверка конфигурации

```bash
# Проверка синтаксиса
docker exec coalfire-nginx nginx -t

# Перезагрузка конфигурации
docker exec coalfire-nginx nginx -s reload
```

## Логи

```bash
# Access log
docker exec coalfire-nginx tail -f /var/log/nginx/access.log

# Error log
docker exec coalfire-nginx tail -f /var/log/nginx/error.log
```

## Обновление конфигурации

После изменения `nginx.conf`:

```bash
# Пересобрать образ
docker-compose build nginx

# Перезапустить
docker-compose restart nginx
```

## CORS для Telegram Mini App

Конфигурация автоматически разрешает запросы с:
- `https://vmestedate.ru`
- `https://t.me`
- `https://web.telegram.org*` (все поддомены)

Для добавления новых доменов отредактируйте секцию `map $http_origin $cors_origin` в `nginx.conf`.

## Troubleshooting

### Проблема: 502 Bad Gateway
- Проверьте, что API и ML сервисы запущены
- Проверьте логи: `docker logs coalfire-api`, `docker logs coalfire-ml-service`

### Проблема: SSL ошибки
- Убедитесь, что сертификаты находятся в `nginx/ssl/`
- Проверьте права доступа к файлам (644 для fullchain.pem, 600 для privkey.pem)

### Проблема: CORS ошибки в Telegram
- Проверьте, что домен добавлен в `map $http_origin $cors_origin`
- Убедитесь, что заголовки CORS правильно настроены

