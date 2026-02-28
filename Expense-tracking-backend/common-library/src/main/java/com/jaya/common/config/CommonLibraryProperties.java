package com.jaya.common.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for common-library features.
 * 
 * These properties allow services to customize common-library behavior:
 * 
 * <pre>
 * common-library:
 *   exception-handling:
 *     enabled: true              # Enable/disable global exception handlers
 *   security:
 *     enabled: true              # Enable/disable security exception handler
 *   jwt:
 *     enabled: true              # Enable/disable JwtUtil bean
 *     filter:
 *       enabled: false           # Enable/disable JwtAuthenticationFilter (opt-in)
 *   feign:
 *     enabled: true              # Enable/disable Feign client configuration
 *   events:
 *     enabled: true              # Enable/disable event handling
 *   kafka:
 *     enabled: true              # Enable/disable Kafka configuration
 * </pre>
 */
@Data
@ConfigurationProperties(prefix = "common-library")
public class CommonLibraryProperties {
    
    private ExceptionHandlingProperties exceptionHandling = new ExceptionHandlingProperties();
    private SecurityProperties security = new SecurityProperties();
    private JwtProperties jwt = new JwtProperties();
    private FeignProperties feign = new FeignProperties();
    private EventsProperties events = new EventsProperties();
    private KafkaProperties kafka = new KafkaProperties();
    
    @Data
    public static class ExceptionHandlingProperties {
        /**
         * Enable/disable global exception handlers
         */
        private boolean enabled = true;
    }
    
    @Data
    public static class SecurityProperties {
        /**
         * Enable/disable security exception handler
         */
        private boolean enabled = true;
    }
    
    @Data
    public static class JwtProperties {
        /**
         * Enable/disable JwtUtil bean
         */
        private boolean enabled = true;
        
        private JwtFilterProperties filter = new JwtFilterProperties();
        
        @Data
        public static class JwtFilterProperties {
            /**
             * Enable/disable JwtAuthenticationFilter - opt-in feature
             */
            private boolean enabled = false;
        }
    }
    
    @Data
    public static class FeignProperties {
        /**
         * Enable/disable Feign client configuration
         */
        private boolean enabled = true;
    }
    
    @Data
    public static class EventsProperties {
        /**
         * Enable/disable event handling
         */
        private boolean enabled = true;
    }
    
    @Data
    public static class KafkaProperties {
        /**
         * Enable/disable Kafka configuration
         */
        private boolean enabled = true;
    }
}
