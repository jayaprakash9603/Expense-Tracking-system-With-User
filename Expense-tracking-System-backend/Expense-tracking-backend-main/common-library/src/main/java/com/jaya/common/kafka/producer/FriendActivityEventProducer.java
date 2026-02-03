package com.jaya.common.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.kafka.events.FriendActivityEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Producer for Friend Activity Events.
 * Sends events when friends perform activities that should appear in feeds.
 */
@Slf4j
@Component
public class FriendActivityEventProducer extends NotificationEventProducer<FriendActivityEvent> {

    @Value("${kafka.topics.friend-activity-events:friend-activity-events}")
    private String topicName;

    public FriendActivityEventProducer(KafkaTemplate<String, Object> kafkaTemplate, ObjectMapper objectMapper) {
        super(kafkaTemplate, objectMapper);
    }

    @Override
    protected String getTopicName() {
        return topicName;
    }

    @Override
    protected String getEventTypeName() {
        return "Friend Activity";
    }

    @Override
    protected String generatePartitionKey(FriendActivityEvent event) {
        if (event.getActorUserId() != null) {
            return event.getActorUserId().toString();
        }
        return super.generatePartitionKey(event);
    }

    @Override
    protected void validateEvent(FriendActivityEvent event) {
        super.validateEvent(event);

        if (event.getActorUserId() == null) {
            throw new IllegalArgumentException("Actor user ID is required for friend activity event");
        }
        if (event.getActivityType() == null || event.getActivityType().isBlank()) {
            throw new IllegalArgumentException("Activity type is required for friend activity event");
        }
    }
}
