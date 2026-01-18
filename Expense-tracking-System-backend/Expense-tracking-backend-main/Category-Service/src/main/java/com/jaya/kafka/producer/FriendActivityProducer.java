package com.jaya.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.FriendActivityEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Kafka producer for Friend Activity events from Category Service.
 * Sends notifications to Friendship Service when a friend performs category
 * actions
 * on behalf of another user.
 */
@Slf4j
@Component
public class FriendActivityProducer extends NotificationEventProducer<FriendActivityEvent> {

    @Value("${kafka.topics.friend-activity-events:friend-activity-events}")
    private String topicName;

    public FriendActivityProducer(KafkaTemplate<String, Object> kafkaTemplate,
            ObjectMapper objectMapper) {
        super(kafkaTemplate, objectMapper);
        log.info("FriendActivityProducer initialized for Category Service");
    }

    @Override
    protected String getTopicName() {
        return topicName;
    }

    @Override
    protected String getEventTypeName() {
        return "FriendActivity";
    }

    /**
     * Partition by targetUserId to ensure all activities for a user
     * are processed in order by the consumer
     */
    @Override
    protected String generatePartitionKey(FriendActivityEvent event) {
        return event.getTargetUserId() != null
                ? event.getTargetUserId().toString()
                : "unknown";
    }

    @Override
    protected void validateEvent(FriendActivityEvent event) {
        super.validateEvent(event);
        if (event.getTargetUserId() == null) {
            throw new IllegalArgumentException("Target user ID is required for friend activity event");
        }
        if (event.getActorUserId() == null) {
            throw new IllegalArgumentException("Actor user ID is required for friend activity event");
        }
        if (event.getAction() == null || event.getAction().isEmpty()) {
            throw new IllegalArgumentException("Action is required for friend activity event");
        }
    }

    @Override
    protected void beforeSend(FriendActivityEvent event) {
        log.info("Sending friend activity event: actor={} performed {} on {} for targetUser={}",
                event.getActorUserId(),
                event.getAction(),
                event.getEntityType(),
                event.getTargetUserId());
    }
}
