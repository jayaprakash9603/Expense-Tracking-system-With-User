package com.jaya.kafka.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.UnifiedActivityEvent;
import com.jaya.kafka.events.UnifiedActivityEvent.UserInfo;
import com.jaya.kafka.producer.UnifiedActivityEventProducer;
import com.jaya.models.Bill;
import com.jaya.models.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UnifiedActivityService {

    private final UnifiedActivityEventProducer eventProducer;
    private final ObjectMapper objectMapper;

    @Async("friendActivityExecutor")
    public void sendBillCreatedEvent(Bill bill, UserDto actorUser, UserDto targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Bill '%s' created for $%.2f", bill.getName(), bill.getAmount())
                    : String.format("%s created bill '%s' with amount $%.2f", actorName, bill.getName(),
                            bill.getAmount());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.BILL)
                    .entityId(bill.getId().longValue())
                    .entityName(bill.getName())
                    .action(UnifiedActivityEvent.Action.CREATE)
                    .description(description)
                    .amount(bill.getAmount())
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorEmail(actorUser.getEmail())
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.BILL_SERVICE)
                    .newValues(buildBillPayload(bill))
                    .entityPayload(buildBillPayload(bill))
                    .metadata(buildBillMetadata(bill))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Bill CREATED - billId={}, actorId={}, targetId={}, isOwnAction={}",
                    bill.getId(), actorUser.getId(), targetUser.getId(), isOwnAction);

        } catch (Exception e) {
            log.error("Failed to send bill created event: {}", e.getMessage(), e);
        }
    }

    @Async("friendActivityExecutor")
    public void sendBulkBillsCreatedEvent(List<Bill> bills, UserDto actorUser, UserDto targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);
            double totalAmount = bills.stream().mapToDouble(Bill::getAmount).sum();

            String description = isOwnAction
                    ? String.format("Created %d bills with total amount $%.2f", bills.size(), totalAmount)
                    : String.format("%s created %d bills with total amount $%.2f", actorName, bills.size(),
                            totalAmount);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.BILL)
                    .entityName("Bulk Bills")
                    .action(UnifiedActivityEvent.Action.CREATE)
                    .description(description)
                    .amount(totalAmount)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.BILL_SERVICE)
                    .metadata(String.format("{\"count\": %d, \"totalAmount\": %.2f}", bills.size(), totalAmount))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Bulk Bills CREATED - count={}, actorId={}, targetId={}",
                    bills.size(), actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send bulk bills created event: {}", e.getMessage(), e);
        }
    }

    @Async("friendActivityExecutor")
    public void sendBillUpdatedEvent(Bill bill, Bill oldBill, UserDto actorUser, UserDto targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Bill '%s' updated", bill.getName())
                    : String.format("%s updated bill '%s'", actorName, bill.getName());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.BILL)
                    .entityId(bill.getId().longValue())
                    .entityName(bill.getName())
                    .action(UnifiedActivityEvent.Action.UPDATE)
                    .description(description)
                    .amount(bill.getAmount())
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.BILL_SERVICE)
                    .oldValues(oldBill != null ? buildBillPayload(oldBill) : null)
                    .newValues(buildBillPayload(bill))
                    .entityPayload(buildBillPayload(bill))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Bill UPDATED - billId={}, actorId={}, targetId={}",
                    bill.getId(), actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send bill updated event: {}", e.getMessage(), e);
        }
    }

    @Async("friendActivityExecutor")
    public void sendBillDeletedEvent(Integer billId, String billName, Double amount, UserDto actorUser,
            UserDto targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Bill '%s' deleted", billName)
                    : String.format("%s deleted bill '%s'", actorName, billName);

            Map<String, Object> oldValues = new HashMap<>();
            oldValues.put("id", billId);
            oldValues.put("name", billName);
            if (amount != null)
                oldValues.put("amount", amount);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.BILL)
                    .entityId(billId.longValue())
                    .entityName(billName)
                    .action(UnifiedActivityEvent.Action.DELETE)
                    .description(description)
                    .amount(amount)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.BILL_SERVICE)
                    .oldValues(oldValues)
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Bill DELETED - billId={}, actorId={}, targetId={}",
                    billId, actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send bill deleted event: {}", e.getMessage(), e);
        }
    }

    @Async("friendActivityExecutor")
    public void sendAllBillsDeletedEvent(int count, UserDto actorUser, UserDto targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("All %d bills deleted", count)
                    : String.format("%s deleted all %d bills", actorName, count);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.BILL)
                    .entityName("All Bills")
                    .action(UnifiedActivityEvent.Action.DELETE)
                    .description(description)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.BILL_SERVICE)
                    .metadata(String.format("{\"deletedCount\": %d}", count))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: All Bills DELETED - count={}, actorId={}, targetId={}",
                    count, actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send all bills deleted event: {}", e.getMessage(), e);
        }
    }

    private UserInfo buildUserInfo(UserDto user) {
        if (user == null)
            return null;

        String fullName = buildFullName(user);
        return UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(fullName)
                .image(user.getImage())
                .build();
    }

    private String buildFullName(UserDto user) {
        if (user == null)
            return null;
        if (user.getFirstName() != null && user.getLastName() != null) {
            return user.getFirstName() + " " + user.getLastName();
        }
        if (user.getFirstName() != null) {
            return user.getFirstName();
        }
        return user.getUsername();
    }

    private String getDisplayName(UserDto user) {
        if (user == null)
            return "Unknown";
        String fullName = buildFullName(user);
        if (fullName != null && !fullName.isEmpty()) {
            return fullName;
        }
        return user.getUsername() != null ? user.getUsername() : user.getEmail();
    }

    private Map<String, Object> buildBillPayload(Bill bill) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", bill.getId());
        payload.put("name", bill.getName());
        payload.put("amount", bill.getAmount());
        payload.put("category", bill.getCategory());
        payload.put("description", bill.getDescription());
        payload.put("date", bill.getDate() != null ? bill.getDate().toString() : null);
        payload.put("paymentMethod", bill.getPaymentMethod());
        payload.put("type", bill.getType());
        payload.put("netAmount", bill.getNetAmount());
        payload.put("includeInBudget", bill.isIncludeInBudget());
        return payload;
    }

    private String buildBillMetadata(Bill bill) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("category", bill.getCategory());
            metadata.put("paymentMethod", bill.getPaymentMethod());
            metadata.put("type", bill.getType());
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            return "{}";
        }
    }
}
