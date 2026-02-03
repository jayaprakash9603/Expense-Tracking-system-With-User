package com.jaya.common.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.kafka.events.FriendRequestEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Producer for Friend Request Events.
 * Sends friend request notifications (sent, accepted, rejected).
 */
@Slf4j
@Component
public class FriendRequestEventProducer extends NotificationEventProducer<FriendRequestEvent> {

    @Value("${kafka.topics.friend-request-events:friend-request-events}")
    private String topicName;

    public FriendRequestEventProducer(KafkaTemplate<String, Object> kafkaTemplate, ObjectMapper objectMapper) {
        super(kafkaTemplate, objectMapper);
    }

    @Override
    protected String getTopicName() {
        return topicName;
    }

    @Override
    protected String getEventTypeName() {
        return "Friend Request";
    }

    @Override
    protected String generatePartitionKey(FriendRequestEvent event) {
        // Partition by receiver ID so all notifications for a user are in order
        if (event.getReceiverId() != null) {
            return event.getReceiverId().toString();
        }
        return super.generatePartitionKey(event);
    }

    @Override
    protected void validateEvent(FriendRequestEvent event) {
        super.validateEvent(event);

        if (event.getSenderId() == null) {
            throw new IllegalArgumentException("Sender ID is required for friend request event");
        }
        if (event.getReceiverId() == null) {
            throw new IllegalArgumentException("Receiver ID is required for friend request event");
        }
        if (event.getEventType() == null || event.getEventType().isBlank()) {
            throw new IllegalArgumentException("Event type is required for friend request event");
        }
    }
}
