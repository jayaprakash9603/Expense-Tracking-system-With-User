package com.jaya.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.service.StoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;





@Component
@RequiredArgsConstructor
@Slf4j
public class ExpenseEventConsumer {

    private final StoryService storyService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${kafka.topics.expense-events:expense-events}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeExpenseEvent(String message) {
        log.debug("Received expense event: {}", message);

        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.path("eventType").asText();

            switch (eventType) {
                case "EXPENSE_SPIKE_DETECTED":
                    handleExpenseSpike(event);
                    break;

                case "LARGE_EXPENSE_ADDED":
                    handleLargeExpense(event);
                    break;

                case "RECURRING_EXPENSE_DETECTED":
                    handleRecurringExpense(event);
                    break;

                default:
                    log.debug("Unhandled expense event type: {}", eventType);
            }
        } catch (Exception e) {
            log.error("Error processing expense event: {}", message, e);
        }
    }

    private void handleExpenseSpike(JsonNode event) {
        try {
            Integer userId = event.path("userId").asInt();
            String categoryName = event.path("categoryName").asText("Unknown");
            double currentAmount = event.path("currentAmount").asDouble();
            double averageAmount = event.path("averageAmount").asDouble();

            log.info("Processing expense spike event: user={}, category={}", userId, categoryName);

            storyService.createExpenseSpikeStory(userId, categoryName, currentAmount, averageAmount);

        } catch (Exception e) {
            log.error("Error handling expense spike event", e);
        }
    }

    private void handleLargeExpense(JsonNode event) {
        log.debug("Large expense event received - could create alert story if desired");
        
    }

    private void handleRecurringExpense(JsonNode event) {
        log.debug("Recurring expense detected - could create insight story if desired");
        
    }
}
