package com.jaya.util;

import com.jaya.dto.User;
import com.jaya.kafka.AuditEventProducer;
import com.jaya.models.AuditEvent;
import com.jaya.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuditHelper {

    private final AuditEventProducer auditEventProducer;

    private final JsonConverter helper;

    private final UserService userservice;

    public void auditAction(Integer userId, String entityId,
                            String entityType, String actionType, Object details) throws Exception {

        String json= helper.toJson(details);
        User user=userservice.findUserById(userId);

        String username= user.getUsername() != null ? user.getUsername() : user.getEmail().split("@")[0];
        try {
            AuditEvent auditEvent = AuditEvent.builder()
                    .userId(userId)
                    .username(username)
                    .userRole("USER")
                    .entityId(entityId)
                    .entityType(entityType)
                    .actionType(actionType)
                    .details(json)
                    .status("SUCCESS")
                    .correlationId(UUID.randomUUID().toString())
                    .build();

            enrichWithRequestInfo(auditEvent);
            auditEvent.setCreationAudit(username);

            auditEventProducer.publishAuditEvent(auditEvent);
        } catch (Exception e) {
            log.error("Failed to audit action: userId={}, entityType={}, actionType={}",
                    userId, entityType, actionType, e);
        }
    }

    // Accepts optional/extra fields as parameters (add more as needed)
    public void auditAction(
            Integer userId,
            String username,
            String userRole,             // New (or keep default)
            String entityId,
            String entityType,
            String actionType,
            String details,
            String description,          // New
            Map<String, Object> oldValues, // New
            Map<String, Object> newValues, // New
            String status,               // New, e.g., "SUCCESS"
            String errorMessage,         // New (nullable)
            Integer responseCode,        // New (nullable)
            Long executionTimeMs         // New (nullable)
    ) {
        try {
            AuditEvent auditEvent = AuditEvent.builder()
                    .userId(userId)
                    .username(username)
                    .userRole(userRole)
                    .entityId(entityId)
                    .entityType(entityType)
                    .actionType(actionType)
                    .details(details)
                    .description(description)
                    .oldValues(oldValues)
                    .newValues(newValues)
                    .status(status)
                    .errorMessage(errorMessage)
                    .responseCode(responseCode)
                    .executionTimeMs(executionTimeMs)
                    .correlationId(UUID.randomUUID().toString())
                    .build();
            enrichWithRequestInfo(auditEvent);
            auditEvent.setCreationAudit(username);
            auditEventProducer.publishAuditEvent(auditEvent);
        } catch (Exception e) {
            log.error("Failed to audit action: userId={}, entityType={}, actionType={}",
                    userId, entityType, actionType, e);
        }
    }


    public void auditActionWithChanges(Integer userId, String username, String entityId,
                                       String entityType, String actionType, String details,
                                       Map<String, Object> oldValues, Map<String, Object> newValues) {
        try {
            AuditEvent auditEvent = AuditEvent.builder()
                    .userId(userId)
                    .username(username)
                    .entityId(entityId)
                    .entityType(entityType)
                    .actionType(actionType)
                    .details(details)
                    .oldValues(oldValues)
                    .newValues(newValues)
                    .status("SUCCESS")
                    .correlationId(UUID.randomUUID().toString())
                    .build();

            enrichWithRequestInfo(auditEvent);
            auditEvent.setCreationAudit(username);

            auditEventProducer.publishAuditEvent(auditEvent);
        } catch (Exception e) {
            log.error("Failed to audit action with changes: userId={}, entityType={}, actionType={}",
                    userId, entityType, actionType, e);
        }
    }

    public void auditFailure(Integer userId, String username, String entityId,
                             String entityType, String actionType, String errorMessage, Exception exception) {
        try {
            AuditEvent auditEvent = AuditEvent.builder()
                    .userId(userId)
                    .username(username)
                    .entityId(entityId)
                    .entityType(entityType)
                    .actionType(actionType)
                    .details("Operation failed: " + errorMessage)
                    .status("FAILURE")
                    .errorMessage(errorMessage)
                    .correlationId(UUID.randomUUID().toString())
                    .build();

            enrichWithRequestInfo(auditEvent);
            auditEvent.setCreationAudit(username);

            auditEventProducer.publishAuditEvent(auditEvent);
        } catch (Exception e) {
            log.error("Failed to audit failure: userId={}, entityType={}, actionType={}",
                    userId, entityType, actionType, e);
        }
    }

    private void enrichWithRequestInfo(AuditEvent auditEvent) {
        try {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                auditEvent.setIpAddress(getClientIpAddress(request));
                auditEvent.setUserAgent(request.getHeader("User-Agent"));
                auditEvent.setMethod(request.getMethod());
                auditEvent.setEndpoint(request.getRequestURI());
                auditEvent.setSessionId(request.getSession().getId());

                // Add request ID if present
                String requestId = request.getHeader("X-Request-ID");
                if (requestId != null) {
                    auditEvent.setRequestId(requestId);
                }

                // Determine source based on User-Agent or headers
                auditEvent.setSource(determineSource(request));
            }
        } catch (Exception e) {
            log.debug("Could not enrich audit event with request info", e);
            // Log but don't fail the audit
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null || xForwardedForHeader.isEmpty()) {
            String xRealIp = request.getHeader("X-Real-IP");
            if (xRealIp != null && !xRealIp.isEmpty()) {
                return xRealIp;
            }
            return request.getRemoteAddr();
        } else {
            // X-Forwarded-For can contain multiple IPs, get the first one
            return xForwardedForHeader.split(",")[0].trim();
        }
    }

    private String determineSource(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent != null) {
            userAgent = userAgent.toLowerCase();
            if (userAgent.contains("mobile") || userAgent.contains("android") || userAgent.contains("iphone")) {
                return "MOBILE";
            }
        }

        String apiKey = request.getHeader("X-API-Key");
        if (apiKey != null) {
            return "API";
        }

        return "WEB";
    }
}