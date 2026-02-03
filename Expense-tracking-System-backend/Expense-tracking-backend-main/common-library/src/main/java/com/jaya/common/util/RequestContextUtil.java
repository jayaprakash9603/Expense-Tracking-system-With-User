package com.jaya.common.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Optional;
import java.util.UUID;

/**
 * Utility class for extracting and managing request context information.
 * Useful for logging, tracing, and audit purposes.
 */
public final class RequestContextUtil {

    private RequestContextUtil() {
        // Private constructor to prevent instantiation
    }

    /**
     * Get the current HTTP request from the request context.
     */
    public static Optional<HttpServletRequest> getCurrentRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            return Optional.of(attributes.getRequest());
        }
        return Optional.empty();
    }

    /**
     * Get client IP address from the request.
     * Handles proxy headers (X-Forwarded-For).
     */
    public static String getClientIpAddress() {
        return getCurrentRequest()
                .map(request -> {
                    String xForwardedFor = request.getHeader("X-Forwarded-For");
                    if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                        return xForwardedFor.split(",")[0].trim();
                    }
                    String xRealIp = request.getHeader("X-Real-IP");
                    if (xRealIp != null && !xRealIp.isEmpty()) {
                        return xRealIp;
                    }
                    return request.getRemoteAddr();
                })
                .orElse("unknown");
    }

    /**
     * Get User-Agent from the request.
     */
    public static String getUserAgent() {
        return getCurrentRequest()
                .map(request -> request.getHeader("User-Agent"))
                .orElse("unknown");
    }

    /**
     * Get correlation ID from request headers, or generate a new one.
     */
    public static String getCorrelationId() {
        return getCurrentRequest()
                .map(request -> {
                    String correlationId = request.getHeader(CommonConstants.Headers.X_CORRELATION_ID);
                    return correlationId != null ? correlationId : generateCorrelationId();
                })
                .orElse(generateCorrelationId());
    }

    /**
     * Get request ID from headers, or generate a new one.
     */
    public static String getRequestId() {
        return getCurrentRequest()
                .map(request -> {
                    String requestId = request.getHeader(CommonConstants.Headers.X_REQUEST_ID);
                    return requestId != null ? requestId : generateRequestId();
                })
                .orElse(generateRequestId());
    }

    /**
     * Get trace ID from headers.
     */
    public static String getTraceId() {
        return getCurrentRequest()
                .map(request -> request.getHeader(CommonConstants.Headers.X_TRACE_ID))
                .orElse(null);
    }

    /**
     * Get authorization token from request.
     */
    public static Optional<String> getAuthorizationToken() {
        return getCurrentRequest()
                .map(request -> {
                    String authHeader = request.getHeader(CommonConstants.Headers.AUTHORIZATION);
                    if (authHeader != null && authHeader.startsWith(CommonConstants.Headers.BEARER_PREFIX)) {
                        return authHeader.substring(CommonConstants.Headers.BEARER_PREFIX.length());
                    }
                    return null;
                });
    }

    /**
     * Get user ID from request header (set by gateway).
     */
    public static Optional<Integer> getUserIdFromHeader() {
        return getCurrentRequest()
                .map(request -> {
                    String userId = request.getHeader(CommonConstants.Headers.X_USER_ID);
                    if (userId != null && !userId.isEmpty()) {
                        try {
                            return Integer.parseInt(userId);
                        } catch (NumberFormatException e) {
                            return null;
                        }
                    }
                    return null;
                });
    }

    /**
     * Get user email from request header.
     */
    public static Optional<String> getUserEmailFromHeader() {
        return getCurrentRequest()
                .map(request -> request.getHeader(CommonConstants.Headers.X_USER_EMAIL));
    }

    /**
     * Get request URI.
     */
    public static String getRequestUri() {
        return getCurrentRequest()
                .map(HttpServletRequest::getRequestURI)
                .orElse("unknown");
    }

    /**
     * Get HTTP method.
     */
    public static String getHttpMethod() {
        return getCurrentRequest()
                .map(HttpServletRequest::getMethod)
                .orElse("unknown");
    }

    /**
     * Get query string.
     */
    public static String getQueryString() {
        return getCurrentRequest()
                .map(HttpServletRequest::getQueryString)
                .orElse("");
    }

    /**
     * Get full request URL including query string.
     */
    public static String getFullRequestUrl() {
        return getCurrentRequest()
                .map(request -> {
                    StringBuffer url = request.getRequestURL();
                    String queryString = request.getQueryString();
                    if (queryString != null && !queryString.isEmpty()) {
                        url.append("?").append(queryString);
                    }
                    return url.toString();
                })
                .orElse("unknown");
    }

    /**
     * Generate a new correlation ID.
     */
    public static String generateCorrelationId() {
        return UUID.randomUUID().toString();
    }

    /**
     * Generate a new request ID.
     */
    public static String generateRequestId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
