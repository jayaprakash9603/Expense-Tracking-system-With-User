package com.jaya.automation.core.util;

@FunctionalInterface
public interface CheckedRunnable {
    void run() throws Exception;
}
