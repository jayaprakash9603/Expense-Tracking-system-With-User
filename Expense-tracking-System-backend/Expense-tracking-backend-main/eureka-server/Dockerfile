# Use OpenJDK 17 as base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy the built jar file (update the jar name if needed)
COPY target/eureka-server-0.0.1-SNAPSHOT.jar app.jar

# Expose the application port
EXPOSE 8761

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]