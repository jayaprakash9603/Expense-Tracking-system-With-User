package com.jaya.automation.app;

import com.jaya.automation.core.config.AppBootstrapSettings;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;

import java.nio.file.Path;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

public final class AppBootstrap {
    private static final Duration STOP_COMMAND_TIMEOUT = Duration.ofSeconds(120);
    private static final Duration PROCESS_SHUTDOWN_TIMEOUT = Duration.ofSeconds(30);
    private static final AutomationLogger LOG = LoggerFactory.getLogger(AppBootstrap.class);
    private final CommandRunner commandRunner;
    private final HealthCheckOrchestrator healthCheckOrchestrator;
    private Process runningProcess;

    public AppBootstrap(CommandRunner commandRunner, HealthCheckOrchestrator healthCheckOrchestrator) {
        this.commandRunner = commandRunner;
        this.healthCheckOrchestrator = healthCheckOrchestrator;
    }

    public void start(AppBootstrapSettings settings, Path defaultWorkingDirectory) {
        if (!settings.hasStartCommand()) {
            throw new IllegalStateException("APP_START_CMD must be provided for --start-run mode");
        }
        Path workDir = resolveWorkingDirectory(settings, defaultWorkingDirectory);
        LOG.info("Bootstrapping target application in '{}'", workDir);
        runningProcess = commandRunner.start(settings.startCommand(), workDir);
        healthCheckOrchestrator.waitUntilReady(settings);
        LOG.info("Target application is ready");
    }

    public void stop(AppBootstrapSettings settings, Path defaultWorkingDirectory) {
        Path workDir = resolveWorkingDirectory(settings, defaultWorkingDirectory);
        if (settings.hasStopCommand()) {
            int exitCode = commandRunner.runShell(settings.stopCommand(), workDir, STOP_COMMAND_TIMEOUT);
            if (exitCode != 0) {
                LOG.warn("APP_STOP_CMD returned non-zero exit code: {}", exitCode);
            }
            return;
        }
        if (runningProcess != null) {
            terminateProcess(runningProcess);
            runningProcess = null;
        }
    }

    private Path resolveWorkingDirectory(AppBootstrapSettings settings, Path defaultWorkingDirectory) {
        String configuredPath = settings.workingDirectory();
        if (configuredPath == null || configuredPath.isBlank()) {
            return defaultWorkingDirectory;
        }
        return Path.of(configuredPath);
    }

    private void terminateProcess(Process process) {
        process.destroy();
        if (awaitTermination(process)) {
            return;
        }
        LOG.warn("Graceful shutdown timed out, forcing process termination");
        process.destroyForcibly();
        awaitTermination(process);
    }

    private boolean awaitTermination(Process process) {
        try {
            return process.waitFor(PROCESS_SHUTDOWN_TIMEOUT.toMillis(), TimeUnit.MILLISECONDS);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while waiting for process shutdown", ex);
        }
    }
}
