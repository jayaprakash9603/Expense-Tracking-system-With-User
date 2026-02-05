package com.jaya.error;

import org.springframework.http.HttpStatus;
public enum GatewayErrorCode {
    UNAUTHORIZED("UNAUTHORIZED", "Authentication failed or token expired", HttpStatus.UNAUTHORIZED),

    ACCESS_DENIED("ACCESS_DENIED", "You do not have permission to perform this action", HttpStatus.FORBIDDEN),
    ROUTE_NOT_FOUND("ROUTE_NOT_FOUND", "No route found for the requested path", HttpStatus.NOT_FOUND),
    VALIDATION_ERROR("VALIDATION_ERROR", "Validation failed for one or more fields", HttpStatus.BAD_REQUEST),
    ILLEGAL_ARGUMENT("ILLEGAL_ARGUMENT", "Invalid request parameter", HttpStatus.BAD_REQUEST),
    EXTERNAL_SERVICE_ERROR("EXTERNAL_SERVICE_ERROR", "Downstream service responded with an error",
            HttpStatus.BAD_GATEWAY),
    SERVICE_UNAVAILABLE("SERVICE_UNAVAILABLE", "Downstream service unavailable", HttpStatus.SERVICE_UNAVAILABLE),
    TIMEOUT("TIMEOUT", "Downstream service timed out", HttpStatus.GATEWAY_TIMEOUT),
    RATE_LIMIT_EXCEEDED("RATE_LIMIT_EXCEEDED", "Too many requests - rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS),
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", "An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String defaultDetails;
    private final HttpStatus status;

    GatewayErrorCode(String code, String defaultDetails, HttpStatus status) {
        this.code = code;
        this.defaultDetails = defaultDetails;
        this.status = status;
    }

    public String getCode() {
        return code;
    }

    public String getDefaultDetails() {
        return defaultDetails;
    }

    public HttpStatus getStatus() {
        return status;
    }
}