#!/bin/bash
set -e

echo "Starting Squadron development environment..."

# Start PostgreSQL
docker compose up -d

# Wait for PostgreSQL
echo "Waiting for database..."
until docker compose exec -T postgres pg_isready -U squadron -d squadron > /dev/null 2>&1; do
  sleep 1
done
echo "Database ready!"

# Generate Prisma client
yarn db:generate

# Push schema (idempotent)
yarn db:push

echo "Starting dev server on port 3001..."
yarn dev --port 3001
