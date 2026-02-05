package com.jaya.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.FriendshipNotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class FriendshipNotificationProducer extends NotificationEventProducer<FriendshipNotificationEvent> {

    @Value("${kafka.topics.friendship-events:friendship-events}")
    private String topicName;

    public FriendshipNotificationProducer(KafkaTemplate<String, Object> kafkaTemplate,
            ObjectMapper objectMapper) {
        super(kafkaTemplate, objectMapper);
        log.info("FriendshipNotificationProducer initialized");
    }

    @Override
    protected String getTopicName() {
        return topicName;
    }

    @Override
    protected String getEventTypeName() {
        return "Friendship";
    }

    @Override
    protected String generatePartitionKey(FriendshipNotificationEvent event) {
        return event.getUserId() != null ? event.getUserId().toString() : null;
    }

    @Override
    protected void validateEvent(FriendshipNotificationEvent event) {
        super.validateEvent(event);
        event.validate();
    }

    @Override
    protected void beforeSend(FriendshipNotificationEvent event) {
        log.debug("Preparing to send friendship {} notification: User {} <- Actor {} (Friendship ID: {})",
                event.getAction(),
                event.getUserId(),
                event.getActorId(),
                event.getFriendshipId());
    }

    @Override
    protected void afterSendSuccess(FriendshipNotificationEvent event, SendResult<String, Object> result) {
        log.info(
                "Friendship {} notification sent successfully: User {} notified about action by {} (Topic: {}, Partition: {})",
                event.getAction(),
                event.getUserId(),
                event.getActorName() != null ? event.getActorName() : event.getActorId(),
                result.getRecordMetadata().topic(),
                result.getRecordMetadata().partition());
    }

    @Override
    protected void afterSendFailure(FriendshipNotificationEvent event, Throwable exception) {
        log.error("Failed to send friendship {} notification for user {} (Friendship ID: {}, Actor: {}): {}",
                event.getAction(),
                event.getUserId(),
                event.getFriendshipId(),
                event.getActorId(),
                exception.getMessage());
    }
}
