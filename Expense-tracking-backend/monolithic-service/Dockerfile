# Multi-stage build: run Maven from aggregator root (build context must be expense-tracking-backend)
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /build

# Copy full aggregator so we can run -P monolithic
COPY pom.xml .
COPY common-library common-library
COPY user-service user-service
COPY Expense-Service Expense-Service
COPY Budget-Service Budget-Service
COPY Category-Service Category-Service
COPY Bill-Service Bill-Service
COPY Payment-method-Service Payment-method-Service
COPY FriendShip-Service FriendShip-Service
COPY Notification-Service Notification-Service
COPY Chat-Service Chat-Service
COPY Audit-Service Audit-Service
COPY AnalyticsService AnalyticsService
COPY Search-Service Search-Service
COPY Story-Service Story-Service
COPY Event-Service Event-Service
COPY monolithic-service monolithic-service

RUN mvn clean install -P monolithic -DskipTests -f pom.xml

# Runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=builder /build/monolithic-service/target/monolithic-service-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
