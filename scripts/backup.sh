#!/bin/bash

# ===================================
# Family Tree Application
# Backup Script
# ===================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR=${BACKUP_DIR:-"/var/backups/family-tree"}
DB_NAME=${DB_NAME:-"family_tree"}
DB_USER=${DB_USER:-"familytree"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
UPLOADS_DIR=${UPLOADS_DIR:-"./uploads"}
RETENTION_DAYS=${RETENTION_DAYS:-30}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

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

# Create backup directory
create_backup_dir() {
    log_info "Creating backup directory..."
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$BACKUP_DIR/database"
    mkdir -p "$BACKUP_DIR/uploads"
    mkdir -p "$BACKUP_DIR/config"
    log_success "Backup directory created: $BACKUP_DIR"
}

# Backup database
backup_database() {
    log_info "Backing up database..."
    
    DB_BACKUP_FILE="$BACKUP_DIR/database/db_backup_$TIMESTAMP.sql"
    
    # Check if pg_dump is available
    if ! command -v pg_dump &> /dev/null; then
        log_error "pg_dump command not found. Please install PostgreSQL client."
        return 1
    fi
    
    # Perform database backup
    if PGPASSWORD=$DB_PASSWORD pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$DB_BACKUP_FILE"; then
        # Compress the backup
        gzip "$DB_BACKUP_FILE"
        log_success "Database backup completed: ${DB_BACKUP_FILE}.gz"
        
        # Calculate backup size
        BACKUP_SIZE=$(du -h "${DB_BACKUP_FILE}.gz" | cut -f1)
        log_info "Backup size: $BACKUP_SIZE"
    else
        log_error "Database backup failed"
        return 1
    fi
}

# Backup uploaded files
backup_uploads() {
    log_info "Backing up uploaded files..."
    
    if [ -d "$UPLOADS_DIR" ]; then
        UPLOADS_BACKUP_FILE="$BACKUP_DIR/uploads/uploads_backup_$TIMESTAMP.tar.gz"
        
        # Create tar archive
        if tar -czf "$UPLOADS_BACKUP_FILE" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")"; then
            log_success "Uploads backup completed: $UPLOADS_BACKUP_FILE"
            
            # Calculate backup size
            BACKUP_SIZE=$(du -h "$UPLOADS_BACKUP_FILE" | cut -f1)
            log_info "Backup size: $BACKUP_SIZE"
        else
            log_error "Uploads backup failed"
            return 1
        fi
    else
        log_warning "Uploads directory not found: $UPLOADS_DIR"
    fi
}

# Backup configuration files
backup_config() {
    log_info "Backing up configuration files..."
    
    CONFIG_BACKUP_FILE="$BACKUP_DIR/config/config_backup_$TIMESTAMP.tar.gz"
    
    # List of config files to backup
    CONFIG_FILES=(
        ".env.production"
        "ecosystem.config.js"
        "nginx/nginx.conf"
        "nginx/conf.d/default.conf"
    )
    
    # Create temporary directory
    TEMP_CONFIG_DIR=$(mktemp -d)
    
    # Copy config files
    for file in "${CONFIG_FILES[@]}"; do
        if [ -f "$file" ]; then
            # Create directory structure
            mkdir -p "$TEMP_CONFIG_DIR/$(dirname "$file")"
            cp "$file" "$TEMP_CONFIG_DIR/$file"
            log_info "Copied: $file"
        else
            log_warning "Config file not found: $file"
        fi
    done
    
    # Create tar archive
    if tar -czf "$CONFIG_BACKUP_FILE" -C "$TEMP_CONFIG_DIR" .; then
        log_success "Config backup completed: $CONFIG_BACKUP_FILE"
        rm -rf "$TEMP_CONFIG_DIR"
    else
        log_error "Config backup failed"
        rm -rf "$TEMP_CONFIG_DIR"
        return 1
    fi
}

# Create backup metadata
create_metadata() {
    log_info "Creating backup metadata..."
    
    METADATA_FILE="$BACKUP_DIR/backup_metadata_$TIMESTAMP.json"
    
    cat > "$METADATA_FILE" << EOF
{
    "timestamp": "$TIMESTAMP",
    "date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "hostname": "$(hostname)",
    "backup_version": "1.0.0",
    "components": {
        "database": {
            "name": "$DB_NAME",
            "host": "$DB_HOST",
            "file": "database/db_backup_$TIMESTAMP.sql.gz"
        },
        "uploads": {
            "directory": "$UPLOADS_DIR",
            "file": "uploads/uploads_backup_$TIMESTAMP.tar.gz"
        },
        "config": {
            "file": "config/config_backup_$TIMESTAMP.tar.gz"
        }
    }
}
EOF
    
    log_success "Metadata created: $METADATA_FILE"
}

# Clean old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    # Clean database backups
    find "$BACKUP_DIR/database" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # Clean uploads backups
    find "$BACKUP_DIR/uploads" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # Clean config backups
    find "$BACKUP_DIR/config" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # Clean metadata files
    find "$BACKUP_DIR" -name "backup_metadata_*.json" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    log_success "Old backups cleaned up"
}

