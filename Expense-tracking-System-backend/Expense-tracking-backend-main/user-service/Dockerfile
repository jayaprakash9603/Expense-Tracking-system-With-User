# Use OpenJDK 17 as base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy the built jar file (update the jar name if needed)
COPY target/User-service-0.0.1.jar app.jar

# Expose the application port
EXPOSE 6001

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]