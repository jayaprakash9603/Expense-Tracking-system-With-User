package com.jaya.common.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Configuration;

/**
 * Conditional Eureka client configuration.
 * Only registers with Eureka when eureka.enabled=true (default for microservices).
 * Disabled in monolithic mode.
 */
@Configuration
@ConditionalOnProperty(name = "eureka.enabled", havingValue = "true", matchIfMissing = true)
@ConditionalOnClass(name = "org.springframework.cloud.netflix.eureka.EurekaClientAutoConfiguration")
@EnableDiscoveryClient
public class ConditionalEurekaConfig {
    // Eureka client is automatically configured when this class is active
}
