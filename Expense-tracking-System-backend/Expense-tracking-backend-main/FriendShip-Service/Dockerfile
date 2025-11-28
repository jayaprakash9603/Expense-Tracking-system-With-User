FROM eclipse-temurin:17-jre-alpine
# Set working directory
WORKDIR /app

# Copy the built jar file (update the jar name if needed)
COPY target/*.jar app.jar

# Expose the application port
EXPOSE 6009

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
