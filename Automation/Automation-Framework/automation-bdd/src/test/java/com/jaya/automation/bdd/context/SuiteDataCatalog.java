package com.jaya.automation.bdd.context;

import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public final class SuiteDataCatalog {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(SuiteDataCatalog.class);
    private static final String CONFIG_FILE_PROPERTY = "automation.config.file";
    private static final String CONFIG_FILE_ENV = "AUTOMATION_CONFIG_FILE";

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
        Map<String, String> merged = new LinkedHashMap<>();
        loadFromExternalConfigFile(merged);
        injectCoreConfigValues(merged, automationConfig);
        return merged;
    }

    private void loadFromExternalConfigFile(Map<String, String> target) {
        String configPath = resolveConfigFilePath();
        if (configPath == null || configPath.isBlank()) {
            LOG.debug("No external config file found; suite data will use core config values only");
            return;
        }
        Path path = Path.of(configPath.trim());
        if (!Files.exists(path)) {
            LOG.warn("External config file does not exist: {}", configPath);
            return;
        }
        try (InputStream stream = Files.newInputStream(path)) {
            Properties properties = new Properties();
            properties.load(stream);
            properties.forEach((key, value) -> target.put(String.valueOf(key), String.valueOf(value)));
            LOG.info("Loaded {} suite data properties from external config file", target.size());
        } catch (IOException exception) {
            LOG.warn("Unable to load external config file '{}': {}", configPath, exception.getMessage());
        }
    }

    private void injectCoreConfigValues(Map<String, String> target, AutomationConfig automationConfig) {
        target.putIfAbsent("auth.username", automationConfig.testUsername());
        target.putIfAbsent("auth.password", automationConfig.testPassword());
        String apiBaseUrl = automationConfig.apiBaseUrl();
        target.putIfAbsent("api.user.baseUrl", apiBaseUrl);
        target.putIfAbsent("api.expense.baseUrl", apiBaseUrl);
        target.putIfAbsent("api.budget.baseUrl", apiBaseUrl);
        target.putIfAbsent("api.bill.baseUrl", apiBaseUrl);
        target.putIfAbsent("api.category.baseUrl", apiBaseUrl);
        target.putIfAbsent("api.payment.baseUrl", apiBaseUrl);
        target.putIfAbsent("api.friendship.baseUrl", apiBaseUrl);
        target.putIfAbsent("api.group.baseUrl", apiBaseUrl);
        target.putIfAbsent("api.chat.baseUrl", apiBaseUrl);
        target.putIfAbsent("api.event.baseUrl", apiBaseUrl);
        target.putIfAbsent("api.notification.baseUrl", apiBaseUrl);
        target.putIfAbsent("api.search.baseUrl", apiBaseUrl);
        target.putIfAbsent("api.story.baseUrl", apiBaseUrl);
        target.putIfAbsent("api.analytics.baseUrl", apiBaseUrl);
        target.putIfAbsent("api.audit.baseUrl", apiBaseUrl);
    }

    private String resolveConfigFilePath() {
        String systemValue = System.getProperty(CONFIG_FILE_PROPERTY);
        if (systemValue != null && !systemValue.isBlank()) {
            return systemValue;
        }
        return System.getenv(CONFIG_FILE_ENV);
    }
}
