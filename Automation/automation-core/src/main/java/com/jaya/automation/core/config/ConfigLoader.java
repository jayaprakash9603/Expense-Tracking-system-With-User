package com.jaya.automation.core.config;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

public final class ConfigLoader {
    private static final DateTimeFormatter RUN_ID_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
    private final PropertiesSource propertiesSource;

    private ConfigLoader(PropertiesSource propertiesSource) {
        this.propertiesSource = propertiesSource;
    }

    public static AutomationConfig load() {
        return new ConfigLoader(PropertiesSource.load()).buildConfig();
    }

    private AutomationConfig buildConfig() {
        AutomationEngine engine = AutomationEngine.from(readValue("AUTOMATION_ENGINE", "selenium"));
        EnvironmentType environment = EnvironmentType.from(readValue("TEST_ENV", EnvironmentType.LOCAL.name()));
        String baseUrl = readEnvironmentAwareUrl("BASE_URL", environment, "http://localhost:3000");
        String apiBaseUrl = readEnvironmentAwareUrl("API_BASE_URL", environment, "http://localhost:8080");
        BrowserType browserType = BrowserType.from(readValue("BROWSER", "chrome"));
        boolean headless = readBoolean("HEADLESS", true);
        int waitSec = readInt("EXPLICIT_WAIT_SEC", 15);
        int retryCount = readInt("RETRY_COUNT", 0);
        int rerunFailedCount = readInt("RERUN_FAILED_COUNT", 0);
        int parallelThreads = readInt("cucumber.thread.count", 1);
        String username = readValue("TEST_USERNAME", "");
        String password = readValue("TEST_PASSWORD", "");
        String otpProvider = readValue("OTP_PROVIDER", "");
        String mfaProvider = readValue("MFA_PROVIDER", "");
        String runId = readValue("AUTOMATION_RUN_ID", defaultRunId());
        RunnerSettings runnerSettings = buildRunnerSettings(parallelThreads);
        RetrySettings retrySettings = new RetrySettings(retryCount, rerunFailedCount);
        ArtifactSettings artifactSettings = buildArtifactSettings(runId);
        DataSettings dataSettings = buildDataSettings();
        ObservabilitySettings observabilitySettings = buildObservabilitySettings();
        AppBootstrapSettings appBootstrapSettings = buildAppBootstrapSettings();
        AutomationConfig config = new AutomationConfig(
                engine,
                environment,
                baseUrl,
                apiBaseUrl,
                browserType,
                headless,
                Duration.ofSeconds(waitSec),
                retryCount,
                username,
                password,
                otpProvider,
                mfaProvider,
                parallelThreads,
                runnerSettings,
                retrySettings,
                artifactSettings,
                dataSettings,
                observabilitySettings,
                appBootstrapSettings
        );
        publishRuntimeProperties(config);
        return ConfigValidator.validate(config);
    }

    private RunnerSettings buildRunnerSettings(int parallelThreads) {
        String cucumberTags = readValue("cucumber.filter.tags", "@smoke");
        String cucumberFeatures = readValue("cucumber.features", "");
        return new RunnerSettings(cucumberTags, cucumberFeatures, parallelThreads);
    }

    private ArtifactSettings buildArtifactSettings(String runId) {
        String artifactRoot = readValue("ARTIFACTS_ROOT", "target/artifacts");
        boolean screenshotAlways = readBoolean("CAPTURE_SCREENSHOT_ALWAYS", false);
        return new ArtifactSettings(artifactRoot, runId, screenshotAlways, true);
    }

    private DataSettings buildDataSettings() {
        String workbookPath = readValue("DATA_WORKBOOK_PATH", "");
        String sheetName = readValue("DATA_SHEET", "default");
        int iteration = readInt("DATA_ITERATION", 0);
        int partitionIndex = readInt("DATA_PARTITION_INDEX", 0);
        int partitions = readInt("DATA_PARTITIONS", 1);
        return new DataSettings(workbookPath, sheetName, iteration, partitionIndex, partitions);
    }

