# =============================================================================
# Multi-stage Docker Build for Anamnese-A PWA
# =============================================================================
# HISTORY-AWARE: Optimized build with layer caching
# DSGVO-SAFE: No secrets in image, runs as non-root user

# ===========================================================================
# Stage 1: Dependencies
# ===========================================================================
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copy only package files for better caching
COPY package*.json ./

# Install ALL dependencies (dev + prod) for building
RUN npm ci

# ===========================================================================
# Stage 2: Builder
# ===========================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./

# Copy source code
COPY server.js ./
COPY middleware/ ./middleware/
COPY database/ ./database/
COPY public/ ./public/

# Copy HTML files (but exclude backup files)
COPY index*.html ./
COPY anamnese*.html ./
COPY *.js ./
COPY *.css ./
COPY manifest.json ./

# Build local Bootstrap/QRCode files (if not already in public/lib/)
RUN mkdir -p public/lib/bootstrap public/lib/bootstrap-icons && \
    cp -r node_modules/bootstrap/dist/css/bootstrap.min.css public/lib/bootstrap/ && \
    cp -r node_modules/bootstrap/dist/js/bootstrap.bundle.min.js public/lib/bootstrap/ && \
    cp -r node_modules/bootstrap-icons/font/* public/lib/bootstrap-icons/ && \
    npx browserify node_modules/qrcode/lib/browser.js --standalone QRCode -o public/lib/qrcode.min.js

# Prune dev dependencies (CRITICAL: Reduces image size by ~50%)
RUN npm prune --production

# ===========================================================================
# Stage 3: Production Runtime
# ===========================================================================
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy only production dependencies and built artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/database ./database
COPY --from=builder /app/public ./public
COPY --from=builder /app/*.html ./
COPY --from=builder /app/*.js ./
COPY --from=builder /app/*.css ./
COPY --from=builder /app/manifest.json ./


# Create non-root user (DSGVO-SAFE: Least privilege)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Environment variables (overridden by docker-compose or k8s)
ENV NODE_ENV=production
ENV PORT=3000

# Health check (HISTORY-AWARE: Improved with better retry logic)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Use dumb-init for proper signal handling (SIGTERM)
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "server.js"]
