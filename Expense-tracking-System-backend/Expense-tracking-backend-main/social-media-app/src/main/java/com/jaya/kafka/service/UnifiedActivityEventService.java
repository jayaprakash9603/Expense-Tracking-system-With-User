package com.jaya.kafka.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.dto.User;
import com.jaya.kafka.events.UnifiedActivityEvent;
import com.jaya.kafka.events.UnifiedActivityEvent.UserInfo;
import com.jaya.kafka.producer.UnifiedActivityEventProducer;
import com.jaya.models.Expense;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for building and sending unified activity events.
 * Provides convenience methods for creating events from domain entities.
 * 
 * This service encapsulates the logic for:
 * - Building events from entity operations
 * - Enriching events with request context
 * - Determining if action is own or friend activity
 * - Sending events via the unified producer
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UnifiedActivityEventService {

    private final UnifiedActivityEventProducer eventProducer;
    private final ObjectMapper objectMapper;

    // =============================================
    // EXPENSE EVENT METHODS
    // =============================================

    /**
     * Send event for expense creation
     */
    public void sendExpenseCreatedEvent(Expense expense, User actor, User target, HttpServletRequest request) {
        UnifiedActivityEvent event = buildExpenseEvent(expense, actor, target,
                UnifiedActivityEvent.Action.CREATE, null, request);
        eventProducer.sendEvent(event);
    }

    /**
     * Send event for expense update
     */
    public void sendExpenseUpdatedEvent(Expense expense, Expense oldExpense, User actor, User target,
            HttpServletRequest request) {
        Map<String, Object> oldValues = convertToMap(oldExpense);
        UnifiedActivityEvent event = buildExpenseEvent(expense, actor, target,
                UnifiedActivityEvent.Action.UPDATE, oldValues, request);
        eventProducer.sendEvent(event);
    }

    /**
     * Send event for expense deletion
     */
    public void sendExpenseDeletedEvent(Expense expense, User actor, User target, HttpServletRequest request) {
        UnifiedActivityEvent event = buildExpenseEvent(expense, actor, target,
                UnifiedActivityEvent.Action.DELETE, null, request);
        // For delete, put current values in oldValues
        event.setOldValues(convertToMap(expense));
        event.setNewValues(null);
        eventProducer.sendEvent(event);
    }

    /**
     * Build unified event for expense
     */
    private UnifiedActivityEvent buildExpenseEvent(Expense expense, User actor, User target,
            String action, Map<String, Object> oldValues,
            HttpServletRequest request) {
        boolean isOwnAction = actor.getId().equals(target.getId());
        String expenseName = getExpenseName(expense);
        Double amount = getExpenseAmount(expense);

        UnifiedActivityEvent.UnifiedActivityEventBuilder builder = UnifiedActivityEvent.builder()
                .entityType(UnifiedActivityEvent.EntityType.EXPENSE)
                .entityId(Long.valueOf(expense.getId()))
                .entityName(expenseName)
                .action(action)
                .description(buildExpenseDescription(expense, actor, action, isOwnAction))
                .amount(amount)
                .actorUserId(actor.getId())
                .actorUserName(actor.getFullName())
                .actorEmail(actor.getEmail())
                .actorUser(buildUserInfo(actor))
                .targetUserId(target.getId())
                .targetUserName(target.getFullName())
                .targetUser(buildUserInfo(target))
                .sourceService(UnifiedActivityEvent.SourceService.EXPENSE_SERVICE)
                .newValues(convertToMap(expense))
                .oldValues(oldValues)
                .entityPayload(convertToMap(expense))
                .isOwnAction(isOwnAction)
                .isFriendActivity(!isOwnAction)
                .requiresAudit(true)
                .requiresNotification(true)
                .status(UnifiedActivityEvent.Status.SUCCESS)
                .timestamp(LocalDateTime.now());

        // Add request context if available
        if (request != null) {
            enrichWithRequestContext(builder, request);
        }

        return builder.build();
    }

    /**
     * Build description for expense events
     */
    private String buildExpenseDescription(Expense expense, User actor, String action, boolean isOwnAction) {
        String actionText = switch (action) {
            case UnifiedActivityEvent.Action.CREATE -> "created";
            case UnifiedActivityEvent.Action.UPDATE -> "updated";
            case UnifiedActivityEvent.Action.DELETE -> "deleted";
            default -> action.toLowerCase();
        };

        String expenseName = getExpenseName(expense);
        Double amount = getExpenseAmount(expense);
        double displayAmount = amount != null ? amount : 0.0;

        if (isOwnAction) {
            return String.format("You %s expense '%s' for $%.2f",
                    actionText, expenseName, displayAmount);
        } else {
            return String.format("%s %s expense '%s' for $%.2f on your account",
                    actor.getFullName(), actionText, expenseName, displayAmount);
        }
    }

    // =============================================
    // GENERIC EVENT BUILDER METHODS
    // =============================================

    /**
     * Build a generic unified activity event
     */
    public UnifiedActivityEvent.UnifiedActivityEventBuilder buildGenericEvent(
            String entityType,
            Long entityId,
            String entityName,
            String action,
            User actor,
            User target) {

        boolean isOwnAction = actor.getId().equals(target.getId());

        return UnifiedActivityEvent.builder()
                .entityType(entityType)
                .entityId(entityId)
                .entityName(entityName)
                .action(action)
                .actorUserId(actor.getId())
                .actorUserName(actor.getFullName())
                .actorEmail(actor.getEmail())
                .actorUser(buildUserInfo(actor))
                .targetUserId(target.getId())
                .targetUserName(target.getFullName())
                .targetUser(buildUserInfo(target))
                .isOwnAction(isOwnAction)
                .isFriendActivity(!isOwnAction)
                .requiresAudit(true)
                .requiresNotification(true)
                .status(UnifiedActivityEvent.Status.SUCCESS)
                .timestamp(LocalDateTime.now());
    }

    /**
     * Send a pre-built event
     */
    public void sendEvent(UnifiedActivityEvent event) {
        eventProducer.sendEvent(event);
    }

    // =============================================
    // HELPER METHODS
    // =============================================

    /**
     * Build UserInfo from User entity
     */
    public UserInfo buildUserInfo(User user) {
        if (user == null)
            return null;

        return UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .image(user.getImage())
                .coverImage(user.getCoverImage())
                .phoneNumber(user.getPhoneNumber())
                .location(user.getLocation())
                .bio(user.getBio())
                .build();
    }

    /**
     * Enrich event builder with HTTP request context
     */
    public void enrichWithRequestContext(UnifiedActivityEvent.UnifiedActivityEventBuilder builder,
            HttpServletRequest request) {
        if (request == null)
            return;

        builder.ipAddress(getClientIpAddress(request))
                .userAgent(request.getHeader("User-Agent"))
                .sessionId(request.getSession(false) != null ? request.getSession().getId() : null)
                .correlationId(request.getHeader("X-Correlation-ID"))
                .requestId(request.getHeader("X-Request-ID"))
                .httpMethod(request.getMethod())
                .endpoint(request.getRequestURI());
    }

    /**
     * Get client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Convert entity to Map for JSON storage
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> convertToMap(Object entity) {
        if (entity == null)
            return null;
        try {
            return objectMapper.convertValue(entity, Map.class);
        } catch (Exception e) {
            log.warn("Failed to convert entity to map: {}", e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("toString", entity.toString());
            return fallback;
        }
    }

    /**
     * Get expense name from Expense entity
     */
    private String getExpenseName(Expense expense) {
        if (expense == null)
            return "Expense";
        if (expense.getExpense() != null && expense.getExpense().getExpenseName() != null) {
            return expense.getExpense().getExpenseName();
        }
        return "Expense";
    }

    /**
     * Get expense amount from Expense entity
     */
    private Double getExpenseAmount(Expense expense) {
        if (expense == null)
            return null;
        if (expense.getExpense() != null) {
            return expense.getExpense().getAmount();
        }
        return null;
    }
}
