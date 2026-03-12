package com.jaya.automation.core.logging;

import org.slf4j.Logger;

public final class AutomationLogger {
    private final Logger logger;

    AutomationLogger(Logger logger) {
        this.logger = logger;
    }

    public void info(String message, Object... args) {
        logger.info(message, args);
    }

    public void warn(String message, Object... args) {
        logger.warn(message, args);
    }

    public void debug(String message, Object... args) {
        logger.debug(message, args);
    }

    public void error(String message, Object... args) {
        logger.error(message, args);
    }

    public void error(String message, Throwable throwable) {
        logger.error(message, throwable);
    }
}
