package com.jaya.exceptions;


import org.springframework.http.HttpStatus;

/**
 * Centralized definition of API error codes and their default human-readable
 * detail text.
 * This removes magic strings from handlers and promotes reuse across services.
 */
public enum ErrorMetadata {
    // 4xx (Client) errors
    NOTIFICATION_NOT_FOUND("NOTIFICATION_NOT_FOUND", "The requested notification could not be found",
            org.springframework.http.HttpStatus.NOT_FOUND),
    BUDGET_NOT_FOUND("BUDGET_NOT_FOUND", "The requested budget could not be found",
            HttpStatus.NOT_FOUND),
    USER_NOT_FOUND("USER_NOT_FOUND", "The specified user could not be found",
            HttpStatus.NOT_FOUND),
    NOTIFICATION_ERROR("NOTIFICATION_ERROR", "An error occurred while processing the notification",
            HttpStatus.BAD_REQUEST),
    VALIDATION_ERROR("VALIDATION_ERROR", "Validation failed for one or more fields",
            HttpStatus.BAD_REQUEST),
    BINDING_ERROR("BINDING_ERROR", "Request binding failed", HttpStatus.BAD_REQUEST),
    TYPE_MISMATCH("TYPE_MISMATCH", "Parameter type mismatch occurred", HttpStatus.BAD_REQUEST),
    ILLEGAL_ARGUMENT("ILLEGAL_ARGUMENT", "Invalid argument provided", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("UNAUTHORIZED", "Invalid or expired authentication token",
            HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED("ACCESS_DENIED", "You do not have permission to perform this action",
            HttpStatus.FORBIDDEN),
    EXTERNAL_SERVICE_ERROR("EXTERNAL_SERVICE_ERROR", "An external service call failed",
            HttpStatus.BAD_GATEWAY),
    // 5xx (Server) errors
    RUNTIME_ERROR("RUNTIME_ERROR", "An unexpected runtime error occurred",
            HttpStatus.INTERNAL_SERVER_ERROR),
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", "An unexpected error occurred",
            HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String defaultDetails;
    private final HttpStatus status;

    ErrorMetadata(String code, String defaultDetails, HttpStatus status) {
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