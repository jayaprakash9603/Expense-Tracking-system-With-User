package com.jaya.common.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * In-memory event bus configuration for monolithic mode.
 * Uses Spring ApplicationEvent mechanism instead of Kafka.
 * Active when kafka.enabled=false or in monolithic profile.
 */
@Configuration
@Profile("monolithic")
@ConditionalOnProperty(name = "kafka.enabled", havingValue = "false", matchIfMissing = false)
public class InMemoryEventBusConfig {

    // Spring's ApplicationEventPublisher is automatically available,
    // no additional configuration needed.
    
    // The InMemoryEventPublisher component uses it for event dispatch.
    // Event listeners can use @org.springframework.context.event.EventListener
    // annotation to receive InMemoryEvent instances.
}
