package com.jaya.common.error;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Unified API Error Response for all microservices.
 * This class provides a consistent error response structure across the entire
 * application.
 * 
 * Example JSON Response:
 * {
 * "errorCode": "USER_001",
 * "message": "User not found.",
 * "status": 404,
 * "path": "/api/users/123",
 * "timestamp": "2024-01-15T10:30:00",
 * "details": "No user exists with ID: 123",
 * "traceId": "abc123-def456",
 * "serviceName": "user-service"
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Unique error code from ErrorCode enum (e.g., "USER_001", "AUTH_002")
     */
    private String errorCode;

    /**
     * Human-readable error message
     */
    private String message;

    /**
     * HTTP status code
     */
    private int status;

    /**
     * The request path that caused the error
     */
    private String path;

    /**
     * Timestamp when the error occurred
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * Additional details about the error (optional)
     */
    private String details;

    /**
     * Distributed tracing ID for log correlation
     */
    private String traceId;

    /**
     * The service that generated this error
     */
    private String serviceName;

    /**
     * Field-specific validation errors (for validation failures)
     */
    private List<FieldError> fieldErrors;

    /**
     * Additional error metadata
     */
    private Map<String, Object> metadata;

    // ========================================
    // STATIC FACTORY METHODS
    // ========================================

    /**
     * Create an ApiError from ErrorCode
     */
    public static ApiError of(ErrorCode errorCode, String path) {
        return ApiError.builder()
                .errorCode(errorCode.getCode())
                .message(errorCode.getMessage())
                .status(errorCode.getHttpStatus().value())
                .path(path)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create an ApiError from ErrorCode with additional details
     */
    public static ApiError of(ErrorCode errorCode, String path, String details) {
        return ApiError.builder()
                .errorCode(errorCode.getCode())
                .message(errorCode.getMessage())
                .status(errorCode.getHttpStatus().value())
                .path(path)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create an ApiError from ErrorCode with custom message
     */
    public static ApiError withMessage(ErrorCode errorCode, String path, String customMessage) {
        return ApiError.builder()
                .errorCode(errorCode.getCode())
                .message(customMessage)
                .status(errorCode.getHttpStatus().value())
                .path(path)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a validation error with field errors
     */
    public static ApiError validationError(String path, List<FieldError> fieldErrors) {
        return ApiError.builder()
                .errorCode(ErrorCode.VALIDATION_FAILED.getCode())
                .message("Validation failed for one or more fields")
                .status(ErrorCode.VALIDATION_FAILED.getHttpStatus().value())
                .path(path)
                .fieldErrors(fieldErrors)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a generic internal server error
     */
    public static ApiError internalError(String path, String details) {
        return ApiError.builder()
                .errorCode(ErrorCode.SYSTEM_INTERNAL_ERROR.getCode())
                .message(ErrorCode.SYSTEM_INTERNAL_ERROR.getMessage())
                .status(ErrorCode.SYSTEM_INTERNAL_ERROR.getHttpStatus().value())
                .path(path)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // ========================================
    // BUILDER HELPERS
    // ========================================

    /**
     * Add traceId to the error
     */
    public ApiError withTraceId(String traceId) {
        this.traceId = traceId;
        return this;
    }

    /**
     * Add service name to the error
     */
    public ApiError withServiceName(String serviceName) {
        this.serviceName = serviceName;
        return this;
    }

    /**
     * Add metadata to the error
     */
    public ApiError withMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
        return this;
    }

    // ========================================
    // INNER CLASSES
    // ========================================

    /**
     * Field-specific error for validation failures
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FieldError implements Serializable {
        private static final long serialVersionUID = 1L;

        /**
         * Field name that has the error
         */
        private String field;

        /**
         * Error message for this field
         */
        private String message;

        /**
         * The value that was rejected
         */
        private Object rejectedValue;

        /**
         * Validation constraint that was violated (e.g., "NotNull", "Size")
         */
        private String constraint;

        /**
         * Create a simple field error
         */
        public static FieldError of(String field, String message) {
            return FieldError.builder()
                    .field(field)
                    .message(message)
                    .build();
        }

        /**
         * Create a field error with rejected value
         */
        public static FieldError of(String field, String message, Object rejectedValue) {
            return FieldError.builder()
                    .field(field)
                    .message(message)
                    .rejectedValue(rejectedValue)
                    .build();
        }
    }
}
