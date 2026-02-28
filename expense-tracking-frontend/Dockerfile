# Multi-stage build for React frontend

# Stage 1: Build the React application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Configure npm to handle SSL certificate issues (for corporate proxies)
RUN npm config set strict-ssl false

# Copy package files first
COPY package*.json ./

# Install dependencies (including devDependencies needed for build)
# Remove --legacy-peer-deps to ensure all peer dependencies are installed
RUN npm install

# Copy source code  - Only copy what's needed for the build
COPY public/ ./public/
COPY src/ ./src/
COPY tailwind.config.js ./

# Build the application using npx to ensure react-scripts is found
RUN npx react-scripts build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
