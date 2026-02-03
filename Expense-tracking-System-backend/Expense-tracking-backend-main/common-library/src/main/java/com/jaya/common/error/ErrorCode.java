package com.jaya.common.error;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Unified Error Codes for the Expense Tracking System.
 * All microservices should use these error codes for consistent error
 * responses.
 * 
 * Error Code Format: [CATEGORY]_[SPECIFIC_ERROR]
 * - Categories: AUTH, USER, EXPENSE, BUDGET, BILL, CATEGORY, PAYMENT,
 * NOTIFICATION, KAFKA, VALIDATION, SYSTEM
 * 
 * HTTP Status Mapping:
 * - 400 Bad Request: Validation errors, invalid input
 * - 401 Unauthorized: Authentication failures
 * - 403 Forbidden: Authorization failures
 * - 404 Not Found: Resource not found
 * - 409 Conflict: Duplicate resources, state conflicts
 * - 429 Too Many Requests: Rate limiting
 * - 500 Internal Server Error: Unexpected system errors
 * - 502 Bad Gateway: Downstream service errors
 * - 503 Service Unavailable: Service temporarily unavailable
 */
@Getter
public enum ErrorCode {

    // ========================================
    // AUTHENTICATION ERRORS (AUTH_*)
    // ========================================
    AUTH_TOKEN_EXPIRED("AUTH_TOKEN_EXPIRED", "Token has expired. Please login again.", HttpStatus.UNAUTHORIZED),
    AUTH_TOKEN_INVALID("AUTH_TOKEN_INVALID", "Invalid token format.", HttpStatus.UNAUTHORIZED),
    AUTH_TOKEN_SIGNATURE_INVALID("AUTH_SIGNATURE_INVALID", "Invalid token signature.", HttpStatus.UNAUTHORIZED),
    AUTH_TOKEN_UNSUPPORTED("AUTH_TOKEN_UNSUPPORTED", "Unsupported token type.", HttpStatus.UNAUTHORIZED),
    AUTH_TOKEN_MISSING("AUTH_TOKEN_MISSING", "Authorization token is required.", HttpStatus.UNAUTHORIZED),
    AUTH_CREDENTIALS_INVALID("AUTH_INVALID_CREDENTIALS", "Invalid username or password.", HttpStatus.UNAUTHORIZED),
    AUTH_ACCOUNT_LOCKED("AUTH_ACCOUNT_LOCKED", "Account is locked. Please contact support.", HttpStatus.UNAUTHORIZED),
    AUTH_ACCOUNT_DISABLED("AUTH_ACCOUNT_DISABLED", "Account is disabled.", HttpStatus.UNAUTHORIZED),
    AUTH_SESSION_EXPIRED("AUTH_SESSION_EXPIRED", "Session has expired. Please login again.", HttpStatus.UNAUTHORIZED),

    // ========================================
    // AUTHORIZATION ERRORS (AUTHZ_*)
    // ========================================
    AUTHZ_ACCESS_DENIED("ACCESS_DENIED", "You don't have permission to access this resource.", HttpStatus.FORBIDDEN),
    AUTHZ_INSUFFICIENT_PRIVILEGES("INSUFFICIENT_PRIVILEGES", "Insufficient privileges for this operation.",
            HttpStatus.FORBIDDEN),
    AUTHZ_RESOURCE_ACCESS_DENIED("RESOURCE_ACCESS_DENIED", "Access denied to this resource.", HttpStatus.FORBIDDEN),
    AUTHZ_ROLE_REQUIRED("ROLE_REQUIRED", "Required role not found.", HttpStatus.FORBIDDEN),

