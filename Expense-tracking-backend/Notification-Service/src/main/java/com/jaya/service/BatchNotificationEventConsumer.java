package com.jaya.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.dto.events.*;
import com.jaya.service.processor.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BatchNotificationEventConsumer {

    private final ExpenseEventProcessor expenseEventProcessor;
    private final BudgetEventProcessor budgetEventProcessor;
    private final BillEventProcessor billEventProcessor;
    private final PaymentMethodEventProcessor paymentMethodEventProcessor;
    private final FriendEventProcessor friendEventProcessor;
    private final CategoryEventProcessor categoryEventProcessor;
    private final FriendActivityEventProcessor friendActivityEventProcessor;
    private final ObjectMapper objectMapper;

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

    @KafkaListener(topics = "${kafka.topics.expense-events:expense-events}", groupId = "notification-expense-batch-group", containerFactory = "notificationBatchFactory")
    @Transactional
    public void consumeExpenseEventsBatch(List<Object> payloads) {
        if (payloads == null || payloads.isEmpty())
            return;

        long startTime = System.currentTimeMillis();
        log.info("📦 Received BATCH of {} expense events - processing...", payloads.size());

        List<ExpenseEventDTO> parsed = new ArrayList<>(payloads.size());
        for (Object payload : payloads) {
            try {
                ExpenseEventDTO event = convertToDto(payload, ExpenseEventDTO.class);
                if (event != null) {
                    parsed.add(event);
                }
            } catch (Exception e) {
                log.error("Error parsing expense event in batch", e);
            }
        }

        if (parsed.isEmpty())
            return;

        int successCount = 0;
        for (ExpenseEventDTO event : parsed) {
            try {
                expenseEventProcessor.process(event);
                successCount++;
            } catch (Exception e) {
                log.error("Error processing expense event for user {}: {}",
                        event.getUserId(), e.getMessage(), e);
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ Successfully processed {}/{} expense events in {}ms (avg: {}ms per event)",
                successCount, payloads.size(), duration, duration / Math.max(1, successCount));
    }

    @KafkaListener(topics = "${kafka.topics.budget-events:budget-events}", groupId = "notification-budget-batch-group", containerFactory = "notificationBatchFactory")
    @Transactional
    public void consumeBudgetEventsBatch(List<Object> payloads) {
        if (payloads == null || payloads.isEmpty())
            return;

        long startTime = System.currentTimeMillis();
        log.info("📦 Received BATCH of {} budget events - processing...", payloads.size());

        List<BudgetEventDTO> parsed = new ArrayList<>(payloads.size());
        for (Object payload : payloads) {
            try {
                BudgetEventDTO event = convertToDto(payload, BudgetEventDTO.class);
                if (event != null) {
                    parsed.add(event);
                }
            } catch (Exception e) {
                log.error("Error parsing budget event in batch", e);
            }
        }

        if (parsed.isEmpty())
            return;

        int successCount = 0;
        for (BudgetEventDTO event : parsed) {
            try {
                budgetEventProcessor.process(event);
                successCount++;
            } catch (Exception e) {
                log.error("Error processing budget event for user {}: {}",
                        event.getUserId(), e.getMessage(), e);
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ Successfully processed {}/{} budget events in {}ms (avg: {}ms per event)",
                successCount, payloads.size(), duration, duration / Math.max(1, successCount));
    }

    @KafkaListener(topics = "${kafka.topics.bill-events:bill-events}", groupId = "notification-bill-batch-group", containerFactory = "notificationBatchFactory")
    @Transactional
    public void consumeBillEventsBatch(List<Object> payloads) {
        if (payloads == null || payloads.isEmpty())
            return;

        long startTime = System.currentTimeMillis();
        log.info("📦 Received BATCH of {} bill events - processing...", payloads.size());

        List<BillEventDTO> parsed = new ArrayList<>(payloads.size());
        for (Object payload : payloads) {
            try {
                BillEventDTO event = convertToDto(payload, BillEventDTO.class);
                if (event != null) {
                    parsed.add(event);
                }
            } catch (Exception e) {
                log.error("Error parsing bill event in batch", e);
            }
        }

        if (parsed.isEmpty())
            return;

        int successCount = 0;
        for (BillEventDTO event : parsed) {
            try {
                billEventProcessor.process(event);
                successCount++;
            } catch (Exception e) {
                log.error("Error processing bill event for user {}: {}",
                        event.getUserId(), e.getMessage(), e);
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ Successfully processed {}/{} bill events in {}ms (avg: {}ms per event)",
                successCount, payloads.size(), duration, duration / Math.max(1, successCount));
    }

    @KafkaListener(topics = "${kafka.topics.payment-method-events:payment-method-events}", groupId = "notification-payment-method-batch-group", containerFactory = "notificationBatchFactory")
    @Transactional
    public void consumePaymentMethodEventsBatch(List<Object> payloads) {
        if (payloads == null || payloads.isEmpty())
            return;

        long startTime = System.currentTimeMillis();
        log.info("📦 Received BATCH of {} payment method events - processing...", payloads.size());

        List<PaymentMethodEventDTO> parsed = new ArrayList<>(payloads.size());
        for (Object payload : payloads) {
            try {
                PaymentMethodEventDTO event = convertToDto(payload, PaymentMethodEventDTO.class);
                if (event != null) {
                    parsed.add(event);
                }
            } catch (Exception e) {
                log.error("Error parsing payment method event in batch", e);
            }
        }

        if (parsed.isEmpty())
            return;

        int successCount = 0;
        for (PaymentMethodEventDTO event : parsed) {
            try {
                paymentMethodEventProcessor.process(event);
                successCount++;
            } catch (Exception e) {
                log.error("Error processing payment method event for user {}: {}",
                        event.getUserId(), e.getMessage(), e);
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ Successfully processed {}/{} payment method events in {}ms (avg: {}ms per event)",
                successCount, payloads.size(), duration, duration / Math.max(1, successCount));
    }

    @KafkaListener(topics = "${kafka.topics.category-events:category-events}", groupId = "notification-category-batch-group", containerFactory = "notificationBatchFactory")
    @Transactional
    public void consumeCategoryEventsBatch(List<Object> payloads) {
        if (payloads == null || payloads.isEmpty())
            return;

        long startTime = System.currentTimeMillis();
        log.info("📦 Received BATCH of {} category events - processing...", payloads.size());

        List<CategoryEventDTO> parsed = new ArrayList<>(payloads.size());
        for (Object payload : payloads) {
            try {
                CategoryEventDTO event = convertToDto(payload, CategoryEventDTO.class);
                if (event != null) {
                    parsed.add(event);
                }
            } catch (Exception e) {
                log.error("Error parsing category event in batch", e);
            }
        }

        if (parsed.isEmpty())
            return;

        int successCount = 0;
        for (CategoryEventDTO event : parsed) {
            try {
                categoryEventProcessor.process(event);
                successCount++;
            } catch (Exception e) {
                log.error("Error processing category event for user {}: {}",
                        event.getUserId(), e.getMessage(), e);
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ Successfully processed {}/{} category events in {}ms (avg: {}ms per event)",
                successCount, payloads.size(), duration, duration / Math.max(1, successCount));
    }

    @KafkaListener(topics = {
            "${kafka.topics.friend-events:friend-events}",
            "${kafka.topics.friendship-events:friendship-events}"
    }, groupId = "notification-friend-batch-group", containerFactory = "notificationBatchFactory")
    @Transactional
    public void consumeFriendEventsBatch(List<Object> payloads) {
        if (payloads == null || payloads.isEmpty())
            return;

        long startTime = System.currentTimeMillis();
        log.info("📦 Received BATCH of {} friend events - processing...", payloads.size());

        List<FriendEventDTO> parsed = new ArrayList<>(payloads.size());
        for (Object payload : payloads) {
            try {
                FriendEventDTO event = convertToDto(payload, FriendEventDTO.class);
                if (event != null) {
                    parsed.add(event);
                }
            } catch (Exception e) {
                log.error("Error parsing friend event in batch", e);
            }
        }

        if (parsed.isEmpty())
            return;

        int successCount = 0;
        for (FriendEventDTO event : parsed) {
            try {
                friendEventProcessor.process(event);
                successCount++;
            } catch (Exception e) {
                log.error("Error processing friend event for user {}: {}",
                        event.getUserId(), e.getMessage(), e);
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ Successfully processed {}/{} friend events in {}ms (avg: {}ms per event)",
                successCount, payloads.size(), duration, duration / Math.max(1, successCount));
    }

    @KafkaListener(topics = "${kafka.topics.friend-request-events:friend-request-events}", groupId = "notification-friend-request-batch-group", containerFactory = "notificationBatchFactory")
    @Transactional
    public void consumeFriendRequestEventsBatch(List<Object> payloads) {
        if (payloads == null || payloads.isEmpty())
            return;

        long startTime = System.currentTimeMillis();
        log.info("📦 Received BATCH of {} friend request events - processing...", payloads.size());

        List<FriendRequestEventDTO> parsed = new ArrayList<>(payloads.size());
        for (Object payload : payloads) {
            try {
                FriendRequestEventDTO event = convertToDto(payload, FriendRequestEventDTO.class);
                if (event != null) {
                    parsed.add(event);
                }
            } catch (Exception e) {
                log.error("Error parsing friend request event in batch", e);
            }
        }

        if (parsed.isEmpty())
            return;

        int successCount = 0;
        for (FriendRequestEventDTO event : parsed) {
            try {
                FriendEventDTO friendEvent = convertToFriendEvent(event);
                friendEventProcessor.process(friendEvent);
                successCount++;
            } catch (Exception e) {
                log.error("Error processing friend request event: {}", e.getMessage(), e);
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ Successfully processed {}/{} friend request events in {}ms (avg: {}ms per event)",
                successCount, payloads.size(), duration, duration / Math.max(1, successCount));
    }

    private FriendEventDTO convertToFriendEvent(FriendRequestEventDTO requestEvent) {
        Integer userId;
        Integer friendId;
        String friendName;
        String action;

        switch (requestEvent.getEventType()) {
            case "FRIEND_REQUEST_SENT":
                userId = requestEvent.getRecipientId();
                friendId = requestEvent.getRequesterId();
                friendName = requestEvent.getRequesterName();
                action = "REQUEST_RECEIVED";
                break;

            case "FRIEND_REQUEST_ACCEPTED":
                userId = requestEvent.getRequesterId();
                friendId = requestEvent.getRecipientId();
                friendName = requestEvent.getRecipientName();
                action = "REQUEST_ACCEPTED";
                break;

            case "FRIEND_REQUEST_REJECTED":
                userId = requestEvent.getRequesterId();
                friendId = requestEvent.getRecipientId();
                friendName = requestEvent.getRecipientName();
                action = "REQUEST_REJECTED";
                break;

            default:
                userId = requestEvent.getRecipientId();
                friendId = requestEvent.getRequesterId();
                friendName = requestEvent.getRequesterName();
                action = "REQUEST_RECEIVED";
        }

        return FriendEventDTO.builder()
                .friendshipId(requestEvent.getFriendshipId())
                .userId(userId)
                .friendId(friendId)
                .action(action)
                .friendName(friendName)
                .friendEmail(userId.equals(requestEvent.getRecipientId())
                        ? requestEvent.getRequesterEmail()
                        : requestEvent.getRecipientEmail())
                .friendProfileImage(userId.equals(requestEvent.getRecipientId())
                        ? requestEvent.getRequesterImage()
                        : requestEvent.getRecipientImage())
                .timestamp(requestEvent.getTimestamp())
                .metadata(requestEvent.getMessage())
                .build();
    }

    @KafkaListener(topics = "${kafka.topics.friend-activity-events:friend-activity-events}", groupId = "notification-friend-activity-batch-group", containerFactory = "notificationBatchFactory")
    @Transactional
    public void consumeFriendActivityEventsBatch(List<Object> payloads) {
        if (payloads == null || payloads.isEmpty())
            return;

        long startTime = System.currentTimeMillis();
        log.info("📦 Received BATCH of {} friend activity events - processing...", payloads.size());

        List<FriendActivityEventDTO> parsed = new ArrayList<>(payloads.size());
        for (Object payload : payloads) {
            try {
                FriendActivityEventDTO event = convertToDto(payload, FriendActivityEventDTO.class);
                if (event != null) {
                    parsed.add(event);
                }
            } catch (Exception e) {
                log.error("Error parsing friend activity event in batch", e);
            }
        }

        if (parsed.isEmpty())
            return;

        int successCount = 0;
        for (FriendActivityEventDTO event : parsed) {
            try {
                friendActivityEventProcessor.process(event);
                successCount++;
            } catch (Exception e) {
                log.error("Error processing friend activity event for user {}: {}",
                        event.getTargetUserId(), e.getMessage(), e);
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ Processed BATCH: {} friend activity events in {} ms (success: {})",
                parsed.size(), duration, successCount);
    }
}
