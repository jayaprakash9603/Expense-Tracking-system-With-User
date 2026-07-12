# Multi-stage build for Vite + React frontend

FROM node:20-alpine AS build

WORKDIR /app

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

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
