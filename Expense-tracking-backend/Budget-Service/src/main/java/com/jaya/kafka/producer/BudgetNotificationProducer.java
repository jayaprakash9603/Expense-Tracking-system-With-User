package com.jaya.kafka.producer;

import com.jaya.common.kafka.producer.NotificationEventProducer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.dto.BudgetNotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import com.jaya.common.messaging.MessagingPort;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class BudgetNotificationProducer extends NotificationEventProducer<BudgetNotificationEvent> {

    @Value("${kafka.topics.budget-events:budget-events}")
    private String topicName;

    public BudgetNotificationProducer(MessagingPort messagingPort,
            ObjectMapper objectMapper) {
        super(messagingPort, objectMapper);
        log.info("BudgetNotificationProducer initialized");
    }

    @Override
    protected String getTopicName() {
        return topicName;
    }

    @Override
    protected String getEventTypeName() {
        return "Budget";
    }

    @Override
    protected String generatePartitionKey(BudgetNotificationEvent event) {
        return event.getUserId() != null ? event.getUserId().toString() : null;
    }

    @Override
    protected void validateEvent(BudgetNotificationEvent event) {
        super.validateEvent(event);
        event.validate();
    }

    @Override
    protected void beforeSend(BudgetNotificationEvent event) {
        log.debug("Preparing to send budget {} notification for user {} (Budget ID: {})",
                event.getAction(),
                event.getUserId(),
                event.getBudgetId());
    }

    @Override
    protected void afterSendSuccess(BudgetNotificationEvent event) {
        log.info("Budget {} notification sent successfully for user {} (Budget: {})",
                event.getAction(),
                event.getUserId(),
                event.getBudgetName());
    }

    @Override
    protected void afterSendFailure(BudgetNotificationEvent event, Throwable exception) {
        log.error("Failed to send budget {} notification for user {} (Budget ID: {}): {}",
                event.getAction(),
                event.getUserId(),
                event.getBudgetId(),
                exception.getMessage());
    }
}
