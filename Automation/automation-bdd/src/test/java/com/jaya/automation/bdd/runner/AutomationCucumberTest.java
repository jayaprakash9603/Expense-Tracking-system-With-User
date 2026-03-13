package com.jaya.automation.bdd.runner;

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
                "json:target/reports/cucumber/cucumber.json",
                "html:target/reports/cucumber/cucumber.html",
                "rerun:target/reports/rerun/rerun.txt"
        }
)
public class AutomationCucumberTest extends AbstractTestNGCucumberTests {
    @Override
    @DataProvider(parallel = true)
    public Object[][] scenarios() {
        return super.scenarios();
    }
}
