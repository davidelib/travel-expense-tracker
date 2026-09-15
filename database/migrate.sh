#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Running database migrations..."

# Check if psql is available
if ! command -v psql &> /dev/null
then
    echo -e "${RED}Error: psql is not installed or not in PATH${NC}"
    exit 1
fi

# Check environment variables
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}Error: SUPABASE_DB_URL environment variable not set${NC}"
    echo "Please set SUPABASE_DB_URL before running migrations"
    echo "Example: export SUPABASE_DB_URL='postgresql://user:password@host:port/dbname'"
    exit 1
fi

# Run migrations
echo "Connecting to database..."
psql "$SUPABASE_DB_URL" -f database/migrations/001_init.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Migrations completed successfully!${NC}"
else
    echo -e "${RED}Migration failed!${NC}"
    exit 1
fi
