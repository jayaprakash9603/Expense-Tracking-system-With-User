package com.jaya.automation.core.logging;

import org.slf4j.Logger;

public final class LoggerFactory {
    private LoggerFactory() {
    }

    public static AutomationLogger getLogger(Class<?> targetType) {
        Logger logger = org.slf4j.LoggerFactory.getLogger(targetType);
        return new AutomationLogger(logger);
    }
}
