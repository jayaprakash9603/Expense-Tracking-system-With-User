package com.jaya.kafka.service;

import com.jaya.kafka.events.FriendActivityEvent;
import com.jaya.kafka.producer.FriendActivityProducer;
import com.jaya.models.Bill;
import com.jaya.models.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for sending friend activity notifications for bill operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FriendActivityService {

    private final FriendActivityProducer friendActivityProducer;

    /**
     * Send notification when a friend creates a bill on behalf of another user.
     */
    public void sendBillCreatedByFriend(Bill bill, Integer targetUserId, UserDto actorUser) {
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
                    .sourceService(FriendActivityEvent.SourceService.BILL)
                    .entityType(FriendActivityEvent.EntityType.BILL)
                    .entityId(bill.getId())
                    .action(FriendActivityEvent.Action.CREATE)
                    .description(String.format("%s created bill '%s' with amount $%.2f",
                            actorName, bill.getName(), bill.getAmount()))
                    .amount(bill.getAmount())
                    .metadata(buildBillMetadata(bill))
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

    /**
     * Send notification when a friend creates multiple bills.
     */
    public void sendBulkBillsCreatedByFriend(List<Bill> bills, Integer targetUserId, UserDto actorUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);
            double totalAmount = bills.stream().mapToDouble(Bill::getAmount).sum();

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.BILL)
                    .entityType(FriendActivityEvent.EntityType.BILL)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.CREATE)
                    .description(String.format("%s created %d bills totaling $%.2f",
                            actorName, bills.size(), totalAmount))
                    .amount(totalAmount)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bulk bill creation: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend updates a bill.
     */
    public void sendBillUpdatedByFriend(Bill bill, Integer targetUserId, UserDto actorUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.BILL)
                    .entityType(FriendActivityEvent.EntityType.BILL)
                    .entityId(bill.getId())
                    .action(FriendActivityEvent.Action.UPDATE)
                    .description(String.format("%s updated bill '%s'", actorName, bill.getName()))
                    .amount(bill.getAmount())
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bill update: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend deletes a bill.
     */
    public void sendBillDeletedByFriend(Integer billId, String billName, Double amount,
            Integer targetUserId, UserDto actorUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.BILL)
                    .entityType(FriendActivityEvent.EntityType.BILL)
                    .entityId(billId)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted bill '%s'",
                            actorName, billName != null ? billName : "a bill"))
                    .amount(amount)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bill deletion: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend deletes all bills.
     */
    public void sendAllBillsDeletedByFriend(Integer targetUserId, UserDto actorUser, int count) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.BILL)
                    .entityType(FriendActivityEvent.EntityType.BILL)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted all bills (%d items)", actorName, count))
                    .amount(null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bulk bill deletion: {}", e.getMessage(), e);
        }
    }

    private String getActorDisplayName(UserDto user) {
        if (user.getFirstName() != null && !user.getFirstName().isEmpty()) {
            if (user.getLastName() != null && !user.getLastName().isEmpty()) {
                return user.getFirstName() + " " + user.getLastName();
            }
            return user.getFirstName();
        }
        return user.getUsername() != null ? user.getUsername() : "A friend";
    }

    private String buildBillMetadata(Bill bill) {
        return String.format("{\"date\":\"%s\",\"category\":\"%s\",\"type\":\"%s\"}",
                bill.getDate() != null ? bill.getDate().toString() : "",
                bill.getCategory() != null ? bill.getCategory() : "",
                bill.getType() != null ? bill.getType() : "");
    }
}
