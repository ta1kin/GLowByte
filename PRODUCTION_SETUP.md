# Инструкция по настройке Production окружения

## Быстрый старт

### 1. Подготовка SSL сертификатов

#### Вариант A: Let's Encrypt (рекомендуется)

```bash
# Установка certbot (на хосте)
sudo apt-get update
sudo apt-get install certbot

# Получение сертификата
sudo certbot certonly --standalone -d vmestedate.ru -d www.vmestedate.ru

# Копирование сертификатов
sudo cp /etc/letsencrypt/live/vmestedate.ru/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/vmestedate.ru/privkey.pem ./nginx/ssl/
sudo chmod 644 ./nginx/ssl/fullchain.pem
sudo chmod 600 ./nginx/ssl/privkey.pem
```

#### Вариант B: Self-signed (для тестирования)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/CN=vmestedate.ru"
```

### 2. Настройка переменных окружения

Убедитесь, что в `.env` файле указаны:

```env
DOCKER_USER=your_dockerhub_username
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=coalfire
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=your_secure_password
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
CLIENT_URL=https://vmestedate.ru
```

### 3. Сборка и загрузка образов

```powershell
# Авторизация в DockerHub
docker login

# Сборка и загрузка всех образов
.\build-and-push.ps1 your_dockerhub_username
.\build-and-push-nginx.ps1 your_dockerhub_username
```

### 4. Запуск сервисов

```bash
# Запуск всех сервисов включая Nginx
docker-compose --profile nginx up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f nginx
docker-compose logs -f api
```

### 5. Проверка работы

```bash
# Проверка Nginx
curl -I https://vmestedate.ru/health

# Проверка API
curl https://vmestedate.ru/api/health

# Проверка SSL
openssl s_client -connect vmestedate.ru:443 -servername vmestedate.ru
```

## Настройка DNS

Убедитесь, что DNS записи настроены правильно:

```
A     @              -> IP_сервера
A     www            -> IP_сервера
```

## Автообновление SSL сертификатов

Добавьте в crontab:

```bash
0 0 * * * certbot renew --quiet --deploy-hook "cd /path/to/GlowByte && docker-compose --profile nginx restart nginx"
```

## Мониторинг

### Логи Nginx

```bash
docker exec coalfire-nginx tail -f /var/log/nginx/access.log
docker exec coalfire-nginx tail -f /var/log/nginx/error.log
```

### Проверка конфигурации

```bash
docker exec coalfire-nginx nginx -t
```

### Перезагрузка конфигурации

```bash
docker exec coalfire-nginx nginx -s reload
```

## Troubleshooting

### 502 Bad Gateway

- Проверьте, что API и ML сервисы запущены: `docker-compose ps`
- Проверьте логи: `docker-compose logs api ml-service`

### SSL ошибки

- Убедитесь, что сертификаты находятся в `nginx/ssl/`
- Проверьте права доступа: `ls -la nginx/ssl/`

### CORS ошибки в Telegram

- Проверьте, что домен добавлен в CORS map в `nginx/nginx.conf`
- Убедитесь, что заголовки CORS правильно настроены

## Безопасность

- Используйте сильные пароли для PostgreSQL и RabbitMQ
- Регулярно обновляйте Docker образы
- Настройте firewall для ограничения доступа к портам 5432, 5672, 6379
- Используйте только HTTPS в production
