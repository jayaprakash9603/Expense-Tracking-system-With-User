package com.jaya.monolith.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.messaging.TopicEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "kafka.enabled", havingValue = "false")
@Slf4j
public class InMemoryEventRouter {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired(required = false)
    private com.jaya.service.BulkExpenseBudgetService bulkExpenseBudgetService;

    @Autowired(required = false)
    private com.jaya.service.StoryService storyService;

    @Autowired(required = false)
    private com.jaya.service.AuditExpenseService auditExpenseService;

    @Async
    @EventListener
    public void routeEvent(TopicEvent event) {
        String topic = event.getTopic();
        Object payload = event.getPayload();

        log.debug("InMemoryEventRouter: routing event from topic '{}', payload type={}",
                topic, payload != null ? payload.getClass().getSimpleName() : "null");

        try {
            switch (topic) {
                case "expense-BudgetModel-linking-events" -> handleExpenseBudgetLinkingEvent(payload);
                case "expense-budget-linking-events" -> handleBudgetLinkingEvent(payload);
                case "BudgetModel-expense-events" -> handleBudgetExpenseEvent(payload);
                case "category-expense-events" -> handleCategoryExpenseEvent(payload);
                case "payment-method-events" -> handlePaymentMethodEvent(payload);
                case "expense-events" -> handleExpenseEvent(payload);
                case "budget-events" -> handleBudgetEvent(payload);
                case "bill-events" -> handleBillEvent(payload);
                case "audit-events" -> handleAuditEvent(payload);
                case "unified-activity-events" -> handleUnifiedActivityEvent(payload);
                case "friendship-events",
                     "friend-activity-events",
                     "friend-request-events",
                     "category-events",
                     "notification-events",
                     "story-creation-events" -> log.debug("Event on topic '{}' logged (no in-memory handler needed)", topic);
                default -> log.warn("InMemoryEventRouter: unhandled topic '{}'", topic);
            }
        } catch (Exception e) {
            log.error("InMemoryEventRouter: error routing event from topic '{}': {}", topic, e.getMessage(), e);
        }
    }

    private void handleExpenseBudgetLinkingEvent(Object payload) {
        if (bulkExpenseBudgetService == null) {
            log.debug("BulkExpenseBudgetService not available, skipping expense-budget linking event");
            return;
        }

        try {
            com.jaya.dto.ExpenseBudgetLinkingEvent event = convertPayload(payload, com.jaya.dto.ExpenseBudgetLinkingEvent.class);
            if (event == null) return;

            switch (event.getEventType()) {
                case EXPENSE_BUDGET_LINK_UPDATE -> {
                    if (event.getNewExpenseId() != null && event.getNewBudgetId() != null) {
                        bulkExpenseBudgetService.updateExpenseWithNewBudgetIds(
                                event.getNewExpenseId(),
                                java.util.Collections.singletonList(event.getNewBudgetId()),
                                event.getUserId().intValue());
                    }
                }
                case BUDGET_DELETED_REMOVE_FROM_EXPENSES -> {
                    if (event.getNewExpenseId() != null && event.getBudgetIdsToRemove() != null) {
                        bulkExpenseBudgetService.removeBudgetIdsFromExpense(
                                event.getNewExpenseId(),
                                event.getBudgetIdsToRemove(),
                                event.getUserId().intValue());
                    }
                }
                case BUDGET_EXPENSE_BATCH_LINK_UPDATE -> {
                    if (event.getExpenseIds() != null && event.getNewBudgetId() != null) {
                        bulkExpenseBudgetService.batchAddBudgetIdToExpenses(
                                event.getExpenseIds(),
                                event.getNewBudgetId(),
                                event.getUserId());
                    }
                }
                case BUDGET_EXPENSE_BATCH_REMOVE -> {
                    if (event.getExpenseIds() != null && event.getBudgetIdsToRemove() != null) {
                        bulkExpenseBudgetService.batchRemoveBudgetIdFromExpenses(
                                event.getExpenseIds(),
                                event.getBudgetIdsToRemove(),
                                event.getUserId());
                    }
                }
                default -> log.debug("Expense-service linking: unhandled event type {}", event.getEventType());
            }
        } catch (Exception e) {
            log.error("Error handling expense-budget linking event: {}", e.getMessage(), e);
        }
    }

    private void handleBudgetLinkingEvent(Object payload) {
        log.debug("Budget-linking event received (topic: expense-budget-linking-events). " +
                "In monolithic mode, budget service handles this directly.");
    }

