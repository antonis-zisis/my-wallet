#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$ROOT_DIR/apps/server"
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

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed or not in PATH."
    exit 1
fi

if ! docker info &> /dev/null; then
    log_error "Docker daemon is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    log_error ".env file not found at $ENV_FILE"

    if [ -f "$BACKEND_DIR/.env.sample" ]; then
        log_info "Creating .env from .env.sample..."
        cp "$BACKEND_DIR/.env.sample" "$ENV_FILE"
        log_warn "Please edit $ENV_FILE with your desired credentials and run this script again."
        exit 1
    else
        log_error ".env.sample not found. Please create $ENV_FILE manually."
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

echo ""
log_step "Starting PostgreSQL container..."

# Export vars so docker compose can interpolate them
export PG_USER PG_PASSWORD PG_DATABASE PG_PORT

docker compose -f "$ROOT_DIR/docker-compose.yml" up -d postgres

# Wait for the container to be healthy
log_info "Waiting for PostgreSQL to be ready..."
RETRIES=20
until docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T postgres \
    pg_isready -U "$PG_USER" -d "$PG_DATABASE" &> /dev/null; do
    RETRIES=$((RETRIES - 1))
    if [ "$RETRIES" -le 0 ]; then
        log_error "PostgreSQL did not become ready in time."
        exit 1
    fi
    sleep 1
done

log_info "PostgreSQL is ready."

echo ""
log_step "Running Prisma setup..."

cd "$BACKEND_DIR"

log_info "Generating Prisma client..."
pnpm run db:generate

if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    log_info "Running database migrations..."
    pnpm run db:migrate:deploy
else
    log_info "No migrations found. Run 'pnpm run db:migrate' to create your first migration."
fi

echo ""
log_info "Docker database bootstrap complete!"
log_info "PostgreSQL is running in the background. To stop it: docker compose stop"
log_info "You can now start the server with 'pnpm dev'"
