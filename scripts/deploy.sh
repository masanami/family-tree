#!/bin/bash

# ===================================
# Family Tree Application
# Deployment Script
# ===================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-production}
BRANCH=${2:-main}

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check PostgreSQL client
    if ! command -v psql &> /dev/null; then
        log_warning "PostgreSQL client is not installed. Database operations may fail."
    fi
    
    log_success "Prerequisites check passed"
}

# Load environment variables
load_env() {
    log_info "Loading environment variables for $ENVIRONMENT..."
    
    if [ -f ".env.$ENVIRONMENT" ]; then
        export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)
        log_success "Environment variables loaded"
    else
        log_error ".env.$ENVIRONMENT file not found"
        exit 1
    fi
}

# Pull latest code
pull_latest() {
    log_info "Pulling latest code from $BRANCH branch..."
    
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
    
    log_success "Code updated to latest version"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Install root dependencies
    npm ci --production=false
    
    # Install frontend dependencies
    cd frontend
    npm ci --production=false
    cd ..
    
    # Install backend dependencies
    cd backend
    npm ci --production=false
    cd ..
    
    log_success "Dependencies installed"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    cd backend
    npm run migrate:deploy
    cd ..
    
    log_success "Database migrations completed"
}

# Build applications
build_apps() {
    log_info "Building applications..."
    
    # Build frontend
    log_info "Building frontend..."
    cd frontend
    npm run build
    cd ..
    
    # Build backend
    log_info "Building backend..."
    cd backend
    npm run build
    cd ..
    
    log_success "Applications built successfully"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Frontend tests
    log_info "Running frontend tests..."
    cd frontend
    npm run test:run || {
        log_error "Frontend tests failed"
        exit 1
    }
    cd ..
    
    # Backend tests
    log_info "Running backend tests..."
    cd backend
    npm run test || {
        log_error "Backend tests failed"
        exit 1
    }
    cd ..
    
    log_success "All tests passed"
}

# Deploy frontend
deploy_frontend() {
    log_info "Deploying frontend..."
    
    # Copy built files to web server directory
    # This is an example - adjust based on your deployment setup
    # rsync -avz --delete frontend/dist/ /var/www/family-tree/
    
    # Or deploy to CDN/S3
    # aws s3 sync frontend/dist/ s3://your-bucket-name --delete
    
    log_success "Frontend deployed"
}

# Deploy backend
deploy_backend() {
    log_info "Deploying backend..."
    
    # Stop existing service
    # systemctl stop family-tree-api || true
    
    # Copy files
    # rsync -avz --delete backend/ /opt/family-tree-api/
    
    # Start service
    # systemctl start family-tree-api
    
    # Or use PM2
    # pm2 restart family-tree-api || pm2 start backend/dist/server.js --name family-tree-api
    
    log_success "Backend deployed"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Check if API is responding
    API_URL="${API_BASE_URL:-http://localhost:8000}"
    
    for i in {1..30}; do
        if curl -f "$API_URL/health" &> /dev/null; then
            log_success "API is healthy"
            return 0
        fi
        log_info "Waiting for API to be ready... ($i/30)"
        sleep 2
    done
    
    log_error "API health check failed"
    exit 1
}

# Cleanup
cleanup() {
    log_info "Cleaning up..."
    
    # Remove old logs
    find logs -name "*.log" -mtime +30 -delete 2>/dev/null || true
    
    # Clean npm cache
    npm cache clean --force
    
    log_success "Cleanup completed"
}

# Main deployment flow
main() {
    echo "====================================="
    echo "Family Tree Application Deployment"
    echo "Environment: $ENVIRONMENT"
    echo "Branch: $BRANCH"
    echo "====================================="
    echo
    
    check_prerequisites
    load_env
    pull_latest
    install_dependencies
    run_migrations
    build_apps
    
    if [ "$ENVIRONMENT" != "development" ]; then
        run_tests
    fi
    
    deploy_frontend
    deploy_backend
    health_check
    cleanup
    
    echo
    echo "====================================="
    log_success "Deployment completed successfully!"
    echo "====================================="
}

# Run main function
main