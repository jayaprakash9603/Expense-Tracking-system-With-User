# Runtime-only image — build the JAR outside Docker first:
#   cd expense-tracking-backend
#   mvn clean install -P monolithic -DskipTests
# Or use: .\scripts\docker-build.ps1 (builds JAR if missing)
#
# Build context must be this directory (monolithic-service/).

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN apk add --no-cache curl

ARG APP_VERSION=1.1.0
LABEL org.opencontainers.image.title="expense-tracker-monolith" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.description="Expense Tracking System monolithic backend"

# Copy the prebuilt Spring Boot fat JAR (same pattern as other services)
COPY target/*.jar app.jar

ENV APP_VERSION=${APP_VERSION}

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
