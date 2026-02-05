package com.jaya.kafka.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.BillNotificationEvent;
import com.jaya.kafka.producer.BillNotificationProducer;
import com.jaya.models.Bill;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillNotificationService {

    private final BillNotificationProducer billNotificationProducer;
    private final ObjectMapper objectMapper;

    public void sendBillCreatedNotification(Bill bill) {
        try {
            BillNotificationEvent event = buildBillEvent(
                    bill,
                    BillNotificationEvent.Action.CREATE);

            billNotificationProducer.sendEvent(event);
            log.info("Sent bill created notification for billId: {}, userId: {}",
                    bill.getId(), bill.getUserId());
        } catch (Exception e) {
            log.error("Failed to send bill created notification for billId: {}",
                    bill.getId(), e);
        }
    }

    public void sendBillUpdatedNotification(Bill bill) {
        try {
            BillNotificationEvent event = buildBillEvent(
                    bill,
                    BillNotificationEvent.Action.UPDATE);

            billNotificationProducer.sendEvent(event);
            log.info("Sent bill updated notification for billId: {}, userId: {}",
                    bill.getId(), bill.getUserId());
        } catch (Exception e) {
            log.error("Failed to send bill updated notification for billId: {}",
                    bill.getId(), e);
        }
    }

    public void sendBillDeletedNotification(Integer billId, Integer userId, String billName) {
        try {
            BillNotificationEvent event = BillNotificationEvent.builder()
                    .billId(billId)
                    .userId(userId)
                    .action(BillNotificationEvent.Action.DELETE)
                    .name(billName)
                    .timestamp(LocalDateTime.now())
                    .build();

            billNotificationProducer.sendEvent(event);
            log.info("Sent bill deleted notification for billId: {}, userId: {}",
                    billId, userId);
        } catch (Exception e) {
            log.error("Failed to send bill deleted notification for billId: {}",
                    billId, e);
        }
    }

    public void sendBillPaidNotification(Bill bill) {
        try {
            BillNotificationEvent event = buildBillEvent(
                    bill,
                    BillNotificationEvent.Action.PAID);

            billNotificationProducer.sendEvent(event);
            log.info("Sent bill paid notification for billId: {}, userId: {}",
                    bill.getId(), bill.getUserId());
        } catch (Exception e) {
            log.error("Failed to send bill paid notification for billId: {}",
                    bill.getId(), e);
        }
    }

    public void sendBillReminderNotification(Bill bill) {
        try {
            BillNotificationEvent event = buildBillEvent(
                    bill,
                    BillNotificationEvent.Action.REMINDER);

            billNotificationProducer.sendEvent(event);
            log.info("Sent bill reminder notification for billId: {}, userId: {}",
                    bill.getId(), bill.getUserId());
        } catch (Exception e) {
            log.error("Failed to send bill reminder notification for billId: {}",
                    bill.getId(), e);
        }
    }

    public void sendBillOverdueNotification(Bill bill) {
        try {
            BillNotificationEvent event = buildBillEvent(
                    bill,
                    BillNotificationEvent.Action.OVERDUE);

            billNotificationProducer.sendEvent(event);
            log.info("Sent bill overdue notification for billId: {}, userId: {}",
                    bill.getId(), bill.getUserId());
        } catch (Exception e) {
            log.error("Failed to send bill overdue notification for billId: {}",
                    bill.getId(), e);
        }
    }

    private BillNotificationEvent buildBillEvent(Bill bill, String action) {
        BillNotificationEvent.BillNotificationEventBuilder builder = BillNotificationEvent.builder()
                .billId(bill.getId())
                .userId(bill.getUserId())
                .action(action)
                .name(bill.getName())
                .description(bill.getDescription())
                .amount(bill.getAmount())
                .paymentMethod(bill.getPaymentMethod())
                .type(bill.getType())
                .dueDate(bill.getDate())
                .timestamp(LocalDateTime.now());

        if (bill.getCategory() != null && !bill.getCategory().isEmpty()) {
            builder.category(bill.getCategory());
        }

        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("billDate", bill.getDate());
            metadata.put("categoryId", bill.getCategoryId());
            metadata.put("includeInBudget", bill.isIncludeInBudget());
            metadata.put("netAmount", bill.getNetAmount());
            metadata.put("creditDue", bill.getCreditDue());
            metadata.put("expenseId", bill.getExpenseId());
            metadata.put("budgetIds", bill.getBudgetIds());

            if (bill.getExpenses() != null) {
                metadata.put("expenseCount", bill.getExpenses().size());
            }

            String metadataJson = objectMapper.writeValueAsString(metadata);
            builder.metadata(metadataJson);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize metadata for bill {}: {}", bill.getId(), e.getMessage());
        }

        return builder.build();
    }
}
