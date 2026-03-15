package com.jaya.kafka.producer;

import com.jaya.common.kafka.producer.NotificationEventProducer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.FriendActivityEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import com.jaya.common.messaging.MessagingPort;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class FriendActivityProducer extends NotificationEventProducer<FriendActivityEvent> {

    @Value("${kafka.topics.friend-activity-events:friend-activity-events}")
    private String topicName;

    public FriendActivityProducer(MessagingPort messagingPort,
            ObjectMapper objectMapper) {
        super(messagingPort, objectMapper);
        log.info("FriendActivityProducer initialized for Budget Service");
    }

    @Override
    protected String getTopicName() {
        return topicName;
    }

    @Override
    protected String getEventTypeName() {
        return "FriendActivity";
    }

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
