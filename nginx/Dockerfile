FROM nginx:1.25-alpine

# Удаление дефолтного конфига и создание пустого, чтобы entrypoint скрипт не жаловался
RUN rm -f /etc/nginx/conf.d/default.conf && \
    touch /etc/nginx/conf.d/default.conf

# Копирование конфигурации
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Создание директорий для кеша и логов
RUN mkdir -p /var/cache/nginx/proxy \
    /var/cache/nginx/static \
    /var/cache/nginx/temp \
    /var/log/nginx \
    /var/www/certbot

# Установка прав
RUN chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /var/www/certbot

# Открытие портов
EXPOSE 80 443

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]