    private void handleBudgetExpenseEvent(Object payload) {
        log.debug("Budget-expense event received (topic: BudgetModel-expense-events). " +
                "In monolithic mode, budget service handles this directly.");
    }

    private void handleCategoryExpenseEvent(Object payload) {
        log.debug("Category-expense event received. In monolithic mode, " +
                "category updates happen via direct service calls.");
    }

    private void handlePaymentMethodEvent(Object payload) {
        log.debug("Payment-method event received. In monolithic mode, " +
                "payment method updates happen via direct service calls.");
    }

    private void handleExpenseEvent(Object payload) {
        if (storyService == null) {
            log.debug("StoryService not available, skipping expense event for stories");
            return;
        }

        try {
            JsonNode event = toJsonNode(payload);
            if (event == null) return;

            String eventType = event.path("eventType").asText();
            if ("EXPENSE_SPIKE_DETECTED".equals(eventType)) {
                Integer userId = event.path("userId").asInt();
                String categoryName = event.path("categoryName").asText("Unknown");
                double currentAmount = event.path("currentAmount").asDouble();
                double averageAmount = event.path("averageAmount").asDouble();
                storyService.createExpenseSpikeStory(userId, categoryName, currentAmount, averageAmount);
            }
        } catch (Exception e) {
            log.error("Error handling expense event for stories: {}", e.getMessage(), e);
        }
    }

    private void handleBudgetEvent(Object payload) {
        if (storyService == null) {
            log.debug("StoryService not available, skipping budget event for stories");
            return;
        }

        try {
            JsonNode event = toJsonNode(payload);
            if (event == null) return;

            String eventType = event.path("eventType").asText();
            if (eventType.startsWith("BUDGET_THRESHOLD") || "BUDGET_EXCEEDED".equals(eventType)) {
                Integer userId = event.path("userId").asInt();
                Integer budgetId = event.path("budgetId").asInt();
                String budgetName = event.path("budgetName").asText();
                double percentage = event.path("percentage").asDouble();
                double amount = event.path("amount").asDouble();
                double spent = event.path("spent").asDouble();
                storyService.createBudgetThresholdStory(userId, budgetId, budgetName, percentage, amount, spent);
            }
        } catch (Exception e) {
            log.error("Error handling budget event for stories: {}", e.getMessage(), e);
        }
    }

    private void handleBillEvent(Object payload) {
        if (storyService == null) {
            log.debug("StoryService not available, skipping bill event for stories");
            return;
        }

        try {
            JsonNode event = toJsonNode(payload);
            if (event == null) return;

            String eventType = event.path("eventType").asText();
            if (eventType.contains("DUE") || "BILL_OVERDUE".equals(eventType)) {
                Integer userId = event.path("userId").asInt();
                Integer billId = event.path("billId").asInt();
                String billName = event.path("billName").asText();
                double amount = event.path("amount").asDouble();
                String dueDate = event.path("dueDate").asText();
                storyService.createBillReminderStory(userId, billId, billName, amount, dueDate);
            }
        } catch (Exception e) {
            log.error("Error handling bill event for stories: {}", e.getMessage(), e);
        }
    }

    private void handleAuditEvent(Object payload) {
        if (auditExpenseService == null) {
            log.debug("AuditExpenseService not available, skipping audit event");
            return;
        }

        try {
            com.jaya.models.AuditEvent auditEvent = convertPayload(payload, com.jaya.models.AuditEvent.class);
            if (auditEvent != null) {
                auditExpenseService.processAuditEvent(auditEvent);
            }
        } catch (Exception e) {
            log.error("Error handling audit event: {}", e.getMessage(), e);
        }
    }

    private void handleUnifiedActivityEvent(Object payload) {
        log.debug("Unified activity event received. In monolithic mode, " +
                "audit and friend activity events are handled via direct calls.");
    }

    @SuppressWarnings("unchecked")
    private <T> T convertPayload(Object payload, Class<T> type) {
        if (payload == null) return null;
        if (type.isInstance(payload)) return (T) payload;
        try {
            if (payload instanceof String) {
                return objectMapper.readValue((String) payload, type);
            }
            return objectMapper.convertValue(payload, type);
        } catch (Exception e) {
            log.error("Failed to convert payload to {}: {}", type.getSimpleName(), e.getMessage());
            return null;
        }
    }

    private JsonNode toJsonNode(Object payload) {
        if (payload == null) return null;
        try {
            if (payload instanceof String) {
                return objectMapper.readTree((String) payload);
            }
            return objectMapper.valueToTree(payload);
        } catch (Exception e) {
            log.error("Failed to convert payload to JsonNode: {}", e.getMessage());
            return null;
        }
    }
}
