package com.jaya.automation.app;

import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public final class TestExecutionLauncher {
    private static final String RERUN_FEATURE_FILE = "automation-bdd/target/reports/rerun/rerun.txt";
    private static final String PLAIN_RUNNER_CLASS = "AutomationCucumberTest";
    private static final String SPRING_RUNNER_CLASS = "SpringBootCucumberTest";
    private static final AutomationLogger LOG = LoggerFactory.getLogger(TestExecutionLauncher.class);
    private final CommandRunner commandRunner;

    public TestExecutionLauncher(CommandRunner commandRunner) {
        this.commandRunner = commandRunner;
    }

    public int runTests(Path projectRoot, AutomationConfig config, AppCliOptions options) {
        List<String> command = new ArrayList<>();
        command.add(resolveMavenCommand(projectRoot));
        command.add("-f");
        command.add("pom.xml");
        command.add("-pl");
        command.add("automation-bdd");
        command.add("-am");
        command.add("test");
        command.add("-Dtest=" + testClass(options.executionRunner()));
        command.add("-DTEST_ENV=" + options.testEnv());
        command.add("-DAUTOMATION_ENGINE=" + options.automationEngine());
        command.add("-Dcucumber.filter.tags=" + resolveTagExpression(options));
        appendRunnerOverrides(command, config, options);
        LOG.info("Launching tests with runner='{}' suite='{}'", options.executionRunner(), options.suiteType());
        return commandRunner.run(command, projectRoot);
    }

    private void appendRunnerOverrides(List<String> command, AutomationConfig config, AppCliOptions options) {
        command.add("-Dcucumber.thread.count=" + config.runnerSettings().parallelThreads());
        command.add("-DRETRY_COUNT=" + config.retrySettings().maxRetries());
        command.add("-DRERUN_FAILED_COUNT=" + config.retrySettings().rerunFailedCount());
        command.add("-DAUTOMATION_RUN_ID=" + config.artifactSettings().runId());
        command.add("-DARTIFACTS_ROOT=" + config.artifactSettings().rootDirectory());
        command.add("-DRECORD_VIDEO=" + config.observabilitySettings().videoEnabled());
        command.add("-DRECORD_TRACE=" + config.observabilitySettings().traceEnabled());
        if (options.hasSuiteType() && options.executionRunner() == ExecutionRunner.PLAIN) {
            command.add("-Dsurefire.suiteXmlFiles=" + options.suiteType().suiteFilePath());
        }
        resolveFeaturesPath(config, options).ifPresent(path -> command.add("-Dcucumber.features=" + path));
    }

    private Optional<String> resolveFeaturesPath(AutomationConfig config, AppCliOptions options) {
        if (options.rerunFailures()) {
            return Optional.of(RERUN_FEATURE_FILE);
        }
        if (options.hasFeaturesPath()) {
            return Optional.of(options.featuresPath());
        }
        String configuredPath = config.runnerSettings().cucumberFeatures();
        return configuredPath == null || configuredPath.isBlank() ? Optional.empty() : Optional.of(configuredPath);
    }

    private String resolveMavenCommand(Path projectRoot) {
        String configuredMaven = System.getenv("MAVEN_CMD");
        if (configuredMaven != null && !configuredMaven.isBlank()) {
            return configuredMaven.trim();
        }
        if (Files.exists(projectRoot.resolve("mvnw.cmd"))) {
            return "mvnw.cmd";
        }
        if (Files.exists(projectRoot.resolve("mvnw"))) {
            return "./mvnw";
        }
        return "mvn";
    }

    private String testClass(ExecutionRunner executionRunner) {
        if (executionRunner == ExecutionRunner.SPRING) {
            return SPRING_RUNNER_CLASS;
        }
        return PLAIN_RUNNER_CLASS;
    }

    private String resolveTagExpression(AppCliOptions options) {
        if (options.tagsProvided()) {
            return options.cucumberTags();
        }
        if (!options.hasSuiteType()) {
            return options.cucumberTags();
        }
        return switch (options.suiteType()) {
            case SMOKE -> "@smoke";
            case REGRESSION -> "@regression";
            case API -> "@api";
            case UI -> "@ui";
        };
    }
}
