package com.jaya.kafka.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.dto.UserDTO;
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











@Service
@RequiredArgsConstructor
@Slf4j
public class UnifiedActivityEventService {

    private final UnifiedActivityEventProducer eventProducer;
    private final ObjectMapper objectMapper;

    
    
    

    


    public void sendExpenseCreatedEvent(Expense expense, UserDTO actor, UserDTO target, HttpServletRequest request) {
        UnifiedActivityEvent event = buildExpenseEvent(expense, actor, target,
                UnifiedActivityEvent.Action.CREATE, null, request);
        eventProducer.sendEvent(event);
    }

    


    public void sendExpenseUpdatedEvent(Expense expense, Expense oldExpense, UserDTO actor, UserDTO target,
            HttpServletRequest request) {
        Map<String, Object> oldValues = convertToMap(oldExpense);
        UnifiedActivityEvent event = buildExpenseEvent(expense, actor, target,
                UnifiedActivityEvent.Action.UPDATE, oldValues, request);
        eventProducer.sendEvent(event);
    }

    


    public void sendExpenseDeletedEvent(Expense expense, UserDTO actor, UserDTO target, HttpServletRequest request) {
        UnifiedActivityEvent event = buildExpenseEvent(expense, actor, target,
                UnifiedActivityEvent.Action.DELETE, null, request);
        
        event.setOldValues(convertToMap(expense));
        event.setNewValues(null);
        eventProducer.sendEvent(event);
    }

    


    private UnifiedActivityEvent buildExpenseEvent(Expense expense, UserDTO actor, UserDTO target,
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

        
        if (request != null) {
            enrichWithRequestContext(builder, request);
        }

        return builder.build();
    }

    


    private String buildExpenseDescription(Expense expense, UserDTO actor, String action, boolean isOwnAction) {
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

    
    
    

    


    public UnifiedActivityEvent.UnifiedActivityEventBuilder buildGenericEvent(
            String entityType,
            Long entityId,
            String entityName,
            String action,
            UserDTO actor,
            UserDTO target) {

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

    


    public void sendEvent(UnifiedActivityEvent event) {
        eventProducer.sendEvent(event);
    }

    
    
    

    


    public UserInfo buildUserInfo(UserDTO UserDTO) {
        if (UserDTO == null)
            return null;

        return UserInfo.builder()
                .id(UserDTO.getId())
                .username(UserDTO.getUsername())
                .email(UserDTO.getEmail())
                .firstName(UserDTO.getFirstName())
                .lastName(UserDTO.getLastName())
                .fullName(UserDTO.getFullName())
                .image(UserDTO.getImage())
                .coverImage(UserDTO.getCoverImage())
                .phoneNumber(UserDTO.getPhoneNumber())
                .location(UserDTO.getLocation())
                .bio(UserDTO.getBio())
                .build();
    }

    


    public void enrichWithRequestContext(UnifiedActivityEvent.UnifiedActivityEventBuilder builder,
            HttpServletRequest request) {
        if (request == null)
            return;

        builder.ipAddress(getClientIpAddress(request))
                .userAgent(request.getHeader("UserDTO-Agent"))
                .sessionId(request.getSession(false) != null ? request.getSession().getId() : null)
                .correlationId(request.getHeader("X-Correlation-ID"))
                .requestId(request.getHeader("X-Request-ID"))
                .httpMethod(request.getMethod())
                .endpoint(request.getRequestURI());
    }

    


    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    


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

    


    private String getExpenseName(Expense expense) {
        if (expense == null)
            return "Expense";
        if (expense.getExpense() != null && expense.getExpense().getExpenseName() != null) {
            return expense.getExpense().getExpenseName();
        }
        return "Expense";
    }

    


    private Double getExpenseAmount(Expense expense) {
        if (expense == null)
            return null;
        if (expense.getExpense() != null) {
            return expense.getExpense().getAmount();
        }
        return null;
    }
}
