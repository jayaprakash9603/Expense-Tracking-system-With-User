package com.jaya.automation.core.config;

import java.time.Duration;

public record AppBootstrapSettings(
        String startCommand,
        String stopCommand,
        String workingDirectory,
        String readyUrl,
        Duration readyTimeout
) {
    public boolean hasStartCommand() {
        return startCommand != null && !startCommand.isBlank();
    }

    public boolean hasStopCommand() {
        return stopCommand != null && !stopCommand.isBlank();
    }

    public boolean hasReadyUrl() {
        return readyUrl != null && !readyUrl.isBlank();
    }
}
