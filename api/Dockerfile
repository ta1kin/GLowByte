# Сборка
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY prisma ./prisma/

COPY . .
RUN npx prisma generate
RUN npm run build

# Продуктивный образ
FROM node:22-alpine

# Устанавливаем netcat для проверки БД
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/nest-cli.json ./nest-cli.json

# Copy and fix startup script
COPY start.sh /app/start.sh
RUN sed -i 's/\r$//' /app/start.sh && chmod +x /app/start.sh

EXPOSE 3000

CMD ["sh", "/app/start.sh"]
