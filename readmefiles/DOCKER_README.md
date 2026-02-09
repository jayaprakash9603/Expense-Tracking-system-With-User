# Docker Build and Run Instructions

This document explains how to build and run the frontend application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Desktop running (for Windows)

## Building the Docker Image

Navigate to the frontend directory and build the image:



# Build the Docker image
docker build -t expense-tracker-frontend:latest .
```

### Build with a specific tag

```powershell
docker build -t expense-tracker-frontend:1.0.0 .
```

## Running the Docker Container

### Run with default settings

```powershell
docker run -d -p 3000:80 --name expense-tracker-frontend expense-tracker-frontend:latest
```

### Run with custom port

```powershell
docker run -d -p 8080:80 --name expense-tracker-frontend expense-tracker-frontend:latest
```

### Run with environment variables (if needed)

```powershell
docker run -d -p 3000:80 `
  -e REACT_APP_API_URL=http://localhost:8080 `
  --name expense-tracker-frontend `
  expense-tracker-frontend:latest
```

## Docker Commands Reference

### View running containers
```powershell
docker ps
```

### View all containers (including stopped)
```powershell
docker ps -a
```

### Stop the container
```powershell
docker stop expense-tracker-frontend
```

### Start the container
```powershell
docker start expense-tracker-frontend
```

### Remove the container
```powershell
docker rm expense-tracker-frontend
```

### View container logs
```powershell
docker logs expense-tracker-frontend
```

### Follow container logs in real-time
```powershell
docker logs -f expense-tracker-frontend
```

### Execute commands inside the container
```powershell
docker exec -it expense-tracker-frontend sh
```

### Remove the image
```powershell
docker rmi expense-tracker-frontend:latest
```

## Docker Compose (Optional)

Create a `docker-compose.yml` file in the project root:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://localhost:8080
    restart: unless-stopped
```

Then run:

```powershell
docker-compose up -d
```

## Accessing the Application

Once the container is running, open your browser and navigate to:
- http://localhost:3000 (or the port you specified)

## Troubleshooting

### Build fails with npm errors
- Ensure package.json and package-lock.json are present
- Try clearing Docker cache: `docker builder prune`

### Container exits immediately
- Check logs: `docker logs expense-tracker-frontend`
- Verify the build completed successfully

### Cannot access the application
- Check if the container is running: `docker ps`
- Verify port mapping is correct
- Check if port is already in use by another application

### Image size is too large
- The multi-stage build already optimizes the size
- Consider using Alpine-based Node image (already implemented)
- Remove unnecessary files using .dockerignore (already configured)

## Docker Image Details

- **Base Image**: node:20-alpine (build stage), nginx:alpine (runtime)
- **Final Image Size**: ~25-30 MB (compressed)
- **Exposed Port**: 80 (internal), mapped to your chosen port
- **Health Check**: Configured to check every 30 seconds

## Production Considerations

1. **Environment Variables**: Use environment variables for API endpoints
2. **SSL/TLS**: Consider using a reverse proxy (e.g., Traefik, Nginx Proxy Manager)
3. **Logging**: Configure proper logging for production
4. **Monitoring**: Implement health checks and monitoring
5. **Scaling**: Use Docker Swarm or Kubernetes for horizontal scaling