    private ObservabilitySettings buildObservabilitySettings() {
        boolean recordVideo = readBoolean("RECORD_VIDEO", false);
        boolean recordTrace = readBoolean("RECORD_TRACE", false);
        return new ObservabilitySettings(recordVideo, recordTrace);
    }

    private AppBootstrapSettings buildAppBootstrapSettings() {
        String startCommand = readValue("APP_START_CMD", "");
        String stopCommand = readValue("APP_STOP_CMD", "");
        String workDir = readValue("APP_WORKDIR", "");
        String readyUrl = readValue("APP_READY_URL", "");
        int timeoutSec = readInt("APP_READY_TIMEOUT_SEC", 180);
        return new AppBootstrapSettings(startCommand, stopCommand, workDir, readyUrl, Duration.ofSeconds(timeoutSec));
    }

    private String readEnvironmentAwareUrl(String key, EnvironmentType environment, String defaultUrl) {
        String directUrl = readValue(key, "");
        if (isValid(directUrl)) {
            return directUrl;
        }
        String environmentKey = key + "_" + environment.name();
        String environmentUrl = readValue(environmentKey, "");
        if (isValid(environmentUrl)) {
            return environmentUrl;
        }
        return defaultUrl;
    }

    private void publishRuntimeProperties(AutomationConfig config) {
        System.setProperty("AUTOMATION_RUN_ID", config.artifactSettings().runId());
        System.setProperty("ARTIFACTS_ROOT", config.artifactSettings().rootDirectory());
        System.setProperty("RECORD_VIDEO", String.valueOf(config.observabilitySettings().videoEnabled()));
        System.setProperty("RECORD_TRACE", String.valueOf(config.observabilitySettings().traceEnabled()));
        System.setProperty("CAPTURE_SCREENSHOT_ALWAYS", String.valueOf(config.artifactSettings().screenshotAlways()));
        System.setProperty("RETRY_COUNT", String.valueOf(config.retrySettings().maxRetries()));
        System.setProperty("RERUN_FAILED_COUNT", String.valueOf(config.retrySettings().rerunFailedCount()));
        System.setProperty("DATA_WORKBOOK_PATH", config.dataSettings().workbookPath());
        System.setProperty("DATA_SHEET", config.dataSettings().sheetName());
        System.setProperty("DATA_ITERATION", String.valueOf(config.dataSettings().iteration()));
        System.setProperty("DATA_PARTITION_INDEX", String.valueOf(config.dataSettings().partitionIndex()));
        System.setProperty("DATA_PARTITIONS", String.valueOf(config.dataSettings().partitions()));
        System.setProperty("cucumber.filter.tags", config.runnerSettings().cucumberTags());
        System.setProperty("cucumber.features", config.runnerSettings().cucumberFeatures());
    }

    private String defaultRunId() {
        return "run_" + LocalDateTime.now().format(RUN_ID_FORMATTER);
    }

    private String readValue(String key, String fallback) {
        String systemValue = System.getProperty(key);
        if (isValid(systemValue)) {
            return systemValue.trim();
        }
        String envValue = System.getenv(key);
        if (isValid(envValue)) {
            return envValue.trim();
        }
        String normalized = normalizeKey(key);
        String normalizedSystemValue = System.getProperty(normalized);
        if (isValid(normalizedSystemValue)) {
            return normalizedSystemValue.trim();
        }
        String fileValue = propertiesSource.get(key);
        if (isValid(fileValue)) {
            return fileValue.trim();
        }
        String normalizedFileValue = propertiesSource.get(normalized);
        if (isValid(normalizedFileValue)) {
            return normalizedFileValue.trim();
        }
        return fallback;
    }

    private boolean readBoolean(String key, boolean fallback) {
        String rawValue = readValue(key, String.valueOf(fallback));
        return Boolean.parseBoolean(rawValue);
    }

    private int readInt(String key, int fallback) {
        String rawValue = readValue(key, String.valueOf(fallback));
        try {
            return Integer.parseInt(rawValue);
        } catch (NumberFormatException ex) {
            return fallback;
        }
    }

    private boolean isValid(String value) {
        return value != null && !value.isBlank();
    }

    private String normalizeKey(String key) {
        return Objects.requireNonNull(key).toLowerCase().replace("_", ".");
    }
}
