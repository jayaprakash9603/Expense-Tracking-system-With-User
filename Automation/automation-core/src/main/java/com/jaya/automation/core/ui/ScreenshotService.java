package com.jaya.automation.core.ui;

import java.nio.file.Path;

public interface ScreenshotService {
    Path capture(String scenarioName);
}
