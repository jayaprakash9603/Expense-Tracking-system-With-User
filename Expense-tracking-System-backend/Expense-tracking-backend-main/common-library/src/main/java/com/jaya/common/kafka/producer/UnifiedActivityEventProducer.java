package com.jaya.common.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.kafka.events.UnifiedActivityEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Producer for Unified Activity Events.
 * This producer sends events that are consumed by:
 * - Notification Service (for user notifications)
 * - Audit Service (for audit logging)
 * - Friend Activity Service (for friend feeds)
 * 
 * Usage:
 * 
 * <pre>
 * @Autowired
 * private UnifiedActivityEventProducer eventProducer;
 * 
 * // Create and send event
 * UnifiedActivityEvent event = UnifiedActivityEvent.forOwnAction(userId)
 *         .entityType(EntityType.EXPENSE)
 *         .entityId(expenseId)
 *         .action(Action.CREATE)
 *         .sourceService(SourceService.EXPENSE_SERVICE)
 *         .build();
 * eventProducer.sendEvent(event);
 * </pre>
 */
@Slf4j
@Component
public class UnifiedActivityEventProducer extends NotificationEventProducer<UnifiedActivityEvent> {

    @Value("${kafka.topics.unified-activity-events:unified-activity-events}")
    private String topicName;

    public UnifiedActivityEventProducer(KafkaTemplate<String, Object> kafkaTemplate, ObjectMapper objectMapper) {
        super(kafkaTemplate, objectMapper);
    }

    @Override
    protected String getTopicName() {
        return topicName;
    }

    @Override
    protected String getEventTypeName() {
        return "Unified Activity";
    }

    /**
     * Partition by user ID to ensure event ordering per user.
     * This ensures that all events for a single user are processed in order.
     */
    @Override
    protected String generatePartitionKey(UnifiedActivityEvent event) {
        if (event.getActorUserId() != null) {
            return event.getActorUserId().toString();
        }
        return super.generatePartitionKey(event);
    }

    @Override
    protected void validateEvent(UnifiedActivityEvent event) {
        super.validateEvent(event);

        if (event.getEntityType() == null || event.getEntityType().isBlank()) {
            throw new IllegalArgumentException("Entity type is required for unified activity event");
        }
        if (event.getAction() == null || event.getAction().isBlank()) {
            throw new IllegalArgumentException("Action is required for unified activity event");
        }
        if (event.getSourceService() == null || event.getSourceService().isBlank()) {
            throw new IllegalArgumentException("Source service is required for unified activity event");
        }
    }

    @Override
    protected void beforeSend(UnifiedActivityEvent event) {
        super.beforeSend(event);

        // Auto-calculate isOwnAction if not set
        if (event.getIsOwnAction() == null) {
            event.calculateIsOwnAction();
        }

        log.debug("Sending unified activity event: entityType={}, action={}, actorUserId={}",
                event.getEntityType(), event.getAction(), event.getActorUserId());
    }
}
