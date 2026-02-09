# Use OpenJDK 17 as base image
FROM eclipse-temurin:17-jre-alpine

# Set working directory
WORKDIR /app

# Copy the built jar file
COPY target/*.jar app.jar

# Expose the application port
EXPOSE 7001

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
