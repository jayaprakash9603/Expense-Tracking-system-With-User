package com.jaya.automation.app;

import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.config.ConfigLoader;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;

import java.nio.file.Path;

public final class AutomationApp {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(AutomationApp.class);
    private final CliOptionsParser cliOptionsParser = new CliOptionsParser();
    private final CommandRunner commandRunner = new CommandRunner();
    private final AppBootstrap appBootstrap = new AppBootstrap(commandRunner, new HealthCheckOrchestrator());
    private final TestExecutionLauncher testExecutionLauncher = new TestExecutionLauncher(commandRunner);

    public static void main(String[] args) {
        int exitCode = new AutomationApp().run(args);
        if (exitCode != 0) {
            LOG.error("Automation app finished with non-zero exit code: {}", exitCode);
            System.exit(exitCode);
        }
    }

    private int run(String[] args) {
        try {
            AutomationConfig config = ConfigLoader.load();
            AppCliOptions options = cliOptionsParser.parse(args, config);
            Path projectRoot = resolveProjectRoot();
            LOG.info(
                    "Executing automation runMode='{}' runner='{}' suite='{}' env='{}' engine='{}'",
                    options.runMode(),
                    options.executionRunner(),
                    options.suiteType(),
                    options.testEnv(),
                    options.automationEngine()
            );
            return execute(config, options, projectRoot);
        } catch (Exception ex) {
            LOG.error("Automation execution failed", ex);
            return 1;
        }
    }

    private int execute(AutomationConfig config, AppCliOptions options, Path projectRoot) {
        try {
            if (options.runMode() == RunMode.START_RUN) {
                appBootstrap.start(config.appBootstrapSettings(), projectRoot);
            }
            return testExecutionLauncher.runTests(projectRoot, config, options);
        } finally {
            if (options.runMode() == RunMode.START_RUN) {
                appBootstrap.stop(config.appBootstrapSettings(), projectRoot);
            }
        }
    }

    private Path resolveProjectRoot() {
        Path current = Path.of(System.getProperty("user.dir"));
        if (current.resolve("automation-bdd").toFile().exists()) {
            return current;
        }
        Path parent = current.getParent();
        if (parent != null && parent.resolve("automation-bdd").toFile().exists()) {
            return parent;
        }
        return current;
    }
}
