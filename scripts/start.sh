#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding default status page..."
npx tsx prisma/seed.ts

echo "Starting PolyAccess Status..."
exec node server.js
