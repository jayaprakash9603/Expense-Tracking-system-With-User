package com.jaya.common.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Optional;
import java.util.UUID;





public final class RequestContextUtil {

    private RequestContextUtil() {
        
    }

    


    public static Optional<HttpServletRequest> getCurrentRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            return Optional.of(attributes.getRequest());
        }
        return Optional.empty();
    }

    



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

    


    public static String getUserAgent() {
        return getCurrentRequest()
                .map(request -> request.getHeader("User-Agent"))
                .orElse("unknown");
    }

    


    public static String getCorrelationId() {
        return getCurrentRequest()
                .map(request -> {
                    String correlationId = request.getHeader(CommonConstants.Headers.X_CORRELATION_ID);
                    return correlationId != null ? correlationId : generateCorrelationId();
                })
                .orElse(generateCorrelationId());
    }

    


    public static String getRequestId() {
        return getCurrentRequest()
                .map(request -> {
                    String requestId = request.getHeader(CommonConstants.Headers.X_REQUEST_ID);
                    return requestId != null ? requestId : generateRequestId();
                })
                .orElse(generateRequestId());
    }

    


    public static String getTraceId() {
        return getCurrentRequest()
                .map(request -> request.getHeader(CommonConstants.Headers.X_TRACE_ID))
                .orElse(null);
    }

    


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

    


    public static Optional<String> getUserEmailFromHeader() {
        return getCurrentRequest()
                .map(request -> request.getHeader(CommonConstants.Headers.X_USER_EMAIL));
    }

    


    public static String getRequestUri() {
        return getCurrentRequest()
                .map(HttpServletRequest::getRequestURI)
                .orElse("unknown");
    }

    


    public static String getHttpMethod() {
        return getCurrentRequest()
                .map(HttpServletRequest::getMethod)
                .orElse("unknown");
    }

    


    public static String getQueryString() {
        return getCurrentRequest()
                .map(HttpServletRequest::getQueryString)
                .orElse("");
    }

    


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

    


    public static String generateCorrelationId() {
        return UUID.randomUUID().toString();
    }

    


    public static String generateRequestId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
