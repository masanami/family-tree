#!/bin/bash

# ===================================
# Family Tree Application
# Health Check Script
# ===================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL=${API_URL:-"http://localhost:8000"}
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:5173"}
MAX_RETRIES=${MAX_RETRIES:-30}
RETRY_INTERVAL=${RETRY_INTERVAL:-2}

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

# Check API health
check_api_health() {
    log_info "Checking API health at $API_URL/health..."
    
    for i in $(seq 1 $MAX_RETRIES); do
        if curl -f -s "$API_URL/health" > /dev/null 2>&1; then
            
            # Get detailed health status
            HEALTH_RESPONSE=$(curl -s "$API_URL/health")
            
            if [[ $HEALTH_RESPONSE == *"\"status\":\"healthy\""* ]]; then
                log_success "API is healthy"
                return 0
            else
                log_warning "API responded but health check failed: $HEALTH_RESPONSE"
            fi
        fi
        
        log_info "Waiting for API to be ready... ($i/$MAX_RETRIES)"
        sleep $RETRY_INTERVAL
    done
    
    log_error "API health check failed after $MAX_RETRIES attempts"
    return 1
}

# Check database connectivity
check_database() {
    log_info "Checking database connectivity..."
    
    if curl -f -s "$API_URL/health/db" > /dev/null 2>&1; then
        log_success "Database connection is healthy"
        return 0
    else
        log_error "Database connection check failed"
        return 1
    fi
}

# Check Redis connectivity (if applicable)
check_redis() {
    log_info "Checking Redis connectivity..."
    
    if curl -f -s "$API_URL/health/redis" > /dev/null 2>&1; then
        log_success "Redis connection is healthy"
        return 0
    else
        log_warning "Redis connection check failed (this may be optional)"
        return 0  # Don't fail if Redis is optional
    fi
}

# Check frontend
check_frontend() {
    log_info "Checking frontend at $FRONTEND_URL..."
    
    for i in $(seq 1 $MAX_RETRIES); do
        if curl -f -s "$FRONTEND_URL" > /dev/null 2>&1; then
            log_success "Frontend is accessible"
            return 0
        fi
        
        log_info "Waiting for frontend to be ready... ($i/$MAX_RETRIES)"
        sleep $RETRY_INTERVAL
    done
    
    log_error "Frontend check failed after $MAX_RETRIES attempts"
    return 1
}

# Check critical endpoints
check_endpoints() {
    log_info "Checking critical API endpoints..."
    
    ENDPOINTS=(
        "/api/auth/status"
        "/api/persons"
        "/api/family-trees"
    )
    
    for endpoint in "${ENDPOINTS[@]}"; do
        if curl -f -s "$API_URL$endpoint" -H "Authorization: Bearer test" > /dev/null 2>&1; then
            log_success "Endpoint $endpoint is accessible"
        else
            # Check if it returns 401 (expected without valid auth)
            STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint")
            if [[ $STATUS_CODE == "401" ]]; then
                log_success "Endpoint $endpoint requires authentication (expected)"
            else
                log_warning "Endpoint $endpoint returned status code: $STATUS_CODE"
            fi
        fi
    done
}

# Performance check
check_performance() {
    log_info "Checking API response time..."
    
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$API_URL/health")
    RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc)
    
    if (( $(echo "$RESPONSE_TIME < 1" | bc -l) )); then
        log_success "API response time is good: ${RESPONSE_TIME_MS}ms"
    else
        log_warning "API response time is slow: ${RESPONSE_TIME_MS}ms"
    fi
}

# Main health check flow
main() {
    echo "====================================="
    echo "Family Tree Application Health Check"
    echo "====================================="
    echo
    
    FAILED=0
    
    # Run health checks
    check_api_health || FAILED=1
    check_database || FAILED=1
    check_redis
    check_frontend || FAILED=1
    check_endpoints
    check_performance
    
    echo
    echo "====================================="
    
    if [[ $FAILED -eq 0 ]]; then
        log_success "All health checks passed!"
        echo "====================================="
        exit 0
    else
        log_error "Some health checks failed!"
        echo "====================================="
        exit 1
    fi
}

# Run main function
main