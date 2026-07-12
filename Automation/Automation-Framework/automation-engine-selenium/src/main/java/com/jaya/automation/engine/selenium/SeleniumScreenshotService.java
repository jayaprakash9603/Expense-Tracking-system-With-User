package com.jaya.automation.engine.selenium;

import com.jaya.automation.core.ui.ScreenshotService;
import com.jaya.automation.core.util.ArtifactPaths;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

final class SeleniumScreenshotService implements ScreenshotService {
    private final TakesScreenshot screenshotDriver;

    SeleniumScreenshotService(TakesScreenshot screenshotDriver) {
        this.screenshotDriver = screenshotDriver;
    }

    @Override
    public Path capture(String scenarioName) {
        Path outputPath = ArtifactPaths.screenshotPath("selenium", scenarioName);
        byte[] image = screenshotDriver.getScreenshotAs(OutputType.BYTES);
        write(outputPath, image);
        return outputPath;
    }

    private void write(Path path, byte[] data) {
        try {
            Files.write(path, data);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to write screenshot: " + path, ex);
        }
    }
}
