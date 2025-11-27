# Use OpenJDK 17 as base image
FROM eclipse-temurin:17-jre-alpine

# Set working directory
WORKDIR /app

# Copy the built jar file (update the jar name if needed)
COPY target/eureka-server-0.0.1.jar app.jar

# Expose the application port
EXPOSE 8761

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]