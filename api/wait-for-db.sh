#!/bin/sh

# Wait for database
until nc -z postgres 5432; do
  echo "Waiting for database connection..."
  sleep 1
done

# Database is up, run prisma db push
echo "Database is up, running prisma db push"
npx prisma db push || echo "Prisma db push failed or skipped"

# Start application in dev mode
npm run start:dev
