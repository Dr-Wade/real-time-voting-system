# Build stage for admin dashboard
FROM node:22-alpine AS admin-builder

WORKDIR /app/admin
RUN npm install -g pnpm


COPY admin/package.json admin/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY admin/ ./
RUN pnpm run build

# Final stage - Runtime
FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app
RUN npm install -g pnpm

# Copy API dependencies
COPY api/package.json api/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY api/prisma ./prisma
RUN DATABASE_URL="postgresql://dummy:dummy@localhost/dummy" npx prisma@5 generate

COPY api/ ./
RUN pnpm run build

# Copy built admin dashboard from builder
COPY --from=admin-builder /app/admin/dist ./public

# Expose port
EXPOSE 3333

# Start API server
CMD ["node", "dist/http/server.js"]
