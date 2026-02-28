package com.jaya.common.config;

import com.jaya.common.security.JwtAuthenticationFilter;
import com.jaya.common.security.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

/**
 * Main auto-configuration class for the common-library.
 * 
 * This configuration is automatically applied when common-library is on the classpath.
 * It provides:
 * - Global exception handlers (via component scan)
 * - JWT utilities (when security is enabled)
 * - Conditional Kafka/Event configuration
 * - Service client abstractions (Feign or Local based on profile)
 * 
 * Services can override any bean by defining their own with the same name.
 * 
 * Configuration Properties:
 * - common-library.exception-handling.enabled=true (default)
 * - common-library.security.enabled=true (default)
 * - common-library.jwt.enabled=true (default)
 * - common-library.jwt.filter.enabled=false (opt-in)
 * - common-library.feign.enabled=true (default)
 * - common-library.events.enabled=true (default)
 */
@AutoConfiguration
@Slf4j
@EnableConfigurationProperties(CommonLibraryProperties.class)
@Import({
    CommonKafkaConfig.class,
    InMemoryEventBusConfig.class,
    SharedAsyncConfig.class,
    SharedMailConfig.class
})
public class CommonLibraryAutoConfiguration {
    
    public CommonLibraryAutoConfiguration() {
        log.info("Initializing Common Library Auto-Configuration");
    }
    
    /**
     * Web-specific auto-configuration for exception handlers.
     * Exception handlers are picked up via component scan since they use @RestControllerAdvice.
     */
    @Configuration
    @ConditionalOnWebApplication
    @ConditionalOnProperty(name = "common-library.exception-handling.enabled", havingValue = "true", matchIfMissing = true)
    @ComponentScan(basePackages = "com.jaya.common.exception.handler")
    static class WebExceptionHandlerConfiguration {
        public WebExceptionHandlerConfiguration() {
            log.debug("Exception handler configuration enabled");
        }
    }
    
    /**
     * Security-specific auto-configuration for JWT utilities.
     */
    @Configuration
    @ConditionalOnClass(name = "org.springframework.security.core.Authentication")
    @ConditionalOnProperty(name = "common-library.security.enabled", havingValue = "true", matchIfMissing = true)
    static class SecurityConfiguration {
        
        @Bean
        @ConditionalOnMissingBean
        @ConditionalOnProperty(name = "common-library.jwt.enabled", havingValue = "true", matchIfMissing = true)
        public JwtUtil jwtUtil() {
            log.debug("Registering JwtUtil from common-library");
            return new JwtUtil();
        }
        
        @Bean
        @ConditionalOnMissingBean
        @ConditionalOnProperty(name = "common-library.jwt.filter.enabled", havingValue = "true", matchIfMissing = false)
        public JwtAuthenticationFilter jwtAuthenticationFilter(JwtUtil jwtUtil) {
            log.debug("Registering JwtAuthenticationFilter from common-library");
            return new JwtAuthenticationFilter(jwtUtil);
        }
    }
    
    /**
     * Feign client configuration - imports client beans when OpenFeign is on classpath
     * and running in microservices mode (not monolithic).
     */
    @Configuration
    @ConditionalOnClass(name = "org.springframework.cloud.openfeign.FeignClient")
    @ConditionalOnProperty(name = "common-library.feign.enabled", havingValue = "true", matchIfMissing = true)
    @ComponentScan(basePackages = "com.jaya.common.service.client.feign")
    static class FeignClientConfiguration {
        public FeignClientConfiguration() {
            log.debug("Feign client configuration enabled - scanning feign clients");
        }
    }
    
    /**
     * Local client configuration for monolithic mode.
     * Enables direct bean-to-bean calls instead of HTTP.
     */
    @Configuration
    @ConditionalOnProperty(name = "spring.profiles.active", havingValue = "monolithic")
    @ComponentScan(basePackages = "com.jaya.common.service.client.local")
    static class LocalClientConfiguration {
        public LocalClientConfiguration() {
            log.debug("Local client configuration enabled for monolithic mode");
        }
    }
    
    /**
     * Event handling configuration for EventPublisher abstraction.
     */
    @Configuration
    @ConditionalOnProperty(name = "common-library.events.enabled", havingValue = "true", matchIfMissing = true)
    @ComponentScan(basePackages = "com.jaya.common.event")
    static class EventConfiguration {
        public EventConfiguration() {
            log.debug("Event handling configuration enabled");
        }
    }
}














































































































