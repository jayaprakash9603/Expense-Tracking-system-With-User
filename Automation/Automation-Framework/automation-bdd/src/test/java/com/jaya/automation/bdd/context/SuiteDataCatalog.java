package com.jaya.automation.bdd.context;

import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;

import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public final class SuiteDataCatalog {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(SuiteDataCatalog.class);

    private final Map<String, String> values;

    public SuiteDataCatalog(AutomationConfig automationConfig) {
        this.values = load(automationConfig);
    }

    public Map<String, String> values() {
        return Map.copyOf(values);
    }

    public String valueOrDefault(String key, String fallback) {
        String value = values.get(key);
        return value == null || value.isBlank() ? fallback : value;
    }

    private Map<String, String> load(AutomationConfig automationConfig) {
        String env = automationConfig.environmentType().name().toLowerCase();
        List<String> candidates = List.of(
                "config/suite-data.properties",
                "config/suite-data-" + env + ".properties",
                "testdata/" + env + "/suite-data.properties"
        );
        Map<String, String> merged = new LinkedHashMap<>();
        candidates.forEach(path -> merged.putAll(loadProperties(path)));
        return merged;
    }

    private Map<String, String> loadProperties(String classpathResource) {
        try (InputStream inputStream = resourceAsStream(classpathResource)) {
            if (inputStream == null) {
                return Map.of();
            }
            Properties properties = new Properties();
            properties.load(inputStream);
            Map<String, String> values = new LinkedHashMap<>();
            properties.forEach((key, value) -> values.put(String.valueOf(key), String.valueOf(value)));
            return values;
        } catch (Exception exception) {
            LOG.warn("Unable to load suite data resource '{}': {}", classpathResource, exception.getMessage());
            return Map.of();
        }
    }

    private InputStream resourceAsStream(String classpathResource) {
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        if (classLoader == null) {
            return SuiteDataCatalog.class.getClassLoader().getResourceAsStream(classpathResource);
        }
        return classLoader.getResourceAsStream(classpathResource);
    }
}