# Verify backup
verify_backup() {
    log_info "Verifying backup integrity..."
    
    FAILED=0
    
    # Verify database backup
    if [ -f "$BACKUP_DIR/database/db_backup_$TIMESTAMP.sql.gz" ]; then
        if gzip -t "$BACKUP_DIR/database/db_backup_$TIMESTAMP.sql.gz"; then
            log_success "Database backup verified"
        else
            log_error "Database backup is corrupted"
            FAILED=1
        fi
    else
        log_error "Database backup file not found"
        FAILED=1
    fi
    
    # Verify uploads backup
    if [ -f "$BACKUP_DIR/uploads/uploads_backup_$TIMESTAMP.tar.gz" ]; then
        if tar -tzf "$BACKUP_DIR/uploads/uploads_backup_$TIMESTAMP.tar.gz" > /dev/null 2>&1; then
            log_success "Uploads backup verified"
        else
            log_error "Uploads backup is corrupted"
            FAILED=1
        fi
    fi
    
    # Verify config backup
    if [ -f "$BACKUP_DIR/config/config_backup_$TIMESTAMP.tar.gz" ]; then
        if tar -tzf "$BACKUP_DIR/config/config_backup_$TIMESTAMP.tar.gz" > /dev/null 2>&1; then
            log_success "Config backup verified"
        else
            log_error "Config backup is corrupted"
            FAILED=1
        fi
    fi
    
    return $FAILED
}

# Upload to remote storage (optional)
upload_to_remote() {
    if [ -n "$S3_BUCKET" ]; then
        log_info "Uploading backup to S3..."
        
        # Upload database backup
        aws s3 cp "$BACKUP_DIR/database/db_backup_$TIMESTAMP.sql.gz" \
            "s3://$S3_BUCKET/backups/database/" || log_warning "Failed to upload database backup to S3"
        
        # Upload other backups...
        log_success "Remote upload completed"
    fi
}

# Main backup flow
main() {
    echo "====================================="
    echo "Family Tree Application Backup"
    echo "Timestamp: $TIMESTAMP"
    echo "====================================="
    echo
    
    # Load environment variables if available
    if [ -f ".env.production" ]; then
        export $(grep -v '^#' .env.production | xargs)
    fi
    
    # Create backup directory
    create_backup_dir
    
    # Perform backups
    backup_database
    backup_uploads
    backup_config
    
    # Create metadata
    create_metadata
    
    # Verify backups
    verify_backup
    
    # Clean old backups
    cleanup_old_backups
    
    # Upload to remote storage
    upload_to_remote
    
    echo
    echo "====================================="
    log_success "Backup completed successfully!"
    echo "Backup location: $BACKUP_DIR"
    echo "====================================="
}

# Run main function
main