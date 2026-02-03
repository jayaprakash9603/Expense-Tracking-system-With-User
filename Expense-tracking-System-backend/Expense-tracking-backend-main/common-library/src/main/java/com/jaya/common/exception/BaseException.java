package com.jaya.common.exception;

import com.jaya.common.error.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base exception class for all application exceptions.
 * All custom exceptions in the Expense Tracking System should extend this
 * class.
 * 
 * Features:
 * - Consistent error code mapping
 * - HTTP status code association
 * - Support for additional details
 * - Metadata support for complex error scenarios
 * 
 * Usage:
 * 
 * <pre>
 * throw new BaseException(ErrorCode.USER_NOT_FOUND, "User with ID 123 not found");
 * </pre>
 */
@Getter
public class BaseException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * The error code associated with this exception
     */
    private final ErrorCode errorCode;

    /**
     * Additional details about the error
     */
    private final String details;

    /**
     * HTTP status to return (derived from errorCode, but can be overridden)
     */
    private final HttpStatus httpStatus;

    /**
     * Create exception with error code only
     */
    public BaseException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
        this.details = null;
    }

    /**
     * Create exception with error code and details
     */
    public BaseException(ErrorCode errorCode, String details) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
        this.details = details;
    }

    /**
     * Create exception with error code and cause
     */
    public BaseException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
        this.details = cause.getMessage();
    }

    /**
     * Create exception with error code, details, and cause
     */
    public BaseException(ErrorCode errorCode, String details, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
        this.details = details;
    }

    /**
     * Create exception with custom message (overrides error code message)
     */
    public BaseException(ErrorCode errorCode, String customMessage, String details) {
        super(customMessage);
        this.errorCode = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
        this.details = details;
    }

    /**
     * Check if this is a client error (4xx)
     */
    public boolean isClientError() {
        return httpStatus.is4xxClientError();
    }

    /**
     * Check if this is a server error (5xx)
     */
    public boolean isServerError() {
        return httpStatus.is5xxServerError();
    }

    /**
     * Get the error code string
     */
    public String getErrorCodeString() {
        return errorCode.getCode();
    }

    /**
     * Get the HTTP status code value
     */
    public int getStatusCode() {
        return httpStatus.value();
    }
}
