package com.jaya.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.dto.events.*;
import com.jaya.service.processor.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
@Service
@RequiredArgsConstructor
@Slf4j
public class UnifiedActivityEventConsumer {

    private final ExpenseEventProcessor expenseEventProcessor;
    private final BudgetEventProcessor budgetEventProcessor;
    private final BillEventProcessor billEventProcessor;
    private final PaymentMethodEventProcessor paymentMethodEventProcessor;
    private final CategoryEventProcessor categoryEventProcessor;
    private final FriendActivityEventProcessor friendActivityEventProcessor;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${kafka.topics.unified-activity-events:unified-activity-events}", groupId = "notification-unified-batch-group", containerFactory = "notificationBatchFactory")
    @Transactional
    public void consumeUnifiedEventsBatch(List<Object> payloads) {
        if (payloads == null || payloads.isEmpty())
            return;

        long startTime = System.currentTimeMillis();
        log.info("📦 Received BATCH of {} unified activity events - processing...", payloads.size());

        List<UnifiedActivityEventDTO> parsed = new ArrayList<>(payloads.size());
        for (Object payload : payloads) {
            try {
                UnifiedActivityEventDTO event = convertToDto(payload, UnifiedActivityEventDTO.class);
                if (event != null) {
                    parsed.add(event);
                }
            } catch (Exception e) {
                log.error("Error parsing unified activity event in batch: {}", e.getMessage());
            }
        }

        if (parsed.isEmpty())
            return;

        int successCount = 0;
        int friendActivityCount = 0;
        int regularNotificationCount = 0;

        for (UnifiedActivityEventDTO event : parsed) {
            try {
                boolean processed = processUnifiedEvent(event);
                if (processed) {
                    successCount++;
                    if (event.shouldProcessAsFriendActivity()) {
                        friendActivityCount++;
                    } else {
                        regularNotificationCount++;
                    }
                }
            } catch (Exception e) {
                log.error("Error processing unified activity event: eventId={}, entityType={}, error={}",
                        event.getEventId(), event.getEntityType(), e.getMessage(), e);
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ Processed {}/{} unified events in {}ms (regular: {}, friendActivity: {})",
                successCount, payloads.size(), duration, regularNotificationCount, friendActivityCount);
    }

    private boolean processUnifiedEvent(UnifiedActivityEventDTO event) {
        log.debug("Processing unified event: eventId={}, entityType={}, action={}, isOwnAction={}",
                event.getEventId(), event.getEntityType(), event.getAction(), event.getIsOwnAction());

        if (event.shouldProcessAsFriendActivity()) {
            return processAsFriendActivity(event);
        }

        if (event.shouldProcessAsRegularNotification()) {
            return processAsRegularNotification(event);
        }

        log.debug("Event skipped (no notification required): eventId={}", event.getEventId());
        return false;
    }

    private boolean processAsFriendActivity(UnifiedActivityEventDTO event) {
        try {
            FriendActivityEventDTO friendEvent = convertToFriendActivityEvent(event);
            friendActivityEventProcessor.process(friendEvent);
            log.debug("Processed as friend activity: eventId={}", event.getEventId());
            return true;
        } catch (Exception e) {
            log.error("Failed to process as friend activity: eventId={}, error={}",
                    event.getEventId(), e.getMessage(), e);
            return false;
        }
    }

    private boolean processAsRegularNotification(UnifiedActivityEventDTO event) {
        try {
            String entityType = event.getEntityType();
            if (entityType == null) {
                log.warn("Entity type is null for event: {}", event.getEventId());
                return false;
            }

            switch (entityType.toUpperCase()) {
                case "EXPENSE":
                    expenseEventProcessor.process(convertToExpenseEvent(event));
                    break;
                case "BUDGET":
                    budgetEventProcessor.process(convertToBudgetEvent(event));
                    break;
                case "BILL":
                    billEventProcessor.process(convertToBillEvent(event));
                    break;
                case "CATEGORY":
                    categoryEventProcessor.process(convertToCategoryEvent(event));
                    break;
                case "PAYMENT_METHOD":
                    paymentMethodEventProcessor.process(convertToPaymentMethodEvent(event));
                    break;
                default:
                    log.warn("Unknown entity type: {} for event: {}", entityType, event.getEventId());
                    return false;
            }

            log.debug("Processed as regular notification: eventId={}, entityType={}",
                    event.getEventId(), entityType);
            return true;
        } catch (Exception e) {
            log.error("Failed to process as regular notification: eventId={}, error={}",
                    event.getEventId(), e.getMessage(), e);
            return false;
        }
    }

    private FriendActivityEventDTO convertToFriendActivityEvent(UnifiedActivityEventDTO event) {
        FriendActivityEventDTO.UserInfo actorUserInfo = null;
        if (event.getActorUser() != null) {
            UnifiedActivityEventDTO.UserInfo au = event.getActorUser();
            actorUserInfo = FriendActivityEventDTO.UserInfo.builder()
                    .id(au.getId())
                    .username(au.getUsername())
                    .email(au.getEmail())
                    .firstName(au.getFirstName())
                    .lastName(au.getLastName())
                    .fullName(au.getFullName())
                    .image(au.getImage())
                    .build();
        }

        FriendActivityEventDTO.UserInfo targetUserInfo = null;
        if (event.getTargetUser() != null) {
            UnifiedActivityEventDTO.UserInfo tu = event.getTargetUser();
            targetUserInfo = FriendActivityEventDTO.UserInfo.builder()
                    .id(tu.getId())
                    .username(tu.getUsername())
                    .email(tu.getEmail())
                    .firstName(tu.getFirstName())
                    .lastName(tu.getLastName())
                    .fullName(tu.getFullName())
                    .image(tu.getImage())
                    .build();
        }

        return FriendActivityEventDTO.builder()
                .targetUserId(event.getTargetUserId())
                .actorUserId(event.getActorUserId())
                .actorUserName(event.getActorUserName())
                .actorUser(actorUserInfo)
                .targetUser(targetUserInfo)
                .sourceService(mapSourceService(event.getSourceService()))
                .entityType(event.getEntityType())
                .entityId(event.getEntityId() != null ? event.getEntityId().intValue() : null)
                .action(event.getAction())
                .description(event.getDescription())
                .amount(event.getAmount() != null ? BigDecimal.valueOf(event.getAmount()) : null)
                .metadata(event.getMetadata())
                .entityPayload(event.getNewValues() != null ? event.getNewValues() : event.getEntityPayload())
                .previousEntityState(event.getOldValues())
                .timestamp(event.getTimestamp())
                .isRead(false)
                .build();
    }

    private ExpenseEventDTO convertToExpenseEvent(UnifiedActivityEventDTO event) {
        return ExpenseEventDTO.builder()
                .expenseId(event.getEntityId() != null ? event.getEntityId().intValue() : null)
                .userId(event.getTargetUserId())
                .action(event.getAction())
                .amount(event.getAmount())
                .description(event.getEntityName())
                .timestamp(event.getTimestamp())
                .metadata(event.getMetadata())
                .build();
    }

    private BudgetEventDTO convertToBudgetEvent(UnifiedActivityEventDTO event) {
        return BudgetEventDTO.builder()
                .budgetId(event.getEntityId() != null ? event.getEntityId().intValue() : null)
                .userId(event.getTargetUserId())
                .action(event.getAction())
                .budgetName(event.getEntityName())
                .amount(event.getAmount())
                .timestamp(event.getTimestamp())
            .metadata(event.getNewValues())
                .build();
    }

    private BillEventDTO convertToBillEvent(UnifiedActivityEventDTO event) {
        return BillEventDTO.builder()
                .billId(event.getEntityId() != null ? event.getEntityId().intValue() : null)
                .userId(event.getTargetUserId())
                .action(event.getAction())
                .name(event.getEntityName())
                .amount(event.getAmount())
                .timestamp(event.getTimestamp())
                .metadata(event.getMetadata())
                .build();
    }

    private CategoryEventDTO convertToCategoryEvent(UnifiedActivityEventDTO event) {
        return CategoryEventDTO.builder()
                .categoryId(event.getEntityId() != null ? event.getEntityId().intValue() : null)
                .userId(event.getTargetUserId())
                .action(event.getAction())
                .categoryName(event.getEntityName())
                .timestamp(event.getTimestamp())
                .metadata(event.getMetadata() != null ? event.getMetadata().toString() : null)
                .build();
    }

    private PaymentMethodEventDTO convertToPaymentMethodEvent(UnifiedActivityEventDTO event) {
        return PaymentMethodEventDTO.builder()
                .userId(event.getTargetUserId())
                .eventType(event.getAction())
                .paymentMethodName(event.getEntityName())
                .build();
    }

    private String mapSourceService(String sourceService) {
        if (sourceService == null)
            return "UNKNOWN";

        return sourceService
                .replace("-SERVICE", "")
                .replace("-", "_");
    }

    private <T> T convertToDto(Object payload, Class<T> dtoClass) {
        try {
            if (payload instanceof Map) {
                return objectMapper.convertValue(payload, dtoClass);
            }
            if (dtoClass.isInstance(payload)) {
                return dtoClass.cast(payload);
            }
            throw new IllegalArgumentException("Unsupported payload type: " + payload.getClass().getName());
        } catch (Exception e) {
            log.error("Failed to convert payload to {}: {}", dtoClass.getSimpleName(), e.getMessage());
            return null;
        }
    }
}
