package com.jaya.kafka.service;

import com.jaya.kafka.events.FriendActivityEvent;
import com.jaya.kafka.producer.FriendActivityProducer;
import com.jaya.models.PaymentMethod;
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
    public void sendPaymentMethodCreatedByFriend(PaymentMethod paymentMethod, Integer targetUserId, UserDTO actorUser) {
        sendPaymentMethodCreatedByFriendInternal(paymentMethod, targetUserId, actorUser, null);
    }

    



    @Async("friendActivityExecutor")
    public void sendPaymentMethodCreatedByFriend(PaymentMethod paymentMethod, Integer targetUserId, UserDTO actorUser,
            UserDTO targetUser) {
        sendPaymentMethodCreatedByFriendInternal(paymentMethod, targetUserId, actorUser, targetUser);
    }

    


    private void sendPaymentMethodCreatedByFriendInternal(PaymentMethod paymentMethod, Integer targetUserId,
            UserDTO actorUser,
            UserDTO targetUser) {
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
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.PAYMENT)
                    .entityType(FriendActivityEvent.EntityType.PAYMENT_METHOD)
                    .entityId(paymentMethod.getId())
                    .action(FriendActivityEvent.Action.CREATE)
                    .description(String.format("%s created payment method '%s'", actorName, paymentMethod.getName()))
                    .amount(paymentMethod.getAmount() != null ? paymentMethod.getAmount().doubleValue() : null)
                    .metadata(buildPaymentMethodMetadata(paymentMethod))
                    .entityPayload(buildPaymentMethodPayload(paymentMethod))
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

    


    @Async("friendActivityExecutor")
    public void sendPaymentMethodUpdatedByFriend(PaymentMethod paymentMethod, Integer targetUserId, UserDTO actorUser) {
        sendPaymentMethodUpdatedByFriendInternal(paymentMethod, null, targetUserId, actorUser, null);
    }

    



    @Async("friendActivityExecutor")
    public void sendPaymentMethodUpdatedByFriend(PaymentMethod paymentMethod, PaymentMethod previousPaymentMethod,
            Integer targetUserId, UserDTO actorUser, UserDTO targetUser) {
        sendPaymentMethodUpdatedByFriendInternal(paymentMethod, previousPaymentMethod, targetUserId, actorUser,
                targetUser);
    }

    


    private void sendPaymentMethodUpdatedByFriendInternal(PaymentMethod paymentMethod,
            PaymentMethod previousPaymentMethod,
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
                    .sourceService(FriendActivityEvent.SourceService.PAYMENT)
                    .entityType(FriendActivityEvent.EntityType.PAYMENT_METHOD)
                    .entityId(paymentMethod.getId())
                    .action(FriendActivityEvent.Action.UPDATE)
                    .description(String.format("%s updated payment method '%s'", actorName, paymentMethod.getName()))
                    .amount(paymentMethod.getAmount() != null ? paymentMethod.getAmount().doubleValue() : null)
                    .entityPayload(buildPaymentMethodPayload(paymentMethod))
                    .previousEntityState(
                            previousPaymentMethod != null ? buildPaymentMethodPayload(previousPaymentMethod) : null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for payment method update: {}", e.getMessage(), e);
        }
    }

    


    @Async("friendActivityExecutor")
    public void sendPaymentMethodDeletedByFriend(Integer paymentMethodId, String paymentMethodName,
            Integer targetUserId, UserDTO actorUser) {
        sendPaymentMethodDeletedByFriendInternal(paymentMethodId, paymentMethodName, null, targetUserId, actorUser,
                null);
    }

    



    @Async("friendActivityExecutor")
    public void sendPaymentMethodDeletedByFriend(Integer paymentMethodId, String paymentMethodName,
            PaymentMethod deletedPaymentMethod,
            Integer targetUserId, UserDTO actorUser, UserDTO targetUser) {
        sendPaymentMethodDeletedByFriendInternal(paymentMethodId, paymentMethodName, deletedPaymentMethod, targetUserId,
                actorUser, targetUser);
    }

    


    private void sendPaymentMethodDeletedByFriendInternal(Integer paymentMethodId, String paymentMethodName,
            PaymentMethod deletedPaymentMethod,
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
                    .sourceService(FriendActivityEvent.SourceService.PAYMENT)
                    .entityType(FriendActivityEvent.EntityType.PAYMENT_METHOD)
                    .entityId(paymentMethodId)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted payment method '%s'",
                            actorName, paymentMethodName != null ? paymentMethodName : "a payment method"))
                    .amount(null)
                    .previousEntityState(
                            deletedPaymentMethod != null ? buildPaymentMethodPayload(deletedPaymentMethod) : null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for payment method deletion: {}", e.getMessage(), e);
        }
    }

    


    @Async("friendActivityExecutor")
    public void sendAllPaymentMethodsDeletedByFriend(Integer targetUserId, UserDTO actorUser, int count) {
        sendAllPaymentMethodsDeletedByFriendInternal(targetUserId, actorUser, null, count, null);
    }

    



    @Async("friendActivityExecutor")
    public void sendAllPaymentMethodsDeletedByFriend(Integer targetUserId, UserDTO actorUser, UserDTO targetUser,
            int count, List<PaymentMethod> deletedPaymentMethods) {
        sendAllPaymentMethodsDeletedByFriendInternal(targetUserId, actorUser, targetUser, count, deletedPaymentMethods);
    }

    


    private void sendAllPaymentMethodsDeletedByFriendInternal(Integer targetUserId, UserDTO actorUser,
            UserDTO targetUser,
            int count, List<PaymentMethod> deletedPaymentMethods) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            
            Map<String, Object> payload = new HashMap<>();
            payload.put("deletedCount", count);
            if (deletedPaymentMethods != null && !deletedPaymentMethods.isEmpty()) {
                payload.put("deletedPaymentMethods",
                        deletedPaymentMethods.stream().map(this::buildPaymentMethodPayload).toList());
            }

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.PAYMENT)
                    .entityType(FriendActivityEvent.EntityType.PAYMENT_METHOD)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted all payment methods (%d items)", actorName, count))
                    .amount(null)
                    .entityPayload(payload)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bulk payment method deletion: {}",
                    e.getMessage(), e);
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

    


    private Map<String, Object> buildPaymentMethodPayload(PaymentMethod paymentMethod) {
        if (paymentMethod == null)
            return null;

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", paymentMethod.getId());
        payload.put("userId", paymentMethod.getUserId());
        payload.put("name", paymentMethod.getName());
        payload.put("description", paymentMethod.getDescription());
        payload.put("amount", paymentMethod.getAmount());
        payload.put("type", paymentMethod.getType());
        payload.put("icon", paymentMethod.getIcon());
        payload.put("color", paymentMethod.getColor());
        payload.put("isGlobal", paymentMethod.isGlobal());

        return payload;
    }

    private String buildPaymentMethodMetadata(PaymentMethod paymentMethod) {
        return String.format("{\"type\":\"%s\",\"icon\":\"%s\",\"color\":\"%s\"}",
                paymentMethod.getType() != null ? paymentMethod.getType() : "",
                paymentMethod.getIcon() != null ? paymentMethod.getIcon() : "",
                paymentMethod.getColor() != null ? paymentMethod.getColor() : "");
    }
}
