package com.jaya.automation.core.ui;

public class UiEngineException extends RuntimeException {
    public UiEngineException(String message) {
        super(message);
    }

    public UiEngineException(String message, Throwable cause) {
        super(message, cause);
    }
}
