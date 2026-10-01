# ==========================================
# Production Backend Dockerfile (Node.js + Express)
# ==========================================

# Stage 1: Dependencies installation
FROM node:22-alpine AS deps

WORKDIR /app

# Install production dependencies deterministically using npm ci
# node:22-alpine provides native musl prebuilts for sqlite3 without GLIBC mismatches
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: Production runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=5000 \
    CHAT_UPLOADS_DIR=/app/uploads

# Create persistent uploads directory and set permissions for node user
RUN mkdir -p /app/uploads && chown -R node:node /app

# Copy production node_modules from deps stage
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

# Copy backend application source code
COPY --chown=node:node . .

# Switch to non-root unprivileged user
USER node

EXPOSE 5000

# Native Node.js healthcheck against lightweight liveness endpoint (/health/simple)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.get('http://127.0.0.1:' + (process.env.PORT || 5000) + '/health/simple', (res) => process.exit(res.statusCode === 200 ? 0 : 1)); req.on('error', () => process.exit(1)); req.end();"

# Direct process execution ensures SIGTERM / SIGINT signals reach Node directly
CMD ["node", "app.js"]
