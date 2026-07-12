package com.jaya.automation.bdd.runner;

import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.context.SpringBootTest;

@CucumberContextConfiguration
@SpringBootTest(classes = SpringTestApplication.class)
public class SpringCucumberConfiguration {
}
