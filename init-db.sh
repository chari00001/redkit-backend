#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=postgres psql -h postgres -U postgres -d social_platform -c '\q'; do
  echo "PostgreSQL is not available yet. Waiting..."
  sleep 1
done

echo "PostgreSQL is ready! Initializing database..."

# Import schema and sample data
PGPASSWORD=postgres psql -h postgres -U postgres -d social_platform -f /docker-entrypoint-initdb.d/db.sql
PGPASSWORD=postgres psql -h postgres -U postgres -d social_platform -f /docker-entrypoint-initdb.d/sample_data.sql

echo "Database initialization completed!" 