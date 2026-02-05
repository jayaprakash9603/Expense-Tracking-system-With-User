package com.jaya.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

@Data
@Validated
@Configuration
@ConfigurationProperties(prefix = "kafka.topics")
public class KafkaTopicProperties {
    private String categoryEvents = "category-events";
    private String friendActivity = "friend-activity";
    private String unifiedActivity = "unified-activity";
    private String categoryNotification = "category-notification";
}
