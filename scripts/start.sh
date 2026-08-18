#!/bin/sh
set -e

echo "Running database migrations..."
node node_modules/prisma/build/index.js migrate deploy

echo "Seeding default status page..."
node node_modules/tsx/dist/cli.mjs prisma/seed.ts

echo "Starting PolyAccess Status..."
exec node server.js
