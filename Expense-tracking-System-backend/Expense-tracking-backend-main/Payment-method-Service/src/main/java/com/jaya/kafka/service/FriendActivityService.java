package com.jaya.kafka.service;

import com.jaya.kafka.events.FriendActivityEvent;
import com.jaya.kafka.producer.FriendActivityProducer;
import com.jaya.models.PaymentMethod;
import com.jaya.models.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for sending friend activity notifications for payment method
 * operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FriendActivityService {

    private final FriendActivityProducer friendActivityProducer;

    /**
     * Send notification when a friend creates a payment method on behalf of another
     * user.
     */
    public void sendPaymentMethodCreatedByFriend(PaymentMethod paymentMethod, Integer targetUserId, UserDto actorUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                log.debug("Skipping friend activity notification - user creating own payment method");
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.PAYMENT)
                    .entityType(FriendActivityEvent.EntityType.PAYMENT_METHOD)
                    .entityId(paymentMethod.getId())
                    .action(FriendActivityEvent.Action.CREATE)
                    .description(String.format("%s created payment method '%s'", actorName, paymentMethod.getName()))
                    .amount(paymentMethod.getAmount() != null ? paymentMethod.getAmount().doubleValue() : null)
                    .metadata(buildPaymentMethodMetadata(paymentMethod))
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);
            log.info("Friend activity event sent: {} created payment method {} for user {}",
                    actorUser.getId(), paymentMethod.getId(), targetUserId);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for payment method creation: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend updates a payment method.
     */
    public void sendPaymentMethodUpdatedByFriend(PaymentMethod paymentMethod, Integer targetUserId, UserDto actorUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.PAYMENT)
                    .entityType(FriendActivityEvent.EntityType.PAYMENT_METHOD)
                    .entityId(paymentMethod.getId())
                    .action(FriendActivityEvent.Action.UPDATE)
                    .description(String.format("%s updated payment method '%s'", actorName, paymentMethod.getName()))
                    .amount(paymentMethod.getAmount() != null ? paymentMethod.getAmount().doubleValue() : null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for payment method update: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend deletes a payment method.
     */
    public void sendPaymentMethodDeletedByFriend(Integer paymentMethodId, String paymentMethodName,
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
                    .sourceService(FriendActivityEvent.SourceService.PAYMENT)
                    .entityType(FriendActivityEvent.EntityType.PAYMENT_METHOD)
                    .entityId(paymentMethodId)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted payment method '%s'",
                            actorName, paymentMethodName != null ? paymentMethodName : "a payment method"))
                    .amount(null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for payment method deletion: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend deletes all payment methods.
     */
    public void sendAllPaymentMethodsDeletedByFriend(Integer targetUserId, UserDto actorUser, int count) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.PAYMENT)
                    .entityType(FriendActivityEvent.EntityType.PAYMENT_METHOD)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted all payment methods (%d items)", actorName, count))
                    .amount(null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bulk payment method deletion: {}",
                    e.getMessage(), e);
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

    private String buildPaymentMethodMetadata(PaymentMethod paymentMethod) {
        return String.format("{\"type\":\"%s\",\"icon\":\"%s\",\"color\":\"%s\"}",
                paymentMethod.getType() != null ? paymentMethod.getType() : "",
                paymentMethod.getIcon() != null ? paymentMethod.getIcon() : "",
                paymentMethod.getColor() != null ? paymentMethod.getColor() : "");
    }
}
