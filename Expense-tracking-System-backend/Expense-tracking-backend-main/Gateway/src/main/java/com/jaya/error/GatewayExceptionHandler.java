package com.jaya.error;

import com.jaya.error.exceptions.AccessDeniedException;
import com.jaya.error.exceptions.UnauthorizedException;
import com.jaya.error.exceptions.RateLimitExceededException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@ControllerAdvice
public class GatewayExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GatewayExceptionHandler.class);

    private GatewayErrorResponse build(GatewayErrorCode code, String message, String path, String details,
            String requestId) {
        return new GatewayErrorResponse(
                code.getCode(),
                (message == null || message.isBlank()) ? code.getCode() : message,
                code.getStatus().value(),
                path,
                LocalDateTime.now(),
                (details == null || details.isBlank()) ? code.getDefaultDetails() : details,
                requestId);
    }

    private String path(ServerWebExchange exchange) {
        return exchange != null ? exchange.getRequest().getPath().value() : "";
    }

    private String requestId(ServerWebExchange exchange) {
        return exchange != null ? exchange.getRequest().getHeaders().getFirst("X-Request-ID") : null;
    }

    private String truncate(String value, int max) {
        if (value == null)
            return null;
        return value.length() <= max ? value : value.substring(0, max) + "...";
    }

    private String safeBody(WebClientResponseException ex) {
        String body = ex.getResponseBodyAsString();
        // Avoid leaking large or sensitive internal payloads
        return truncate(body, 500);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<GatewayErrorResponse> handleUnauthorized(UnauthorizedException ex,
            ServerWebExchange exchange) {
        GatewayErrorResponse body = build(GatewayErrorCode.UNAUTHORIZED, ex.getMessage(), path(exchange), null,
                requestId(exchange));
        log.warn("401 Unauthorized path={} msg={}", path(exchange), ex.getMessage());
        return ResponseEntity.status(GatewayErrorCode.UNAUTHORIZED.getStatus()).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<GatewayErrorResponse> handleAccessDenied(AccessDeniedException ex,
            ServerWebExchange exchange) {
        GatewayErrorResponse body = build(GatewayErrorCode.ACCESS_DENIED, ex.getMessage(), path(exchange), null,
                requestId(exchange));
        log.warn("403 AccessDenied path={} msg={}", path(exchange), ex.getMessage());
        return ResponseEntity.status(GatewayErrorCode.ACCESS_DENIED.getStatus()).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<GatewayErrorResponse> handleValidation(MethodArgumentNotValidException ex,
            ServerWebExchange exchange) {
        String fields = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ":" + f.getDefaultMessage())
                .collect(Collectors.joining(","));
        GatewayErrorResponse body = build(GatewayErrorCode.VALIDATION_ERROR, "Validation failed", path(exchange),
                fields, requestId(exchange));
        return ResponseEntity.status(GatewayErrorCode.VALIDATION_ERROR.getStatus()).body(body);
    }

    @ExceptionHandler(WebExchangeBindException.class)
    public ResponseEntity<GatewayErrorResponse> handleWebFluxBind(WebExchangeBindException ex,
            ServerWebExchange exchange) {
        String fields = ex.getFieldErrors().stream()
                .map(f -> f.getField() + ":" + f.getDefaultMessage())
                .collect(Collectors.joining(","));
        GatewayErrorResponse body = build(GatewayErrorCode.VALIDATION_ERROR, "Validation failed", path(exchange),
                fields, requestId(exchange));
        return ResponseEntity.status(GatewayErrorCode.VALIDATION_ERROR.getStatus()).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<GatewayErrorResponse> handleIllegalArgument(IllegalArgumentException ex,
            ServerWebExchange exchange) {
        GatewayErrorResponse body = build(GatewayErrorCode.ILLEGAL_ARGUMENT, ex.getMessage(), path(exchange), null,
                requestId(exchange));
        return ResponseEntity.status(GatewayErrorCode.ILLEGAL_ARGUMENT.getStatus()).body(body);
    }

    @ExceptionHandler(java.net.ConnectException.class)
    public ResponseEntity<GatewayErrorResponse> handleConnectException(java.net.ConnectException ex,
            ServerWebExchange exchange) {
        // This handles "Connection refused" when a downstream service is down
        GatewayErrorResponse body = build(GatewayErrorCode.SERVICE_UNAVAILABLE,
                "Service is currently unavailable. Please try again later.",
                path(exchange),
                "Unable to connect to downstream service",
                requestId(exchange));
        log.error("Service Unavailable (Connection Refused): path={} error={}", path(exchange), ex.getMessage());
        return ResponseEntity.status(GatewayErrorCode.SERVICE_UNAVAILABLE.getStatus()).body(body);
    }

    @ExceptionHandler({ java.util.concurrent.TimeoutException.class, io.netty.handler.timeout.ReadTimeoutException.class })
    public ResponseEntity<GatewayErrorResponse> handleTimeoutException(Exception ex, ServerWebExchange exchange) {
        GatewayErrorResponse body = build(GatewayErrorCode.TIMEOUT,
                "The request timed out while waiting for the upstream service",
                path(exchange),
                "Upstream service did not respond in time",
                requestId(exchange));
        log.error("Gateway Timeout: path={} error={}", path(exchange), ex.getMessage());
        return ResponseEntity.status(GatewayErrorCode.TIMEOUT.getStatus()).body(body);
    }

    @ExceptionHandler(org.springframework.web.server.ServerWebInputException.class)
    public ResponseEntity<GatewayErrorResponse> handleMalformedRequest(org.springframework.web.server.ServerWebInputException ex,
            ServerWebExchange exchange) {
        GatewayErrorResponse body = build(GatewayErrorCode.VALIDATION_ERROR,
                "Malformed request body or missing parameter",
                path(exchange),
                ex.getReason(),
                requestId(exchange));
        return ResponseEntity.status(GatewayErrorCode.VALIDATION_ERROR.getStatus()).body(body);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<GatewayErrorResponse> handleResponseStatus(ResponseStatusException ex,
            ServerWebExchange exchange) {
        int status = ex.getStatusCode().value();
        GatewayErrorCode mapped;
        if (status == 404) {
            mapped = GatewayErrorCode.ROUTE_NOT_FOUND;
        } else if (status == 401) {
            mapped = GatewayErrorCode.UNAUTHORIZED;
        } else if (status == 403) {
            mapped = GatewayErrorCode.ACCESS_DENIED;
        } else if (status == 502) {
            mapped = GatewayErrorCode.EXTERNAL_SERVICE_ERROR; // preserve 502 Bad Gateway
        } else if (status == 503) {
            mapped = GatewayErrorCode.SERVICE_UNAVAILABLE; // preserve 503 Service Unavailable
        } else if (status >= 500) {
            // Treat as internal unless explicitly known as external (WebClient) via cause
            if (ex.getCause() instanceof WebClientResponseException) {
                mapped = GatewayErrorCode.EXTERNAL_SERVICE_ERROR;
            } else {
                mapped = GatewayErrorCode.INTERNAL_SERVER_ERROR;
            }
        } else if (status >= 400) {
            mapped = GatewayErrorCode.ILLEGAL_ARGUMENT; // generic 4xx fallback
        } else {
            mapped = GatewayErrorCode.INTERNAL_SERVER_ERROR; // unexpected status category
        }
        GatewayErrorResponse body = build(mapped, ex.getReason(), path(exchange), null, requestId(exchange));
        log.error("Gateway ResponseStatusException status={} mapped={} path={} msg={}", status, mapped.getCode(),
                path(exchange), ex.getReason());
        return ResponseEntity.status(mapped.getStatus()).body(body);
    }

    @ExceptionHandler(WebClientResponseException.class)
    public ResponseEntity<GatewayErrorResponse> handleWebClient(WebClientResponseException ex,
            ServerWebExchange exchange) {
        int rawStatus = ex.getStatusCode().value(); // non-deprecated
        GatewayErrorCode mapped;
        if (rawStatus == 404) {
            mapped = GatewayErrorCode.ROUTE_NOT_FOUND; // Upstream 404 surfaces as route not found
        } else if (rawStatus == 401) {
            mapped = GatewayErrorCode.UNAUTHORIZED;
        } else if (rawStatus == 403) {
            mapped = GatewayErrorCode.ACCESS_DENIED;
        } else if (rawStatus == 408 || rawStatus == 504) {
            mapped = GatewayErrorCode.TIMEOUT;
        } else if (rawStatus == 502) {
            mapped = GatewayErrorCode.EXTERNAL_SERVICE_ERROR; // propagate 502
        } else if (rawStatus == 503) {
            mapped = GatewayErrorCode.SERVICE_UNAVAILABLE; // propagate 503
        } else if (rawStatus >= 500) {
            mapped = GatewayErrorCode.EXTERNAL_SERVICE_ERROR;
        } else if (rawStatus >= 400) {
            mapped = GatewayErrorCode.ILLEGAL_ARGUMENT; // client error propagated
        } else {
            mapped = GatewayErrorCode.EXTERNAL_SERVICE_ERROR; // unexpected non-error code treated as external issue
        }
        String details = "upstream_status=" + rawStatus + ", body=" + safeBody(ex);
        GatewayErrorResponse body = build(mapped, ex.getMessage(), path(exchange), details, requestId(exchange));
        log.error("WebClientResponseException upstreamStatus={} mapped={} path={} msg={} details_length={}", rawStatus,
                mapped.getCode(), path(exchange), ex.getMessage(), details.length());
        return ResponseEntity.status(mapped.getStatus()).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<GatewayErrorResponse> handleGeneric(Exception ex, ServerWebExchange exchange) {
        log.error("Unhandled gateway exception path={}", path(exchange), ex);
        // Do not leak internal exception message if blank or sensitive
        String msg = (ex.getMessage() == null || ex.getMessage().isBlank()) ? "Internal error" : ex.getMessage();
        GatewayErrorResponse body = build(GatewayErrorCode.INTERNAL_SERVER_ERROR, msg, path(exchange), null,
                requestId(exchange));
        return ResponseEntity.status(GatewayErrorCode.INTERNAL_SERVER_ERROR.getStatus()).body(body);
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<GatewayErrorResponse> handleRateLimit(RateLimitExceededException ex,
            ServerWebExchange exchange) {
        GatewayErrorResponse body = build(GatewayErrorCode.RATE_LIMIT_EXCEEDED, ex.getMessage(), path(exchange), null,
                requestId(exchange));
        return ResponseEntity.status(GatewayErrorCode.RATE_LIMIT_EXCEEDED.getStatus()).body(body);
    }
}