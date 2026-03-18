package com.jaya.automation.core.config;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

final class PropertiesSource {
    private static final String CONFIG_FILE_PROPERTY = "automation.config.file";
    private static final String CONFIG_FILE_ENV = "AUTOMATION_CONFIG_FILE";

    private final Map<String, String> entries;

    private PropertiesSource(Map<String, String> entries) {
        this.entries = entries;
    }

    static PropertiesSource load() {
        Path configFile = resolveConfigFile();
        if (configFile != null) {
            return new PropertiesSource(ConfigFileParser.parse(configFile));
        }
        return new PropertiesSource(ConfigFileParser.parseFromClasspath());
    }

    String get(String key) {
        return entries.get(key);
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
}
