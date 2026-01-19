package com.jaya.kafka.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.UnifiedActivityEvent;
import com.jaya.kafka.events.UnifiedActivityEvent.UserInfo;
import com.jaya.kafka.producer.UnifiedActivityEventProducer;
import com.jaya.models.PaymentMethod;
import com.jaya.models.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Unified Activity Service for Payment Method Service.
 * Replaces separate FriendActivityService and
 * PaymentMethodNotificationProducer.
 * 
 * All events are sent to the single unified-activity-events topic.
 * The routing flags determine how the event is processed by consumers:
 * - isOwnAction=true -> Regular notification
 * - isFriendActivity=true -> Friend activity notification
 * - requiresAudit=true -> Audit logging
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UnifiedActivityService {

    private final UnifiedActivityEventProducer eventProducer;
    private final ObjectMapper objectMapper;

    // =============================================
    // PAYMENT METHOD CREATED EVENTS
    // =============================================

    /**
     * Send event when a payment method is created (own action or friend action)
     */
    @Async("friendActivityExecutor")
    public void sendPaymentMethodCreatedEvent(PaymentMethod paymentMethod, UserDto actorUser, UserDto targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Payment method '%s' created", paymentMethod.getName())
                    : String.format("%s created payment method '%s'", actorName, paymentMethod.getName());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.PAYMENT_METHOD)
                    .entityId(paymentMethod.getId().longValue())
                    .entityName(paymentMethod.getName())
                    .action(UnifiedActivityEvent.Action.CREATE)
                    .description(description)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorEmail(actorUser.getEmail())
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.PAYMENT_METHOD_SERVICE)
                    .newValues(buildPaymentMethodPayload(paymentMethod))
                    .entityPayload(buildPaymentMethodPayload(paymentMethod))
                    .metadata(buildPaymentMethodMetadata(paymentMethod))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: PaymentMethod CREATED - pmId={}, actorId={}, targetId={}, isOwnAction={}",
                    paymentMethod.getId(), actorUser.getId(), targetUser.getId(), isOwnAction);

        } catch (Exception e) {
            log.error("Failed to send payment method created event: {}", e.getMessage(), e);
        }
    }

    /**
     * Send event when multiple payment methods are created
     */
    @Async("friendActivityExecutor")
    public void sendBulkPaymentMethodsCreatedEvent(List<PaymentMethod> paymentMethods, UserDto actorUser,
            UserDto targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Created %d payment methods", paymentMethods.size())
                    : String.format("%s created %d payment methods", actorName, paymentMethods.size());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.PAYMENT_METHOD)
                    .entityName("Bulk Payment Methods")
                    .action(UnifiedActivityEvent.Action.CREATE)
                    .description(description)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.PAYMENT_METHOD_SERVICE)
                    .metadata(String.format("{\"count\": %d}", paymentMethods.size()))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Bulk PaymentMethods CREATED - count={}, actorId={}, targetId={}",
                    paymentMethods.size(), actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send bulk payment methods created event: {}", e.getMessage(), e);
        }
    }

    // =============================================
    // PAYMENT METHOD UPDATED EVENTS
    // =============================================

    /**
     * Send event when a payment method is updated
     */
    @Async("friendActivityExecutor")
    public void sendPaymentMethodUpdatedEvent(PaymentMethod paymentMethod, PaymentMethod oldPaymentMethod,
            UserDto actorUser, UserDto targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Payment method '%s' updated", paymentMethod.getName())
                    : String.format("%s updated payment method '%s'", actorName, paymentMethod.getName());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.PAYMENT_METHOD)
                    .entityId(paymentMethod.getId().longValue())
                    .entityName(paymentMethod.getName())
                    .action(UnifiedActivityEvent.Action.UPDATE)
                    .description(description)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.PAYMENT_METHOD_SERVICE)
                    .oldValues(oldPaymentMethod != null ? buildPaymentMethodPayload(oldPaymentMethod) : null)
                    .newValues(buildPaymentMethodPayload(paymentMethod))
                    .entityPayload(buildPaymentMethodPayload(paymentMethod))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: PaymentMethod UPDATED - pmId={}, actorId={}, targetId={}",
                    paymentMethod.getId(), actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send payment method updated event: {}", e.getMessage(), e);
        }
    }

    // =============================================
    // PAYMENT METHOD DELETED EVENTS
    // =============================================

    /**
     * Send event when a payment method is deleted
     */
    @Async("friendActivityExecutor")
    public void sendPaymentMethodDeletedEvent(Integer pmId, String pmName, String pmType, UserDto actorUser,
            UserDto targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Payment method '%s' deleted", pmName)
                    : String.format("%s deleted payment method '%s'", actorName, pmName);

            Map<String, Object> oldValues = new HashMap<>();
            oldValues.put("id", pmId);
            oldValues.put("name", pmName);
            if (pmType != null)
                oldValues.put("type", pmType);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.PAYMENT_METHOD)
                    .entityId(pmId.longValue())
                    .entityName(pmName)
                    .action(UnifiedActivityEvent.Action.DELETE)
                    .description(description)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.PAYMENT_METHOD_SERVICE)
                    .oldValues(oldValues)
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: PaymentMethod DELETED - pmId={}, actorId={}, targetId={}",
                    pmId, actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send payment method deleted event: {}", e.getMessage(), e);
        }
    }

    /**
     * Send event when all payment methods are deleted
     */
    @Async("friendActivityExecutor")
    public void sendAllPaymentMethodsDeletedEvent(int count, UserDto actorUser, UserDto targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("All %d payment methods deleted", count)
                    : String.format("%s deleted all %d payment methods", actorName, count);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.PAYMENT_METHOD)
                    .entityName("All Payment Methods")
                    .action(UnifiedActivityEvent.Action.DELETE)
                    .description(description)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.PAYMENT_METHOD_SERVICE)
                    .metadata(String.format("{\"deletedCount\": %d}", count))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: All PaymentMethods DELETED - count={}, actorId={}, targetId={}",
                    count, actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send all payment methods deleted event: {}", e.getMessage(), e);
        }
    }

    // =============================================
    // HELPER METHODS
    // =============================================

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

    private Map<String, Object> buildPaymentMethodPayload(PaymentMethod pm) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", pm.getId());
        payload.put("name", pm.getName());
        payload.put("type", pm.getType());
        payload.put("description", pm.getDescription());
        payload.put("icon", pm.getIcon());
        payload.put("color", pm.getColor());
        return payload;
    }

    private String buildPaymentMethodMetadata(PaymentMethod pm) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("type", pm.getType());
            metadata.put("icon", pm.getIcon());
            metadata.put("color", pm.getColor());
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            return "{}";
        }
    }
}
