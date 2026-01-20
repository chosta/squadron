#!/bin/bash
set -e

echo "Setting up Squadron database..."

# Start PostgreSQL container
echo "Starting PostgreSQL container..."
docker compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker compose exec -T postgres pg_isready -U squadron -d squadron > /dev/null 2>&1; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Generate Prisma client
echo "Generating Prisma client..."
yarn db:generate

# Push schema to database
echo "Pushing schema to database..."
yarn db:push

# Seed the database
echo "Seeding database..."
yarn db:seed

echo "Database setup complete!"
