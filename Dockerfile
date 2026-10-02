# ==========================================
# Multi-stage Frontend Dockerfile (Vite + React SPA)
# ==========================================

# Stage 1: Build stage
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install dependencies first for layer caching
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy application source code
COPY . .

# Build-time environment variables
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_ENABLE_CHAT=true
ENV VITE_ENABLE_CHAT=$VITE_ENABLE_CHAT

ARG VITE_N8N_CHAT_WEBHOOK_URL
ENV VITE_N8N_CHAT_WEBHOOK_URL=$VITE_N8N_CHAT_WEBHOOK_URL

# Execute production build (outputs to /app/dist)
RUN npm run build

# Stage 2: Production Nginx runtime
FROM nginx:1.27-alpine AS runner

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy production Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Lightweight liveness healthcheck using built-in wget in BusyBox
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ > /dev/null 2>&1 || exit 1

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
