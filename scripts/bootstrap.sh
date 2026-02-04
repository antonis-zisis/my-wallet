#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$ROOT_DIR/packages/backend"
ENV_FILE="$BACKEND_DIR/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    log_error ".env file not found at $ENV_FILE"

    if [ -f "$BACKEND_DIR/.env.example" ]; then
        log_info "Creating .env from .env.example..."
        cp "$BACKEND_DIR/.env.example" "$ENV_FILE"
        log_warn "Please edit $ENV_FILE with your database credentials and run this script again."
        exit 1
    else
        log_error ".env.example not found. Please create $ENV_FILE manually."
        exit 1
    fi
fi

# Load environment variables from .env
log_info "Loading environment variables from .env..."
set -a
source "$ENV_FILE"
set +a

# Validate required variables
missing_vars=()
[ -z "$PG_HOST" ] && missing_vars+=("PG_HOST")
[ -z "$PG_PORT" ] && missing_vars+=("PG_PORT")
[ -z "$PG_USER" ] && missing_vars+=("PG_USER")
[ -z "$PG_DATABASE" ] && missing_vars+=("PG_DATABASE")
[ -z "$PG_PASSWORD" ] && missing_vars+=("PG_PASSWORD")

if [ ${#missing_vars[@]} -ne 0 ]; then
    log_error "Missing required environment variables: ${missing_vars[*]}"
    exit 1
fi

log_info "Configuration:"
log_info "  Host: $PG_HOST"
log_info "  Port: $PG_PORT"
log_info "  Database: $PG_DATABASE"
log_info "  User: $PG_USER"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    log_error "psql command not found. Please install PostgreSQL client."
    exit 1
fi

echo ""
log_step "Connecting to PostgreSQL as 'postgres' superuser..."
echo -e "${YELLOW}Please enter the password for the 'postgres' superuser:${NC}"

# Check if database exists
log_info "Checking if database '$PG_DATABASE' exists..."
DB_EXISTS=$(PGPASSWORD="" psql -h "$PG_HOST" -p "$PG_PORT" -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$PG_DATABASE'" postgres 2>/dev/null || echo "error")

if [ "$DB_EXISTS" = "error" ]; then
    log_error "Failed to connect to PostgreSQL. Please check your credentials."
    exit 1
fi

# Check if user exists
log_info "Checking if user '$PG_USER' exists..."
USER_EXISTS=$(psql -h "$PG_HOST" -p "$PG_PORT" -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$PG_USER'" postgres 2>/dev/null || echo "")

if [ "$USER_EXISTS" != "1" ]; then
    log_info "Creating user '$PG_USER'..."
    psql -h "$PG_HOST" -p "$PG_PORT" -U postgres -c "CREATE USER $PG_USER WITH PASSWORD '$PG_PASSWORD';" postgres
    log_info "User '$PG_USER' created successfully."
else
    log_info "User '$PG_USER' already exists."
    # Update password in case it changed
    log_info "Updating password for user '$PG_USER'..."
    psql -h "$PG_HOST" -p "$PG_PORT" -U postgres -c "ALTER USER $PG_USER WITH PASSWORD '$PG_PASSWORD';" postgres
fi

# Create database if it doesn't exist
if [ "$DB_EXISTS" != "1" ]; then
    log_info "Creating database '$PG_DATABASE'..."
    psql -h "$PG_HOST" -p "$PG_PORT" -U postgres -c "CREATE DATABASE $PG_DATABASE OWNER $PG_USER;" postgres
    log_info "Database '$PG_DATABASE' created successfully."
else
    log_info "Database '$PG_DATABASE' already exists."
    # Ensure user has ownership
    psql -h "$PG_HOST" -p "$PG_PORT" -U postgres -c "ALTER DATABASE $PG_DATABASE OWNER TO $PG_USER;" postgres 2>/dev/null || true
fi

# Grant privileges
log_info "Granting privileges to user '$PG_USER' on database '$PG_DATABASE'..."
psql -h "$PG_HOST" -p "$PG_PORT" -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $PG_DATABASE TO $PG_USER;" postgres

echo ""
log_step "Running Prisma setup..."

# Change to backend directory
cd "$BACKEND_DIR"

# Generate Prisma client
log_info "Generating Prisma client..."
pnpm run db:generate

# Run migrations if any exist
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    log_info "Running database migrations..."
    pnpm run db:migrate:deploy
else
    log_info "No migrations found. Run 'pnpm run db:migrate' to create your first migration."
fi

echo ""
log_info "Database bootstrap complete!"
log_info "You can now start the server with 'pnpm dev'"
