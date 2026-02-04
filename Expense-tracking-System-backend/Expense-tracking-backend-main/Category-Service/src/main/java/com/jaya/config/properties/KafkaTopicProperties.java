package com.jaya.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

/**
 * Configuration properties for Kafka topics.
 * Follows 12-Factor App methodology - externalized configuration.
 * 
 * Usage in application.yml:
 * kafka:
 * topics:
 * category-events: category-events
 * friend-activity: friend-activity
 * unified-activity: unified-activity
 */
@Data
@Validated
@Configuration
@ConfigurationProperties(prefix = "kafka.topics")
public class KafkaTopicProperties {

    /**
     * Topic name for category events (create, update, delete)
     */
    private String categoryEvents = "category-events";

    /**
     * Topic name for friend activity events
     */
    private String friendActivity = "friend-activity";

    /**
     * Topic name for unified activity events
     */
    private String unifiedActivity = "unified-activity";

    /**
     * Topic name for category notification events
     */
    private String categoryNotification = "category-notification";
}
