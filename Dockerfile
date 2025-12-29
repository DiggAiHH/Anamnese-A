# HISTORY-AWARE: Multi-stage build for optimized image
# Stage 1: Build dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Build local Bootstrap/QRCode files (if not already in public/lib/)
# This ensures public/lib/ has all necessary files
RUN mkdir -p public/lib/bootstrap public/lib/bootstrap-icons && \
    cp -r node_modules/bootstrap/dist/css/bootstrap.min.css public/lib/bootstrap/ && \
    cp -r node_modules/bootstrap/dist/js/bootstrap.bundle.min.js public/lib/bootstrap/ && \
    cp -r node_modules/bootstrap-icons/font/* public/lib/bootstrap-icons/ && \
    npx browserify node_modules/qrcode/lib/browser.js --standalone QRCode -o public/lib/qrcode.min.js

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/public /app/public
COPY --from=builder /app/server.js /app/server.js
COPY --from=builder /app/index.html /app/index.html
COPY --from=builder /app/index_v8_complete.html /app/index_v8_complete.html
COPY --from=builder /app/models /app/models

# DSGVO-SAFE: All static assets are local (no CDN)
# public/lib/ contains Bootstrap, Icons, QRCode (2.8MB)
# models/ contains Vosk model (136MB)

# Expose port
EXPOSE 3000

# Use non-root user for security
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
