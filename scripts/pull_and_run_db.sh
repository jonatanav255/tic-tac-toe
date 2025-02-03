#!/bin/bash

# Step 1: Remove any existing container named my-postgres-db.
echo "Removing existing my-postgres-db container (if any)..."
docker rm -f my-postgres-db 2>/dev/null

# Step 2: Run a new PostgreSQL container using environment variables from .env.
echo "Running the new my-postgres-db container..."
docker run --name my-postgres-db \
  --env-file .env \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  -d postgres:latest

echo "Done. The PostgreSQL database should be accessible on port 5432."
