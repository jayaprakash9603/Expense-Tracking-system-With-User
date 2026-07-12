package com.jaya.automation.bdd.runner;

import com.jaya.automation.core.config.ConfigLoader;
import org.testng.IRetryAnalyzer;
import org.testng.ITestResult;

public final class ScenarioRetryAnalyzer implements IRetryAnalyzer {
    private final int maxRetries = ConfigLoader.load().retrySettings().maxRetries();
    private int retryCount;

    @Override
    public boolean retry(ITestResult result) {
        if (maxRetries <= 0) {
            return false;
        }
        if (retryCount >= maxRetries) {
            return false;
        }
        retryCount++;
        return true;
    }
}
