package com.jaya.automation.app;

import com.jaya.automation.core.config.AutomationConfig;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

public final class CliOptionsParser {
    public AppCliOptions parse(String[] args, AutomationConfig config) {
        List<String> tokens = Arrays.asList(args);
        RunMode runMode = tokens.contains("--start-run") ? RunMode.START_RUN : RunMode.RUN_ONLY;
        ExecutionRunner executionRunner = parseRunner(readOption(tokens, "--runner=", "plain"));
        SuiteType suiteType = parseSuite(readOption(tokens, "--suite=", ""));
        String featuresPath = readOption(tokens, "--features-path=", config.runnerSettings().cucumberFeatures());
        String testEnv = readOption(tokens, "--env=", config.environmentType().name().toLowerCase());
        String automationEngine = readOption(tokens, "--engine=", config.automationEngine().name().toLowerCase());
        boolean tagsProvided = containsOption(tokens, "--tags=");
        String tags = readOption(tokens, "--tags=", config.runnerSettings().cucumberTags());
        boolean rerunFailures = tokens.contains("--rerun-failures");
        return new AppCliOptions(
                runMode,
                executionRunner,
                suiteType,
                featuresPath,
                testEnv,
                automationEngine,
                tags,
                tagsProvided,
                rerunFailures
        );
    }

    private String readOption(List<String> args, String prefix, String fallback) {
        return args.stream()
                .filter(token -> token.startsWith(prefix))
                .map(token -> token.substring(prefix.length()))
                .findFirst()
                .filter(value -> !value.isBlank())
                .orElse(fallback);
    }

    private ExecutionRunner parseRunner(String value) {
        String normalized = normalize(value);
        if ("plain".equals(normalized)) {
            return ExecutionRunner.PLAIN;
        }
        if ("spring".equals(normalized)) {
            return ExecutionRunner.SPRING;
        }
        throw new IllegalArgumentException("Unsupported runner. Use --runner=plain|spring");
    }

    private SuiteType parseSuite(String value) {
        String normalized = normalize(value);
        return Optional.of(normalized)
                .filter(text -> !text.isBlank())
                .map(this::toSuiteType)
                .orElse(null);
    }

    private SuiteType toSuiteType(String suiteName) {
        return switch (suiteName) {
            case "smoke" -> SuiteType.SMOKE;
            case "regression" -> SuiteType.REGRESSION;
            case "api" -> SuiteType.API;
            case "ui" -> SuiteType.UI;
            default -> throw new IllegalArgumentException("Unsupported suite. Use --suite=smoke|regression|api|ui");
        };
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private boolean containsOption(List<String> args, String prefix) {
        return args.stream().anyMatch(token -> token.startsWith(prefix));
    }
}
