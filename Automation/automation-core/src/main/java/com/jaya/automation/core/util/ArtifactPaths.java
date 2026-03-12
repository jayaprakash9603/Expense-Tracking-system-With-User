package com.jaya.automation.core.util;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class ArtifactPaths {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
    private static volatile String resolvedRunId;

    private ArtifactPaths() {
    }

    public static Path runRoot() {
        Path root = Path.of(System.getProperty("ARTIFACTS_ROOT", "target/artifacts"));
        return ensureDirectory(root.resolve(runId()));
    }

    public static Path moduleReportsRoot(String moduleName) {
        return ensureDirectory(runRoot().resolve(moduleName));
    }

    public static Path screenshotPath(String moduleName, String scenarioName) {
        Path screenshots = ensureDirectory(moduleReportsRoot(moduleName).resolve("screenshots"));
        String fileName = sanitize(scenarioName) + "_" + LocalDateTime.now().format(FORMATTER) + ".png";
        return screenshots.resolve(fileName);
    }

    public static Path tracePath(String moduleName, String scenarioName) {
        Path traces = ensureDirectory(moduleReportsRoot(moduleName).resolve("traces"));
        String fileName = sanitize(scenarioName) + "_" + LocalDateTime.now().format(FORMATTER) + ".zip";
        return traces.resolve(fileName);
    }

    public static Path videoDirectory(String moduleName) {
        return ensureDirectory(moduleReportsRoot(moduleName).resolve("videos"));
    }

    public static Path logDirectory(String moduleName) {
        return ensureDirectory(moduleReportsRoot(moduleName).resolve("logs"));
    }

    public static Path ensureDirectory(Path path) {
        try {
            Files.createDirectories(path);
            return path;
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to create directory: " + path, ex);
        }
    }

    private static String runId() {
        if (resolvedRunId != null && !resolvedRunId.isBlank()) {
            return resolvedRunId;
        }
        String configuredRunId = System.getProperty("AUTOMATION_RUN_ID");
        String fallbackRunId = "run_" + LocalDateTime.now().format(FORMATTER);
        resolvedRunId = sanitize(configuredRunId == null ? fallbackRunId : configuredRunId);
        return resolvedRunId;
    }

    private static String sanitize(String value) {
        String safe = value == null ? "artifact" : value.trim();
        String replaced = safe.replaceAll("[^A-Za-z0-9._-]", "_");
        return replaced.isBlank() ? "artifact" : replaced;
    }
}
