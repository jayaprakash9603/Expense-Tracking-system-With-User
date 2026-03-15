package com.jaya.automation.core.config;

public record RunnerSettings(
        String cucumberTags,
        String cucumberFeatures,
        int parallelThreads,
        boolean reuseBrowserSession
) {
}
