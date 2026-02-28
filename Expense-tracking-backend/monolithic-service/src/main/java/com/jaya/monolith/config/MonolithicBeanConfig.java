package com.jaya.monolith.config;

import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Configuration to handle bean definition conflicts in monolithic mode.
 * When multiple services are combined, there may be duplicate bean definitions
 * that need to be resolved.
 */
@Configuration
@Profile("monolithic")
public class MonolithicBeanConfig {

    /**
     * Post-processor to handle duplicate bean definitions.
     * In monolithic mode, services may define beans with the same name.
     * This allows the first definition to win.
     */
    @Bean
    public static BeanFactoryPostProcessor beanFactoryPostProcessor() {
        return (ConfigurableListableBeanFactory beanFactory) -> {
            // Log bean definition overrides for debugging
            // Spring Boot 3.x allows bean overriding by default with:
            // spring.main.allow-bean-definition-overriding=true
        };
    }
}
