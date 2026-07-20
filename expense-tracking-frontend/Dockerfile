# Multi-stage build for Vite + React frontend

FROM node:20-alpine AS build

WORKDIR /app

ARG APP_VERSION=0.1.0
ARG REACT_APP_API_BASE_URL=http://localhost:8080

ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}

RUN npm config set strict-ssl false

COPY package*.json ./
RUN npm install

COPY public/ ./public/
COPY src/ ./src/
COPY index.html ./
COPY vite.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

RUN npm run build

FROM nginx:alpine

ARG APP_VERSION=0.1.0
LABEL org.opencontainers.image.title="expense-tracker-frontend" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.description="Expense Tracking System React frontend"

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
