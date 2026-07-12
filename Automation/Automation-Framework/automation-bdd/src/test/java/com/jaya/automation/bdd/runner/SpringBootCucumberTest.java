package com.jaya.automation.bdd.runner;

import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import io.cucumber.testng.AbstractTestNGCucumberTests;
import io.cucumber.testng.CucumberOptions;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Listeners;

@Listeners(RetryAnnotationTransformer.class)
@CucumberOptions(
        features = "classpath:features",
        glue = {
                "com.jaya.automation.bdd.steps.ui",
                "com.jaya.automation.bdd.steps.api",
                "com.jaya.automation.bdd.steps.common",
                "com.jaya.automation.bdd.hooks",
                "com.jaya.automation.bdd.runner"
        },
        plugin = {
                "pretty",
                "summary",
                "io.qameta.allure.cucumber7jvm.AllureCucumber7Jvm",
                "com.jaya.automation.bdd.runner.StepExecutionLoggerPlugin",
                "json:target/reports/cucumber/spring-cucumber.json",
                "html:target/reports/cucumber/spring-cucumber.html",
                "rerun:target/reports/rerun/rerun.txt"
        },
        objectFactory = io.cucumber.spring.SpringFactory.class
)
public class SpringBootCucumberTest extends AbstractTestNGCucumberTests {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(SpringBootCucumberTest.class);

    @Override
    @DataProvider(parallel = true)
    public Object[][] scenarios() {
        int threadCount = readThreadCount();
        LOG.info("Spring runner thread count: {}", threadCount);
        return super.scenarios();
    }

    private int readThreadCount() {
        String value = System.getProperty("cucumber.thread.count", "1");
        try {
            int parsed = Integer.parseInt(value);
            return Math.max(parsed, 1);
        } catch (NumberFormatException ex) {
            return 1;
        }
    }
}
