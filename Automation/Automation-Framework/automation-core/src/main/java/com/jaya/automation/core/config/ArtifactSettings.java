package com.jaya.automation.core.config;

public record ArtifactSettings(String rootDirectory, String runId, boolean screenshotAlways, boolean screenshotOnFailure) {
}
