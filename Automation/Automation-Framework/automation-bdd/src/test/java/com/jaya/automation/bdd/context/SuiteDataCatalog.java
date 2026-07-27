package com.jaya.automation.bdd.context;

import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.config.ConfigFileParser;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;

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
        loadFromConfigFile(merged);
        injectCoreConfigValues(merged, automationConfig);
        return merged;
    }

    private void loadFromConfigFile(Map<String, String> target) {
        Path configFile = resolveConfigFile();
        Map<String, String> parsed;
        if (configFile != null) {
            parsed = ConfigFileParser.parse(configFile);
            LOG.info("Loaded {} config entries from {}", parsed.size(), configFile);
        } else {
            parsed = ConfigFileParser.parseFromClasspath();
            LOG.info("Loaded {} config entries from classpath", parsed.size());
        }
        target.putAll(parsed);
    }

    private Path resolveConfigFile() {
        String pathValue = System.getProperty(CONFIG_FILE_PROPERTY);
        if (pathValue == null || pathValue.isBlank()) {
            pathValue = System.getenv(CONFIG_FILE_ENV);
        }
        if (pathValue == null || pathValue.isBlank()) {
            return null;
        }
        Path path = Path.of(pathValue.trim());
        if (!Files.exists(path)) {
            LOG.warn("Config file does not exist: {}", pathValue);
            return null;
        }
        return path;
    }

    private void injectCoreConfigValues(Map<String, String> target, AutomationConfig automationConfig) {
        target.putIfAbsent("auth.username", automationConfig.testUsername());
        target.putIfAbsent("auth.password", automationConfig.testPassword());
        target.putIfAbsent("auth.signupPassword", readSignupPassword());
        normalizeSuiteDataAliases(target);
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

    private String readSignupPassword() {
        String property = System.getProperty("TEST_SIGNUP_PASSWORD");
        if (property != null && !property.isBlank()) {
            return property.trim();
        }
        String environment = System.getenv("TEST_SIGNUP_PASSWORD");
        if (environment != null && !environment.isBlank()) {
            return environment.trim();
        }
        return "";
    }

    private void normalizeSuiteDataAliases(Map<String, String> target) {
        target.forEach((key, value) -> {
            if (key.startsWith("suiteData.") && value != null && !value.isBlank()) {
                target.putIfAbsent(key.substring("suiteData.".length()), value);
            }
        });
    }
}
