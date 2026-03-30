package com.jaya.automation.bdd.runner;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;

@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(basePackages = {
        "com.jaya.automation.bdd.steps",
        "com.jaya.automation.bdd.hooks",
        "com.jaya.automation.bdd.context",
        "com.jaya.automation.bdd.handler"
})
public class SpringTestApplication {
}
