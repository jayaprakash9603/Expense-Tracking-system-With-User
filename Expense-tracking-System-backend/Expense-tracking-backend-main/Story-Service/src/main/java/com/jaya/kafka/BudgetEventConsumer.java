package com.jaya.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.service.StoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Kafka consumer for Budget-related events
 * Listens to budget-events topic and generates stories for budget threshold
 * alerts
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BudgetEventConsumer {

    private final StoryService storyService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${kafka.topics.budget-events:budget-events}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeBudgetEvent(String message) {
        log.debug("Received budget event: {}", message);

        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.path("eventType").asText();

            switch (eventType) {
                case "BUDGET_THRESHOLD_80":
                case "BUDGET_THRESHOLD_90":
                case "BUDGET_THRESHOLD_100":
                case "BUDGET_EXCEEDED":
                    handleBudgetThreshold(event);
                    break;

                case "BUDGET_CREATED":
                    handleBudgetCreated(event);
                    break;

                case "BUDGET_UPDATED":
                    handleBudgetUpdated(event);
                    break;

                default:
                    log.debug("Unhandled budget event type: {}", eventType);
            }
        } catch (Exception e) {
            log.error("Error processing budget event: {}", message, e);
        }
    }

    private void handleBudgetThreshold(JsonNode event) {
        try {
            Integer userId = event.path("userId").asInt();
            Integer budgetId = event.path("budgetId").asInt();
            String budgetName = event.path("budgetName").asText("Budget");
            double percentage = event.path("percentageUsed").asDouble();
            double amount = event.path("budgetAmount").asDouble();
            double spent = event.path("spentAmount").asDouble();

            log.info("Processing budget threshold event: user={}, budget={}, percentage={}%",
                    userId, budgetId, percentage);

            storyService.createBudgetThresholdStory(userId, budgetId, budgetName,
                    percentage, amount, spent);

        } catch (Exception e) {
            log.error("Error handling budget threshold event", e);
        }
    }

    private void handleBudgetCreated(JsonNode event) {
        log.debug("Budget created event received - no story generated for this event type");
        // Could create a "Budget created successfully!" story if desired
    }

    private void handleBudgetUpdated(JsonNode event) {
        log.debug("Budget updated event received - no story generated for this event type");
        // Could create a notification story if desired
    }
}
