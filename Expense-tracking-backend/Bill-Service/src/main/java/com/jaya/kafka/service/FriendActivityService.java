package com.jaya.kafka.service;

import com.jaya.kafka.events.FriendActivityEvent;
import com.jaya.kafka.producer.FriendActivityProducer;
import com.jaya.models.Bill;
import com.jaya.common.dto.UserDTO;
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
public class FriendActivityService {

    private final FriendActivityProducer friendActivityProducer;

    @Async("friendActivityExecutor")
    public void sendBillCreatedByFriend(Bill bill, Integer targetUserId, UserDTO actorUser) {
        sendBillCreatedByFriendInternal(bill, targetUserId, actorUser, null);
    }

    @Async("friendActivityExecutor")
    public void sendBillCreatedByFriend(Bill bill, Integer targetUserId, UserDTO actorUser, UserDTO targetUser) {
        sendBillCreatedByFriendInternal(bill, targetUserId, actorUser, targetUser);
    }

    private void sendBillCreatedByFriendInternal(Bill bill, Integer targetUserId, UserDTO actorUser,
            UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                log.debug("Skipping friend activity notification - user creating own bill");
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.BILL)
                    .entityType(FriendActivityEvent.EntityType.BILL)
                    .entityId(bill.getId())
                    .action(FriendActivityEvent.Action.CREATE)
                    .description(String.format("%s created bill '%s' with amount $%.2f",
                            actorName, bill.getName(), bill.getAmount()))
                    .amount(bill.getAmount())
                    .metadata(buildBillMetadata(bill))
                    .entityPayload(buildBillPayload(bill))
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);
            log.info("Friend activity event sent: {} created bill {} for user {}",
                    actorUser.getId(), bill.getId(), targetUserId);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bill creation: {}", e.getMessage(), e);
        }
    }

    @Async("friendActivityExecutor")
    public void sendBulkBillsCreatedByFriend(List<Bill> bills, Integer targetUserId, UserDTO actorUser) {
        sendBulkBillsCreatedByFriendInternal(bills, targetUserId, actorUser, null);
    }

    @Async("friendActivityExecutor")
    public void sendBulkBillsCreatedByFriend(List<Bill> bills, Integer targetUserId, UserDTO actorUser,
            UserDTO targetUser) {
        sendBulkBillsCreatedByFriendInternal(bills, targetUserId, actorUser, targetUser);
    }

    private void sendBulkBillsCreatedByFriendInternal(List<Bill> bills, Integer targetUserId, UserDTO actorUser,
            UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);
            double totalAmount = bills.stream().mapToDouble(Bill::getAmount).sum();

            Map<String, Object> bulkPayload = new HashMap<>();
            bulkPayload.put("billCount", bills.size());
            bulkPayload.put("totalAmount", totalAmount);
            bulkPayload.put("bills", bills.stream().map(this::buildBillPayload).toList());

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.BILL)
                    .entityType(FriendActivityEvent.EntityType.BILL)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.CREATE)
                    .description(String.format("%s created %d bills totaling $%.2f",
                            actorName, bills.size(), totalAmount))
                    .amount(totalAmount)
                    .entityPayload(bulkPayload)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bulk bill creation: {}", e.getMessage(), e);
        }
    }

    @Async("friendActivityExecutor")
    public void sendBillUpdatedByFriend(Bill bill, Integer targetUserId, UserDTO actorUser) {
        sendBillUpdatedByFriendInternal(bill, null, targetUserId, actorUser, null);
    }

    @Async("friendActivityExecutor")
    public void sendBillUpdatedByFriend(Bill bill, Bill previousBill, Integer targetUserId, UserDTO actorUser,
            UserDTO targetUser) {
        sendBillUpdatedByFriendInternal(bill, previousBill, targetUserId, actorUser, targetUser);
    }

    private void sendBillUpdatedByFriendInternal(Bill bill, Bill previousBill, Integer targetUserId, UserDTO actorUser,
            UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.BILL)
                    .entityType(FriendActivityEvent.EntityType.BILL)
                    .entityId(bill.getId())
                    .action(FriendActivityEvent.Action.UPDATE)
                    .description(String.format("%s updated bill '%s'", actorName, bill.getName()))
                    .amount(bill.getAmount())
                    .entityPayload(buildBillPayload(bill))
                    .previousEntityState(previousBill != null ? buildBillPayload(previousBill) : null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bill update: {}", e.getMessage(), e);
        }
    }

    @Async("friendActivityExecutor")
    public void sendBillDeletedByFriend(Integer billId, String billName, Double amount,
            Integer targetUserId, UserDTO actorUser) {
        sendBillDeletedByFriendInternal(billId, billName, amount, null, targetUserId, actorUser, null);
    }

    @Async("friendActivityExecutor")
    public void sendBillDeletedByFriend(Integer billId, String billName, Double amount, Bill deletedBill,
            Integer targetUserId, UserDTO actorUser, UserDTO targetUser) {
        sendBillDeletedByFriendInternal(billId, billName, amount, deletedBill, targetUserId, actorUser, targetUser);
    }

    private void sendBillDeletedByFriendInternal(Integer billId, String billName, Double amount, Bill deletedBill,
            Integer targetUserId, UserDTO actorUser, UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.BILL)
                    .entityType(FriendActivityEvent.EntityType.BILL)
                    .entityId(billId)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted bill '%s'",
                            actorName, billName != null ? billName : "a bill"))
                    .amount(amount)
                    .previousEntityState(deletedBill != null ? buildBillPayload(deletedBill) : null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bill deletion: {}", e.getMessage(), e);
        }
    }

    @Async("friendActivityExecutor")
    public void sendAllBillsDeletedByFriend(Integer targetUserId, UserDTO actorUser, int count) {
        sendAllBillsDeletedByFriendInternal(targetUserId, actorUser, null, count, null);
    }

    @Async("friendActivityExecutor")
    public void sendAllBillsDeletedByFriend(Integer targetUserId, UserDTO actorUser, UserDTO targetUser, int count,
            List<Bill> deletedBills) {
        sendAllBillsDeletedByFriendInternal(targetUserId, actorUser, targetUser, count, deletedBills);
    }

    private void sendAllBillsDeletedByFriendInternal(Integer targetUserId, UserDTO actorUser, UserDTO targetUser,
            int count, List<Bill> deletedBills) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            Map<String, Object> payload = new HashMap<>();
            payload.put("deletedCount", count);
            if (deletedBills != null && !deletedBills.isEmpty()) {
                payload.put("deletedBills", deletedBills.stream().map(this::buildBillPayload).toList());
                payload.put("totalAmount", deletedBills.stream().mapToDouble(Bill::getAmount).sum());
            }

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.BILL)
                    .entityType(FriendActivityEvent.EntityType.BILL)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted all bills (%d items)", actorName, count))
                    .amount(null)
                    .entityPayload(payload)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bulk bill deletion: {}", e.getMessage(), e);
        }
    }

    private String getActorDisplayName(UserDTO user) {
        if (user.getFirstName() != null && !user.getFirstName().isEmpty()) {
            if (user.getLastName() != null && !user.getLastName().isEmpty()) {
                return user.getFirstName() + " " + user.getLastName();
            }
            return user.getFirstName();
        }
        return user.getUsername() != null ? user.getUsername() : "A friend";
    }

    private FriendActivityEvent.UserInfo buildUserInfo(UserDTO user) {
        if (user == null)
            return null;

        String fullName = getActorDisplayName(user);

        return FriendActivityEvent.UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(fullName)
                .image(user.getImage())
                .phoneNumber(user.getMobile())
                .build();
    }

    private Map<String, Object> buildBillPayload(Bill bill) {
        if (bill == null)
            return null;

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", bill.getId());
        payload.put("userId", bill.getUserId());
        payload.put("name", bill.getName());
        payload.put("amount", bill.getAmount());
        payload.put("date", bill.getDate() != null ? bill.getDate().toString() : null);
        payload.put("category", bill.getCategory());
        payload.put("categoryId", bill.getCategoryId());
        payload.put("type", bill.getType());
        payload.put("description", bill.getDescription());
        payload.put("paymentMethod", bill.getPaymentMethod());
        payload.put("netAmount", bill.getNetAmount());
        payload.put("creditDue", bill.getCreditDue());
        payload.put("includeInBudget", bill.isIncludeInBudget());
        payload.put("budgetIds", bill.getBudgetIds());
        payload.put("expenseId", bill.getExpenseId());

        return payload;
    }

    private String buildBillMetadata(Bill bill) {
        return String.format("{\"date\":\"%s\",\"category\":\"%s\",\"type\":\"%s\"}",
                bill.getDate() != null ? bill.getDate().toString() : "",
                bill.getCategory() != null ? bill.getCategory() : "",
                bill.getType() != null ? bill.getType() : "");
    }
}
