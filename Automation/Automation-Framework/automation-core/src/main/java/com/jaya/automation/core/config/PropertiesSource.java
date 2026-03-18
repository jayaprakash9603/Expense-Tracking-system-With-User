package com.jaya.automation.core.config;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

final class PropertiesSource {
    private static final String CONFIG_FILE_PROPERTY = "automation.config.file";
    private static final String CONFIG_FILE_ENV = "AUTOMATION_CONFIG_FILE";

    private final Properties properties;

    private PropertiesSource(Properties properties) {
        this.properties = properties;
    }

    static PropertiesSource load() {
        Properties properties = new Properties();
        Path configFile = resolveConfigFile();
        if (configFile != null) {
            loadProperties(properties, configFile);
        }
        return new PropertiesSource(properties);
    }

    String get(String key) {
        return properties.getProperty(key);
    }

    private static Path resolveConfigFile() {
        String pathValue = System.getProperty(CONFIG_FILE_PROPERTY);
        if (pathValue == null || pathValue.isBlank()) {
            pathValue = System.getenv(CONFIG_FILE_ENV);
        }
        if (pathValue == null || pathValue.isBlank()) {
            return null;
        }
        Path path = Path.of(pathValue.trim());
        return Files.exists(path) ? path : null;
    }

    private static void loadProperties(Properties target, Path path) {
        try (InputStream stream = Files.newInputStream(path)) {
            target.load(stream);
        } catch (IOException ignored) {
        }
    }
}
