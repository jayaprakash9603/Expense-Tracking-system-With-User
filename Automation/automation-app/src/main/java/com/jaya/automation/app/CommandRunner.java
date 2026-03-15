package com.jaya.automation.app;

import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;

import java.io.IOException;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

public final class CommandRunner {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(CommandRunner.class);

    public int run(List<String> command, Path workingDirectory) {
        ProcessBuilder builder = new ProcessBuilder(command);
        builder.directory(workingDirectory.toFile());
        builder.inheritIO();
        Instant startTime = Instant.now();
        try {
            LOG.info("Executing command in '{}': {}", workingDirectory, command);
            Process process = builder.start();
            int exitCode = process.waitFor();
            logCompletion(command, exitCode, startTime);
            return exitCode;
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to execute command: " + command, ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Command execution interrupted: " + command, ex);
        }
    }

    public Process start(String command, Path workingDirectory) {
        ProcessBuilder builder = shellCommand(command);
        builder.directory(workingDirectory.toFile());
        builder.inheritIO();
        try {
            LOG.info("Starting background command in '{}': {}", workingDirectory, command);
            return builder.start();
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to start command: " + command, ex);
        }
    }

    public int runShell(String command, Path workingDirectory) {
        return runShell(command, workingDirectory, Duration.ZERO);
    }

    public int runShell(String command, Path workingDirectory, Duration timeout) {
        ProcessBuilder builder = shellCommand(command);
        builder.directory(workingDirectory.toFile());
        builder.inheritIO();
        Instant startTime = Instant.now();
        try {
            LOG.info("Executing shell command in '{}': {}", workingDirectory, command);
            Process process = builder.start();
            int exitCode = awaitExitCode(process, timeout);
            logCompletion(List.of(command), exitCode, startTime);
            return exitCode;
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to execute command: " + command, ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Command execution interrupted: " + command, ex);
        }
    }

    private ProcessBuilder shellCommand(String command) {
        String os = System.getProperty("os.name").toLowerCase();
        if (os.contains("win")) {
            return new ProcessBuilder("cmd.exe", "/c", command);
        }
        return new ProcessBuilder("sh", "-c", command);
    }

    private int awaitExitCode(Process process, Duration timeout) throws InterruptedException {
        if (timeout == null || timeout.isZero() || timeout.isNegative()) {
            return process.waitFor();
        }
        boolean finished = process.waitFor(timeout.toMillis(), TimeUnit.MILLISECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new IllegalStateException("Shell command timed out after " + timeout);
        }
        return process.exitValue();
    }

    private void logCompletion(List<String> command, int exitCode, Instant startTime) {
        long elapsedMs = Duration.between(startTime, Instant.now()).toMillis();
        LOG.info("Command completed with exitCode={} after {} ms: {}", exitCode, elapsedMs, command);
    }
}
