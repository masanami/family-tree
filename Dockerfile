# ===================================
# Family Tree Application
# Multi-stage Dockerfile
# ===================================

# Stage 1: Base dependencies
FROM node:20-alpine AS base
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install all dependencies
RUN npm ci

# Stage 2: Frontend builder
FROM base AS frontend-builder
WORKDIR /app

# Copy frontend source
COPY frontend ./frontend
COPY tsconfig.json ./

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Stage 3: Backend builder
FROM base AS backend-builder
WORKDIR /app

# Copy backend source
COPY backend ./backend
COPY tsconfig.json ./

# Build backend
WORKDIR /app/backend
RUN npm run build

# Stage 4: Production runtime
FROM node:20-alpine AS production
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install production dependencies only
RUN npm ci --production && \
    npm cache clean --force

# Copy built applications
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY --from=backend-builder /app/backend/dist ./backend/dist

# Copy necessary files
COPY backend/prisma ./backend/prisma
COPY scripts ./scripts

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Create necessary directories
RUN mkdir -p logs uploads && \
    chown -R nodejs:nodejs logs uploads

# Switch to non-root user
USER nodejs

# Environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Expose ports
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start application
CMD ["node", "backend/dist/server.js"]

# Stage 5: Development runtime (optional)
FROM base AS development
WORKDIR /app

# Copy all source files
COPY . .

# Expose ports
EXPOSE 8000 5173

# Development command
CMD ["npm", "run", "dev"]