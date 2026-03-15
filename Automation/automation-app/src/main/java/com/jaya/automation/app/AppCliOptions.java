package com.jaya.automation.app;

public record AppCliOptions(
        RunMode runMode,
        ExecutionRunner executionRunner,
        SuiteType suiteType,
        String featuresPath,
        String testEnv,
        String automationEngine,
        String cucumberTags,
        boolean tagsProvided,
        boolean rerunFailures
) {
    public boolean hasFeaturesPath() {
        return featuresPath != null && !featuresPath.isBlank();
    }

    public boolean hasSuiteType() {
        return suiteType != null;
    }
}
