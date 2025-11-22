# Docker Deployment Guide

This guide explains how to build and run the Real-Time Voting System using Docker.

## Overview

The Docker setup includes:
- **API Server**: Fastify backend with real-time WebSocket support
- **Admin Dashboard**: Vue 3 frontend for event and poll management
- **PostgreSQL Database**: Data persistence
- **Single Docker Image**: Combines API and admin dashboard

## Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd real-time-voting-system
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your desired configuration:

```env
# Application
PORT=3333
COOKIE_SECRET=your-secret-key
AUTH_SECRET=your-auth-secret
ADMIN_PERSON_ID=admin

# PostgreSQL
POSTGRES_USER=docker
POSTGRES_PASSWORD=docker
POSTGRES_DB=polls
```

### 3. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### 4. Access the Application

- **Admin Dashboard**: http://localhost:3333
- **API**: http://localhost:3333/api
- **WebSocket**: ws://localhost:3333

## Docker Compose Services

### PostgreSQL Database

```yaml
postgres:
  image: postgres:16-alpine
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

**Access Database**:
```bash
# From host machine
psql -h localhost -U docker -d polls

# From inside container
docker-compose exec postgres psql -U docker -d polls
```

### API + Admin Dashboard

```yaml
app:
  build: .
  ports:
    - "3333:3333"
  depends_on:
    - postgres
```

## Docker Commands

### Build the Image

```bash
# Build production image
docker build -t voting-system:latest .

# Build with specific tag
docker build -t voting-system:v1.0.0 .
```

### Run Container

```bash
# Run with docker-compose
docker-compose up -d

# Run standalone container
docker run -p 3333:3333 \
  -e DATABASE_URL="postgresql://docker:docker@postgres:5432/polls" \
  -e AUTH_SECRET="your-secret" \
  voting-system:latest
```

### View Logs

```bash
# View all services
docker-compose logs -f

# View specific service
docker-compose logs -f app
docker-compose logs -f postgres

# View last 100 lines
docker-compose logs --tail=100 app
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop app
```

### Database Management

```bash
# Run migrations
docker-compose exec app pnpm exec prisma migrate deploy

# Reset database
docker-compose exec app pnpm exec prisma migrate reset

# View database
docker-compose exec postgres psql -U docker -d polls -c "SELECT * FROM \"Poll\";"
```

## Production Deployment

### Environment Variables for Production

```env
# Change these for production
COOKIE_SECRET=generate-a-strong-random-string
AUTH_SECRET=generate-a-strong-random-string
ADMIN_PERSON_ID=your-admin-id

# Database
POSTGRES_PASSWORD=generate-a-strong-random-password

# Optional: Use external database
DATABASE_URL=postgresql://user:password@external-host:5432/polls
```

### Build Production Image

```bash
# Build optimized image
docker build -t voting-system:prod .

# Tag for registry
docker tag voting-system:prod registry.example.com/voting-system:latest

# Push to registry
docker push registry.example.com/voting-system:latest
```

### Deploy with Docker Compose

```bash
# Create .env file with production values
cp .env.example .env
# Edit .env with production settings

# Start services
docker-compose -f docker-compose.yml up -d

# View status
docker-compose ps

# View logs
docker-compose logs -f app
```

### Health Checks

The container includes a health check that verifies the API is running:

```bash
# Check container health
docker-compose ps

# Manual health check
curl http://localhost:3333/health
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Rebuild image
docker-compose build --no-cache

# Restart services
docker-compose restart
```

### Database Connection Error

```bash
# Check database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Port Already in Use

```bash
# Change port in docker-compose.yml or .env
# Or stop the service using the port
lsof -i :3333
kill -9 <PID>
```

### Admin Dashboard Not Loading

```bash
# Check if admin build succeeded
docker-compose logs app | grep -i admin

# Verify public directory exists
docker-compose exec app ls -la public/
```

## File Structure

```
real-time-voting-system/
├── Dockerfile              # Multi-stage build for API + Admin
├── docker-compose.yml      # Docker Compose configuration
├── .dockerignore           # Files to exclude from Docker build
├── .env.example            # Environment variables template
├── api/                    # API server source
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── .env
├── admin/                  # Admin dashboard source
│   ├── src/
│   ├── package.json
│   └── .env
└── widgets/                # Voting widget (separate deployment)
```

## Architecture

### Multi-Stage Build

1. **Admin Builder Stage**: Builds Vue 3 admin dashboard to `dist/`
2. **API Builder Stage**: Installs API dependencies and generates Prisma client
3. **Final Stage**: Combines API runtime with built admin dashboard

### Container Layout

```
/app/
├── src/                    # API source code
├── prisma/                 # Prisma schema and migrations
├── node_modules/           # Production dependencies
├── public/                 # Built admin dashboard (served by API)
└── package.json
```

## Performance Tips

### Reduce Image Size

- Use Alpine Linux base image (already done)
- Install only production dependencies
- Remove build artifacts

### Optimize Build Time

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker build .

# Cache layers effectively
# Keep frequently changing files at the end of Dockerfile
```

### Resource Limits

```yaml
# In docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Security Considerations

1. **Change Default Credentials**: Update `POSTGRES_PASSWORD` and secrets
2. **Use Strong Secrets**: Generate random strings for `COOKIE_SECRET` and `AUTH_SECRET`
3. **Environment Variables**: Don't commit `.env` file with secrets
4. **Network**: Use Docker networks instead of exposing all ports
5. **Updates**: Regularly update base images and dependencies

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review configuration in `.env`
3. Verify all services are running: `docker-compose ps`
4. Check database connectivity: `docker-compose exec postgres psql -U docker -d polls`
