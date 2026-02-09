package com.jaya.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.service.StoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;






@Component
@RequiredArgsConstructor
@Slf4j
public class BillEventConsumer {

    private final StoryService storyService;
    private final ObjectMapper objectMapper;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    @KafkaListener(topics = "${kafka.topics.bill-events:bill-events}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeBillEvent(String message) {
        log.debug("Received bill event: {}", message);

        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.path("eventType").asText();

            switch (eventType) {
                case "BILL_DUE_SOON":
                case "BILL_DUE_TOMORROW":
                case "BILL_DUE_TODAY":
                    handleBillReminder(event);
                    break;

                case "BILL_OVERDUE":
                    handleBillOverdue(event);
                    break;

                case "BILL_PAID":
                    handleBillPaid(event);
                    break;

                default:
                    log.debug("Unhandled bill event type: {}", eventType);
            }
        } catch (Exception e) {
            log.error("Error processing bill event: {}", message, e);
        }
    }

    private void handleBillReminder(JsonNode event) {
        try {
            Integer userId = event.path("userId").asInt();
            Integer billId = event.path("billId").asInt();
            String billName = event.path("billName").asText("Bill");
            double amount = event.path("amount").asDouble();
            String dueDate = event.path("dueDate").asText();

            log.info("Processing bill reminder event: user={}, bill={}", userId, billId);

            storyService.createBillReminderStory(userId, billId, billName, amount, dueDate);

        } catch (Exception e) {
            log.error("Error handling bill reminder event", e);
        }
    }

    private void handleBillOverdue(JsonNode event) {
        try {
            Integer userId = event.path("userId").asInt();
            Integer billId = event.path("billId").asInt();
            String billName = event.path("billName").asText("Bill");
            double amount = event.path("amount").asDouble();
            String dueDate = event.path("dueDate").asText();

            log.info("Processing bill overdue event: user={}, bill={}", userId, billId);

            
            storyService.createBillReminderStory(userId, billId,
                    "⚠️ OVERDUE: " + billName, amount, dueDate);

        } catch (Exception e) {
            log.error("Error handling bill overdue event", e);
        }
    }

    private void handleBillPaid(JsonNode event) {
        log.debug("Bill paid event received - could create confirmation story if desired");
        
    }
}
