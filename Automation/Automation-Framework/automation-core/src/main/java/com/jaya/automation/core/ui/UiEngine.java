package com.jaya.automation.core.ui;

public interface UiEngine extends AutoCloseable {
    void start();

    void navigateTo(String absoluteUrl);

    String currentUrl();

    String pageTitle();

    void reload();

    void navigateBack();

    void navigateForward();

    FrameScope frames();

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