    // ========================================
    // USER ERRORS (USER_*)
    // ========================================
    USER_NOT_FOUND("USER_NOT_FOUND", "User not found.", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTS("USER_ALREADY_EXISTS", "User already exists with this email.", HttpStatus.CONFLICT),
    USER_EMAIL_TAKEN("USER_EMAIL_TAKEN", "Email is already registered.", HttpStatus.CONFLICT),
    USER_USERNAME_TAKEN("USER_USERNAME_TAKEN", "Username is already taken.", HttpStatus.CONFLICT),
    USER_INVALID_PASSWORD("USER_INVALID_PASSWORD", "Password does not meet requirements.", HttpStatus.BAD_REQUEST),
    USER_PROFILE_UPDATE_FAILED("USER_UPDATE_FAILED", "Failed to update user profile.",
            HttpStatus.INTERNAL_SERVER_ERROR),
    USER_DELETION_FAILED("USER_DELETION_FAILED", "Failed to delete user.", HttpStatus.INTERNAL_SERVER_ERROR),

    // ========================================
    // EXPENSE ERRORS (EXPENSE_*)
    // ========================================
    EXPENSE_NOT_FOUND("EXPENSE_NOT_FOUND", "Expense not found.", HttpStatus.NOT_FOUND),
    EXPENSE_CREATION_FAILED("EXPENSE_CREATION_FAILED", "Failed to create expense.", HttpStatus.INTERNAL_SERVER_ERROR),
    EXPENSE_UPDATE_FAILED("EXPENSE_UPDATE_FAILED", "Failed to update expense.", HttpStatus.INTERNAL_SERVER_ERROR),
    EXPENSE_DELETION_FAILED("EXPENSE_DELETION_FAILED", "Failed to delete expense.", HttpStatus.INTERNAL_SERVER_ERROR),
    EXPENSE_INVALID_AMOUNT("EXPENSE_INVALID_AMOUNT", "Invalid expense amount.", HttpStatus.BAD_REQUEST),
    EXPENSE_INVALID_DATE("EXPENSE_INVALID_DATE", "Invalid expense date.", HttpStatus.BAD_REQUEST),
    EXPENSE_CATEGORY_REQUIRED("EXPENSE_CATEGORY_REQUIRED", "Expense category is required.", HttpStatus.BAD_REQUEST),
    EXPENSE_ACCESS_DENIED("EXPENSE_ACCESS_DENIED", "You don't have access to this expense.", HttpStatus.FORBIDDEN),

    // ========================================
    // BUDGET ERRORS (BUDGET_*)
    // ========================================
    BUDGET_NOT_FOUND("BUDGET_NOT_FOUND", "Budget not found.", HttpStatus.NOT_FOUND),
    BUDGET_CREATION_FAILED("BUDGET_CREATION_FAILED", "Failed to create budget.", HttpStatus.INTERNAL_SERVER_ERROR),
    BUDGET_UPDATE_FAILED("BUDGET_UPDATE_FAILED", "Failed to update budget.", HttpStatus.INTERNAL_SERVER_ERROR),
    BUDGET_DELETION_FAILED("BUDGET_DELETION_FAILED", "Failed to delete budget.", HttpStatus.INTERNAL_SERVER_ERROR),
    BUDGET_INVALID_AMOUNT("BUDGET_INVALID_AMOUNT", "Invalid budget amount.", HttpStatus.BAD_REQUEST),
    BUDGET_INVALID_DATE_RANGE("BUDGET_INVALID_DATE_RANGE", "End date must be after start date.",
            HttpStatus.BAD_REQUEST),
    BUDGET_EXCEEDED("BUDGET_EXCEEDED", "Budget limit exceeded.", HttpStatus.BAD_REQUEST),
    BUDGET_THRESHOLD_REACHED("BUDGET_THRESHOLD_REACHED", "Budget threshold reached.", HttpStatus.OK),
    BUDGET_ACCESS_DENIED("BUDGET_ACCESS_DENIED", "You don't have access to this budget.", HttpStatus.FORBIDDEN),
    BUDGET_ALREADY_EXISTS("BUDGET_ALREADY_EXISTS", "Budget already exists for this period.", HttpStatus.CONFLICT),

    // ========================================
    // BILL ERRORS (BILL_*)
    // ========================================
    BILL_NOT_FOUND("BILL_NOT_FOUND", "Bill not found.", HttpStatus.NOT_FOUND),
    BILL_CREATION_FAILED("BILL_CREATION_FAILED", "Failed to create bill.", HttpStatus.INTERNAL_SERVER_ERROR),
    BILL_UPDATE_FAILED("BILL_UPDATE_FAILED", "Failed to update bill.", HttpStatus.INTERNAL_SERVER_ERROR),
    BILL_DELETION_FAILED("BILL_DELETION_FAILED", "Failed to delete bill.", HttpStatus.INTERNAL_SERVER_ERROR),
    BILL_INVALID_AMOUNT("BILL_INVALID_AMOUNT", "Invalid bill amount.", HttpStatus.BAD_REQUEST),
    BILL_INVALID_DUE_DATE("BILL_INVALID_DUE_DATE", "Invalid due date.", HttpStatus.BAD_REQUEST),
    BILL_ALREADY_PAID("BILL_ALREADY_PAID", "Bill is already paid.", HttpStatus.CONFLICT),
    BILL_PAYMENT_FAILED("BILL_PAYMENT_FAILED", "Bill payment failed.", HttpStatus.INTERNAL_SERVER_ERROR),
    BILL_ACCESS_DENIED("BILL_ACCESS_DENIED", "You don't have access to this bill.", HttpStatus.FORBIDDEN),

    // ========================================
    // CATEGORY ERRORS (CATEGORY_*)
    // ========================================
    CATEGORY_NOT_FOUND("CATEGORY_NOT_FOUND", "Category not found.", HttpStatus.NOT_FOUND),
    CATEGORY_CREATION_FAILED("CATEGORY_CREATION_FAILED", "Failed to create category.",
            HttpStatus.INTERNAL_SERVER_ERROR),
    CATEGORY_UPDATE_FAILED("CATEGORY_UPDATE_FAILED", "Failed to update category.", HttpStatus.INTERNAL_SERVER_ERROR),
    CATEGORY_DELETION_FAILED("CATEGORY_DELETION_FAILED", "Failed to delete category.",
            HttpStatus.INTERNAL_SERVER_ERROR),
    CATEGORY_NAME_REQUIRED("CATEGORY_NAME_REQUIRED", "Category name is required.", HttpStatus.BAD_REQUEST),
    CATEGORY_ALREADY_EXISTS("CATEGORY_ALREADY_EXISTS", "Category with this name already exists.", HttpStatus.CONFLICT),
    CATEGORY_IN_USE("CATEGORY_IN_USE", "Category is in use and cannot be deleted.", HttpStatus.CONFLICT),
    CATEGORY_ACCESS_DENIED("CATEGORY_ACCESS_DENIED", "You don't have access to this category.", HttpStatus.FORBIDDEN),

    // ========================================
    // PAYMENT METHOD ERRORS (PAYMENT_*)
    // ========================================
    PAYMENT_METHOD_NOT_FOUND("PAYMENT_METHOD_NOT_FOUND", "Payment method not found.", HttpStatus.NOT_FOUND),
    PAYMENT_METHOD_CREATION_FAILED("PAYMENT_METHOD_CREATION_FAILED", "Failed to create payment method.",
            HttpStatus.INTERNAL_SERVER_ERROR),
    PAYMENT_METHOD_UPDATE_FAILED("PAYMENT_METHOD_UPDATE_FAILED", "Failed to update payment method.",
            HttpStatus.INTERNAL_SERVER_ERROR),
    PAYMENT_METHOD_DELETION_FAILED("PAYMENT_METHOD_DELETION_FAILED", "Failed to delete payment method.",
            HttpStatus.INTERNAL_SERVER_ERROR),
    PAYMENT_METHOD_INVALID("PAYMENT_METHOD_INVALID", "Invalid payment method details.", HttpStatus.BAD_REQUEST),
    PAYMENT_METHOD_ALREADY_EXISTS("PAYMENT_METHOD_ALREADY_EXISTS", "Payment method already exists.",
            HttpStatus.CONFLICT),
    PAYMENT_METHOD_IN_USE("PAYMENT_METHOD_IN_USE", "Payment method is in use and cannot be deleted.",
            HttpStatus.CONFLICT),
    PAYMENT_METHOD_ACCESS_DENIED("PAYMENT_METHOD_ACCESS_DENIED", "You don't have access to this payment method.",
            HttpStatus.FORBIDDEN),

    // ========================================
    // FRIENDSHIP ERRORS (FRIEND_*)
    // ========================================
    FRIEND_REQUEST_NOT_FOUND("FRIEND_REQUEST_NOT_FOUND", "Friend request not found.", HttpStatus.NOT_FOUND),
    FRIEND_REQUEST_ALREADY_SENT("FRIEND_REQUEST_ALREADY_SENT", "Friend request already sent.", HttpStatus.CONFLICT),
    FRIEND_REQUEST_ALREADY_ACCEPTED("FRIEND_REQUEST_ALREADY_ACCEPTED", "Friend request already accepted.",
            HttpStatus.CONFLICT),
    FRIEND_ALREADY_ADDED("FRIEND_ALREADY_ADDED", "User is already your friend.", HttpStatus.CONFLICT),
    FRIEND_SELF_REQUEST("FRIEND_SELF_REQUEST", "Cannot send friend request to yourself.", HttpStatus.BAD_REQUEST),
    FRIEND_NOT_FOUND("FRIEND_NOT_FOUND", "Friend not found.", HttpStatus.NOT_FOUND),
    FRIEND_REMOVAL_FAILED("FRIEND_REMOVAL_FAILED", "Failed to remove friend.", HttpStatus.INTERNAL_SERVER_ERROR),

    // ========================================
    // SHARE ERRORS (SHARE_*)
    // ========================================
    SHARE_NOT_FOUND("SHARE_NOT_FOUND", "Share not found.", HttpStatus.NOT_FOUND),
    SHARE_EXPIRED("SHARE_EXPIRED", "Share link has expired.", HttpStatus.GONE),
    SHARE_ACCESS_DENIED("SHARE_ACCESS_DENIED", "You don't have access to this shared resource.", HttpStatus.FORBIDDEN),
    SHARE_RATE_LIMIT_EXCEEDED("SHARE_RATE_LIMIT_EXCEEDED", "Share rate limit exceeded.", HttpStatus.TOO_MANY_REQUESTS),
    SHARE_CREATION_FAILED("SHARE_CREATION_FAILED", "Failed to create share.", HttpStatus.INTERNAL_SERVER_ERROR),

    // ========================================
    // NOTIFICATION ERRORS (NOTIFICATION_*)
    // ========================================
    NOTIFICATION_NOT_FOUND("NOTIFICATION_NOT_FOUND", "Notification not found.", HttpStatus.NOT_FOUND),
    NOTIFICATION_SEND_FAILED("NOTIFICATION_SEND_FAILED", "Failed to send notification.",
            HttpStatus.INTERNAL_SERVER_ERROR),
    NOTIFICATION_UPDATE_FAILED("NOTIFICATION_UPDATE_FAILED", "Failed to update notification.",
            HttpStatus.INTERNAL_SERVER_ERROR),
    NOTIFICATION_DELETION_FAILED("NOTIFICATION_DELETION_FAILED", "Failed to delete notification.",
            HttpStatus.INTERNAL_SERVER_ERROR),

    // ========================================
    // KAFKA ERRORS (KAFKA_*)
    // ========================================
    KAFKA_SEND_FAILED("KAFKA_SEND_FAILED", "Failed to send message to Kafka.", HttpStatus.INTERNAL_SERVER_ERROR),
    KAFKA_CONSUME_FAILED("KAFKA_CONSUME_FAILED", "Failed to consume message from Kafka.",
            HttpStatus.INTERNAL_SERVER_ERROR),
    KAFKA_SERIALIZATION_FAILED("KAFKA_SERIALIZATION_FAILED", "Failed to serialize message.",
            HttpStatus.INTERNAL_SERVER_ERROR),
    KAFKA_DESERIALIZATION_FAILED("KAFKA_DESERIALIZATION_FAILED", "Failed to deserialize message.",
            HttpStatus.INTERNAL_SERVER_ERROR),
    KAFKA_TOPIC_NOT_FOUND("KAFKA_TOPIC_NOT_FOUND", "Kafka topic not found.", HttpStatus.INTERNAL_SERVER_ERROR),
    KAFKA_CONNECTION_FAILED("KAFKA_CONNECTION_FAILED", "Failed to connect to Kafka broker.",
            HttpStatus.SERVICE_UNAVAILABLE),

    // ========================================
    // VALIDATION ERRORS (VALIDATION_*)
    // ========================================
    VALIDATION_FAILED("VALIDATION_FAILED", "Validation failed.", HttpStatus.BAD_REQUEST),
    VALIDATION_FIELD_REQUIRED("FIELD_REQUIRED", "Required field is missing.", HttpStatus.BAD_REQUEST),
    VALIDATION_FIELD_INVALID("FIELD_INVALID", "Field value is invalid.", HttpStatus.BAD_REQUEST),
    VALIDATION_CONSTRAINT_VIOLATION("CONSTRAINT_VIOLATION", "Constraint violation.", HttpStatus.BAD_REQUEST),
    VALIDATION_TYPE_MISMATCH("TYPE_MISMATCH", "Type mismatch in request.", HttpStatus.BAD_REQUEST),
    VALIDATION_REQUEST_BODY_MISSING("REQUEST_BODY_MISSING", "Request body is required.", HttpStatus.BAD_REQUEST),
    VALIDATION_HEADER_MISSING("HEADER_MISSING", "Required header is missing.", HttpStatus.BAD_REQUEST),

    // ========================================
    // SYSTEM/GENERIC ERRORS (SYSTEM_*)
    // ========================================
    SYSTEM_INTERNAL_ERROR("INTERNAL_SERVER_ERROR", "An unexpected error occurred.", HttpStatus.INTERNAL_SERVER_ERROR),
    SYSTEM_SERVICE_UNAVAILABLE("SERVICE_UNAVAILABLE", "Service is temporarily unavailable.",
            HttpStatus.SERVICE_UNAVAILABLE),
    SYSTEM_BAD_GATEWAY("BAD_GATEWAY", "Downstream service error.", HttpStatus.BAD_GATEWAY),
    SYSTEM_TIMEOUT("REQUEST_TIMEOUT", "Request timed out.", HttpStatus.GATEWAY_TIMEOUT),
    SYSTEM_RATE_LIMITED("RATE_LIMITED", "Too many requests. Please try again later.", HttpStatus.TOO_MANY_REQUESTS),
    SYSTEM_RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND", "Requested resource not found.", HttpStatus.NOT_FOUND),
    SYSTEM_METHOD_NOT_ALLOWED("METHOD_NOT_ALLOWED", "HTTP method not allowed.", HttpStatus.METHOD_NOT_ALLOWED),
    SYSTEM_MEDIA_TYPE_NOT_SUPPORTED("MEDIA_TYPE_NOT_SUPPORTED", "Media type not supported.",
            HttpStatus.UNSUPPORTED_MEDIA_TYPE),
    SYSTEM_DATABASE_ERROR("DATABASE_ERROR", "Database operation failed.", HttpStatus.INTERNAL_SERVER_ERROR),
    SYSTEM_CONFIGURATION_ERROR("CONFIGURATION_ERROR", "System configuration error.", HttpStatus.INTERNAL_SERVER_ERROR),

    // ========================================
    // SEARCH ERRORS (SEARCH_*)
    // ========================================
    SEARCH_FAILED("SEARCH_FAILED", "Search operation failed.", HttpStatus.INTERNAL_SERVER_ERROR),
    SEARCH_INVALID_QUERY("SEARCH_INVALID_QUERY", "Invalid search query.", HttpStatus.BAD_REQUEST),
    SEARCH_SHORTCUT_NOT_FOUND("SHORTCUT_NOT_FOUND", "Keyboard shortcut not found.", HttpStatus.NOT_FOUND),
    SEARCH_SHORTCUT_RESERVED("SHORTCUT_RESERVED", "This key combination is reserved by the browser.",
            HttpStatus.CONFLICT),
    SEARCH_SHORTCUT_DUPLICATE("SHORTCUT_DUPLICATE", "This key combination is already in use.", HttpStatus.CONFLICT),

    // ========================================
    // ANALYTICS ERRORS (ANALYTICS_*)
    // ========================================
    ANALYTICS_REPORT_FAILED("ANALYTICS_REPORT_FAILED", "Failed to generate analytics report.",
            HttpStatus.INTERNAL_SERVER_ERROR),
    ANALYTICS_DATA_NOT_FOUND("ANALYTICS_DATA_NOT_FOUND", "Analytics data not found for the specified period.",
            HttpStatus.NOT_FOUND),
    ANALYTICS_INVALID_DATE_RANGE("ANALYTICS_INVALID_DATE_RANGE", "Invalid date range for analytics.",
            HttpStatus.BAD_REQUEST),

    // ========================================
    // STORY ERRORS (STORY_*)
    // ========================================
    STORY_NOT_FOUND("STORY_NOT_FOUND", "Story not found.", HttpStatus.NOT_FOUND),
    STORY_EXPIRED("STORY_EXPIRED", "Story has expired.", HttpStatus.GONE),
    STORY_CREATION_FAILED("STORY_CREATION_FAILED", "Failed to create story.", HttpStatus.INTERNAL_SERVER_ERROR),
    STORY_ACCESS_DENIED("STORY_ACCESS_DENIED", "You don't have access to this story.", HttpStatus.FORBIDDEN),

    // ========================================
    // CHAT ERRORS (CHAT_*)
    // ========================================
    CHAT_MESSAGE_NOT_FOUND("CHAT_MESSAGE_NOT_FOUND", "Chat message not found.", HttpStatus.NOT_FOUND),
    CHAT_SEND_FAILED("CHAT_SEND_FAILED", "Failed to send chat message.", HttpStatus.INTERNAL_SERVER_ERROR),
    CHAT_ROOM_NOT_FOUND("CHAT_ROOM_NOT_FOUND", "Chat room not found.", HttpStatus.NOT_FOUND),
    CHAT_ACCESS_DENIED("CHAT_ACCESS_DENIED", "You don't have access to this chat.", HttpStatus.FORBIDDEN);

    /**
     * Unique error code (e.g., "AUTH_001")
     */
    private final String code;

    /**
     * Human-readable error message
     */
    private final String message;

    /**
     * HTTP status code to return
     */
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

    /**
     * Get error code by its code string
     * 
     * @param code the error code string (e.g., "AUTH_001")
     * @return the ErrorCode enum value, or SYSTEM_INTERNAL_ERROR if not found
     */
    public static ErrorCode fromCode(String code) {
        for (ErrorCode errorCode : values()) {
            if (errorCode.getCode().equals(code)) {
                return errorCode;
            }
        }
        return SYSTEM_INTERNAL_ERROR;
    }

    /**
     * Check if this error represents a client error (4xx)
     */
    public boolean isClientError() {
        return httpStatus.is4xxClientError();
    }

    /**
     * Check if this error represents a server error (5xx)
     */
    public boolean isServerError() {
        return httpStatus.is5xxServerError();
    }
}
