package com.jaya.automation.core.config;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

final class PropertiesSource {
    private static final String CONFIG_FILE_PROPERTY = "automation.config.file";
    private static final String CONFIG_FILE_ENV = "AUTOMATION_CONFIG_FILE";
    private static final String CLASSPATH_FILE = "automation.properties";

    private final Properties properties;

    private PropertiesSource(Properties properties) {
        this.properties = properties;
    }

    static PropertiesSource load() {
        Properties merged = new Properties();
        loadFromExternalFile(merged);
        loadFromClasspath(merged);
        return new PropertiesSource(merged);
    }

    String get(String key) {
        return properties.getProperty(key);
    }

    private static void loadFromExternalFile(Properties target) {
        String pathValue = resolveConfigFilePath();
        if (pathValue == null || pathValue.isBlank()) {
            return;
        }
        Path configPath = Path.of(pathValue.trim());
        if (!Files.exists(configPath)) {
            return;
        }
        loadProperties(target, configPath);
    }

    private static String resolveConfigFilePath() {
        String systemValue = System.getProperty(CONFIG_FILE_PROPERTY);
        if (systemValue != null && !systemValue.isBlank()) {
            return systemValue;
        }
        return System.getenv(CONFIG_FILE_ENV);
    }

    private static void loadFromClasspath(Properties target) {
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        if (classLoader == null) {
            return;
        }
        try (InputStream stream = classLoader.getResourceAsStream(CLASSPATH_FILE)) {
            if (stream != null) {
                target.load(stream);
            }
        } catch (IOException ignored) {
        }
    }

    private static void loadProperties(Properties target, Path path) {
        try (InputStream stream = Files.newInputStream(path)) {
            target.load(stream);
        } catch (IOException ignored) {
        }
    }
}
