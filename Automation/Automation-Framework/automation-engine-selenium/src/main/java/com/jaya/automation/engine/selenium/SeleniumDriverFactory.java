package com.jaya.automation.engine.selenium;

import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.config.BrowserType;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

import java.time.Duration;

public final class SeleniumDriverFactory {
    private SeleniumDriverFactory() {
    }

    public static WebDriver create(AutomationConfig config) {
        WebDriver webDriver = switch (config.browserType()) {
            case CHROME -> createChrome(config);
            case EDGE -> createEdge(config);
            case FIREFOX -> createFirefox(config);
        };
        webDriver.manage().timeouts().implicitlyWait(Duration.ZERO);
        webDriver.manage().timeouts().pageLoadTimeout(config.explicitWait().multipliedBy(4));
        webDriver.manage().window().maximize();
        return webDriver;
    }

    private static WebDriver createChrome(AutomationConfig config) {
        ChromeOptions options = new ChromeOptions();
        applyHeadless(options, config.headless());
        options.addArguments("--disable-gpu");
        options.addArguments("--no-sandbox");
        options.addArguments("--window-size=1920,1080");
        return new ChromeDriver(options);
    }

    private static WebDriver createEdge(AutomationConfig config) {
        EdgeOptions options = new EdgeOptions();
        applyHeadless(options, config.headless());
        options.addArguments("--disable-gpu");
        options.addArguments("--window-size=1920,1080");
        return new EdgeDriver(options);
    }

    private static WebDriver createFirefox(AutomationConfig config) {
        FirefoxOptions options = new FirefoxOptions();
        if (config.headless()) {
            options.addArguments("-headless");
        }
        options.addArguments("--width=1920");
        options.addArguments("--height=1080");
        return new FirefoxDriver(options);
    }

    private static void applyHeadless(ChromeOptions options, boolean headless) {
        if (headless) {
            options.addArguments("--headless=new");
        }
    }

    private static void applyHeadless(EdgeOptions options, boolean headless) {
        if (headless) {
            options.addArguments("--headless=new");
        }
    }
}
