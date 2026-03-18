package com.jaya.automation.core.ui;

public interface UiEngine extends AutoCloseable {
    void start();

    void navigateTo(String absoluteUrl);

    String currentUrl();

    UiElementActions elements();

    WaitActions waits();

    ScreenshotService screenshots();

    boolean isAlive();

    void restart();

    void stop();

    @Override
    default void close() {
        stop();
    }
}
