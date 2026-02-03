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
    AUTH_TOKEN_EXPIRED("AUTH_001", "Token has expired. Please login again.", HttpStatus.UNAUTHORIZED),
    AUTH_TOKEN_INVALID("AUTH_002", "Invalid token format.", HttpStatus.UNAUTHORIZED),
    AUTH_TOKEN_SIGNATURE_INVALID("AUTH_003", "Invalid token signature.", HttpStatus.UNAUTHORIZED),
    AUTH_TOKEN_UNSUPPORTED("AUTH_004", "Unsupported token type.", HttpStatus.UNAUTHORIZED),
    AUTH_TOKEN_MISSING("AUTH_005", "Authorization token is required.", HttpStatus.UNAUTHORIZED),
    AUTH_CREDENTIALS_INVALID("AUTH_006", "Invalid username or password.", HttpStatus.UNAUTHORIZED),
    AUTH_ACCOUNT_LOCKED("AUTH_007", "Account is locked. Please contact support.", HttpStatus.UNAUTHORIZED),
    AUTH_ACCOUNT_DISABLED("AUTH_008", "Account is disabled.", HttpStatus.UNAUTHORIZED),
    AUTH_SESSION_EXPIRED("AUTH_009", "Session has expired. Please login again.", HttpStatus.UNAUTHORIZED),

    // ========================================
    // AUTHORIZATION ERRORS (AUTHZ_*)
    // ========================================
    AUTHZ_ACCESS_DENIED("AUTHZ_001", "You don't have permission to access this resource.", HttpStatus.FORBIDDEN),
    AUTHZ_INSUFFICIENT_PRIVILEGES("AUTHZ_002", "Insufficient privileges for this operation.", HttpStatus.FORBIDDEN),
    AUTHZ_RESOURCE_ACCESS_DENIED("AUTHZ_003", "Access denied to this resource.", HttpStatus.FORBIDDEN),
    AUTHZ_ROLE_REQUIRED("AUTHZ_004", "Required role not found.", HttpStatus.FORBIDDEN),

    // ========================================
    // USER ERRORS (USER_*)
    // ========================================
    USER_NOT_FOUND("USER_001", "User not found.", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTS("USER_002", "User already exists with this email.", HttpStatus.CONFLICT),
    USER_EMAIL_TAKEN("USER_003", "Email is already registered.", HttpStatus.CONFLICT),
    USER_USERNAME_TAKEN("USER_004", "Username is already taken.", HttpStatus.CONFLICT),
    USER_INVALID_PASSWORD("USER_005", "Password does not meet requirements.", HttpStatus.BAD_REQUEST),
    USER_PROFILE_UPDATE_FAILED("USER_006", "Failed to update user profile.", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_DELETION_FAILED("USER_007", "Failed to delete user.", HttpStatus.INTERNAL_SERVER_ERROR),

    // ========================================
    // EXPENSE ERRORS (EXPENSE_*)
    // ========================================
    EXPENSE_NOT_FOUND("EXPENSE_001", "Expense not found.", HttpStatus.NOT_FOUND),
    EXPENSE_CREATION_FAILED("EXPENSE_002", "Failed to create expense.", HttpStatus.INTERNAL_SERVER_ERROR),
    EXPENSE_UPDATE_FAILED("EXPENSE_003", "Failed to update expense.", HttpStatus.INTERNAL_SERVER_ERROR),
    EXPENSE_DELETION_FAILED("EXPENSE_004", "Failed to delete expense.", HttpStatus.INTERNAL_SERVER_ERROR),
    EXPENSE_INVALID_AMOUNT("EXPENSE_005", "Invalid expense amount.", HttpStatus.BAD_REQUEST),
    EXPENSE_INVALID_DATE("EXPENSE_006", "Invalid expense date.", HttpStatus.BAD_REQUEST),
    EXPENSE_CATEGORY_REQUIRED("EXPENSE_007", "Expense category is required.", HttpStatus.BAD_REQUEST),
    EXPENSE_ACCESS_DENIED("EXPENSE_008", "You don't have access to this expense.", HttpStatus.FORBIDDEN),

    // ========================================
    // BUDGET ERRORS (BUDGET_*)
    // ========================================
    BUDGET_NOT_FOUND("BUDGET_001", "Budget not found.", HttpStatus.NOT_FOUND),
    BUDGET_CREATION_FAILED("BUDGET_002", "Failed to create budget.", HttpStatus.INTERNAL_SERVER_ERROR),
    BUDGET_UPDATE_FAILED("BUDGET_003", "Failed to update budget.", HttpStatus.INTERNAL_SERVER_ERROR),
    BUDGET_DELETION_FAILED("BUDGET_004", "Failed to delete budget.", HttpStatus.INTERNAL_SERVER_ERROR),
    BUDGET_INVALID_AMOUNT("BUDGET_005", "Invalid budget amount.", HttpStatus.BAD_REQUEST),
    BUDGET_INVALID_DATE_RANGE("BUDGET_006", "End date must be after start date.", HttpStatus.BAD_REQUEST),
    BUDGET_EXCEEDED("BUDGET_007", "Budget limit exceeded.", HttpStatus.BAD_REQUEST),
    BUDGET_THRESHOLD_REACHED("BUDGET_008", "Budget threshold reached.", HttpStatus.OK),
    BUDGET_ACCESS_DENIED("BUDGET_009", "You don't have access to this budget.", HttpStatus.FORBIDDEN),
    BUDGET_ALREADY_EXISTS("BUDGET_010", "Budget already exists for this period.", HttpStatus.CONFLICT),

    // ========================================
    // BILL ERRORS (BILL_*)
    // ========================================
    BILL_NOT_FOUND("BILL_001", "Bill not found.", HttpStatus.NOT_FOUND),
    BILL_CREATION_FAILED("BILL_002", "Failed to create bill.", HttpStatus.INTERNAL_SERVER_ERROR),
    BILL_UPDATE_FAILED("BILL_003", "Failed to update bill.", HttpStatus.INTERNAL_SERVER_ERROR),
    BILL_DELETION_FAILED("BILL_004", "Failed to delete bill.", HttpStatus.INTERNAL_SERVER_ERROR),
    BILL_INVALID_AMOUNT("BILL_005", "Invalid bill amount.", HttpStatus.BAD_REQUEST),
    BILL_INVALID_DUE_DATE("BILL_006", "Invalid due date.", HttpStatus.BAD_REQUEST),
    BILL_ALREADY_PAID("BILL_007", "Bill is already paid.", HttpStatus.CONFLICT),
    BILL_PAYMENT_FAILED("BILL_008", "Bill payment failed.", HttpStatus.INTERNAL_SERVER_ERROR),
    BILL_ACCESS_DENIED("BILL_009", "You don't have access to this bill.", HttpStatus.FORBIDDEN),

    // ========================================
    // CATEGORY ERRORS (CATEGORY_*)
    // ========================================
    CATEGORY_NOT_FOUND("CATEGORY_001", "Category not found.", HttpStatus.NOT_FOUND),
    CATEGORY_CREATION_FAILED("CATEGORY_002", "Failed to create category.", HttpStatus.INTERNAL_SERVER_ERROR),
    CATEGORY_UPDATE_FAILED("CATEGORY_003", "Failed to update category.", HttpStatus.INTERNAL_SERVER_ERROR),
    CATEGORY_DELETION_FAILED("CATEGORY_004", "Failed to delete category.", HttpStatus.INTERNAL_SERVER_ERROR),
    CATEGORY_NAME_REQUIRED("CATEGORY_005", "Category name is required.", HttpStatus.BAD_REQUEST),
    CATEGORY_ALREADY_EXISTS("CATEGORY_006", "Category with this name already exists.", HttpStatus.CONFLICT),
    CATEGORY_IN_USE("CATEGORY_007", "Category is in use and cannot be deleted.", HttpStatus.CONFLICT),
    CATEGORY_ACCESS_DENIED("CATEGORY_008", "You don't have access to this category.", HttpStatus.FORBIDDEN),

    // ========================================
    // PAYMENT METHOD ERRORS (PAYMENT_*)
    // ========================================
    PAYMENT_METHOD_NOT_FOUND("PAYMENT_001", "Payment method not found.", HttpStatus.NOT_FOUND),
    PAYMENT_METHOD_CREATION_FAILED("PAYMENT_002", "Failed to create payment method.", HttpStatus.INTERNAL_SERVER_ERROR),
    PAYMENT_METHOD_UPDATE_FAILED("PAYMENT_003", "Failed to update payment method.", HttpStatus.INTERNAL_SERVER_ERROR),
    PAYMENT_METHOD_DELETION_FAILED("PAYMENT_004", "Failed to delete payment method.", HttpStatus.INTERNAL_SERVER_ERROR),
    PAYMENT_METHOD_INVALID("PAYMENT_005", "Invalid payment method details.", HttpStatus.BAD_REQUEST),
    PAYMENT_METHOD_ALREADY_EXISTS("PAYMENT_006", "Payment method already exists.", HttpStatus.CONFLICT),
    PAYMENT_METHOD_IN_USE("PAYMENT_007", "Payment method is in use and cannot be deleted.", HttpStatus.CONFLICT),
    PAYMENT_METHOD_ACCESS_DENIED("PAYMENT_008", "You don't have access to this payment method.", HttpStatus.FORBIDDEN),

    // ========================================
    // FRIENDSHIP ERRORS (FRIEND_*)
    // ========================================
    FRIEND_REQUEST_NOT_FOUND("FRIEND_001", "Friend request not found.", HttpStatus.NOT_FOUND),
    FRIEND_REQUEST_ALREADY_SENT("FRIEND_002", "Friend request already sent.", HttpStatus.CONFLICT),
    FRIEND_REQUEST_ALREADY_ACCEPTED("FRIEND_003", "Friend request already accepted.", HttpStatus.CONFLICT),
    FRIEND_ALREADY_ADDED("FRIEND_004", "User is already your friend.", HttpStatus.CONFLICT),
    FRIEND_SELF_REQUEST("FRIEND_005", "Cannot send friend request to yourself.", HttpStatus.BAD_REQUEST),
    FRIEND_NOT_FOUND("FRIEND_006", "Friend not found.", HttpStatus.NOT_FOUND),
    FRIEND_REMOVAL_FAILED("FRIEND_007", "Failed to remove friend.", HttpStatus.INTERNAL_SERVER_ERROR),

    // ========================================
    // SHARE ERRORS (SHARE_*)
    // ========================================
    SHARE_NOT_FOUND("SHARE_001", "Share not found.", HttpStatus.NOT_FOUND),
    SHARE_EXPIRED("SHARE_002", "Share link has expired.", HttpStatus.GONE),
    SHARE_ACCESS_DENIED("SHARE_003", "You don't have access to this shared resource.", HttpStatus.FORBIDDEN),
    SHARE_RATE_LIMIT_EXCEEDED("SHARE_004", "Share rate limit exceeded.", HttpStatus.TOO_MANY_REQUESTS),
    SHARE_CREATION_FAILED("SHARE_005", "Failed to create share.", HttpStatus.INTERNAL_SERVER_ERROR),

    // ========================================
    // NOTIFICATION ERRORS (NOTIFICATION_*)
    // ========================================
    NOTIFICATION_NOT_FOUND("NOTIFICATION_001", "Notification not found.", HttpStatus.NOT_FOUND),
    NOTIFICATION_SEND_FAILED("NOTIFICATION_002", "Failed to send notification.", HttpStatus.INTERNAL_SERVER_ERROR),
    NOTIFICATION_UPDATE_FAILED("NOTIFICATION_003", "Failed to update notification.", HttpStatus.INTERNAL_SERVER_ERROR),
    NOTIFICATION_DELETION_FAILED("NOTIFICATION_004", "Failed to delete notification.",
            HttpStatus.INTERNAL_SERVER_ERROR),

    // ========================================
    // KAFKA ERRORS (KAFKA_*)
    // ========================================
    KAFKA_SEND_FAILED("KAFKA_001", "Failed to send message to Kafka.", HttpStatus.INTERNAL_SERVER_ERROR),
    KAFKA_CONSUME_FAILED("KAFKA_002", "Failed to consume message from Kafka.", HttpStatus.INTERNAL_SERVER_ERROR),
    KAFKA_SERIALIZATION_FAILED("KAFKA_003", "Failed to serialize message.", HttpStatus.INTERNAL_SERVER_ERROR),
    KAFKA_DESERIALIZATION_FAILED("KAFKA_004", "Failed to deserialize message.", HttpStatus.INTERNAL_SERVER_ERROR),
    KAFKA_TOPIC_NOT_FOUND("KAFKA_005", "Kafka topic not found.", HttpStatus.INTERNAL_SERVER_ERROR),
    KAFKA_CONNECTION_FAILED("KAFKA_006", "Failed to connect to Kafka broker.", HttpStatus.SERVICE_UNAVAILABLE),

    // ========================================
    // VALIDATION ERRORS (VALIDATION_*)
    // ========================================
    VALIDATION_FAILED("VALIDATION_001", "Validation failed.", HttpStatus.BAD_REQUEST),
    VALIDATION_FIELD_REQUIRED("VALIDATION_002", "Required field is missing.", HttpStatus.BAD_REQUEST),
    VALIDATION_FIELD_INVALID("VALIDATION_003", "Field value is invalid.", HttpStatus.BAD_REQUEST),
    VALIDATION_CONSTRAINT_VIOLATION("VALIDATION_004", "Constraint violation.", HttpStatus.BAD_REQUEST),
    VALIDATION_TYPE_MISMATCH("VALIDATION_005", "Type mismatch in request.", HttpStatus.BAD_REQUEST),
    VALIDATION_REQUEST_BODY_MISSING("VALIDATION_006", "Request body is required.", HttpStatus.BAD_REQUEST),
    VALIDATION_HEADER_MISSING("VALIDATION_007", "Required header is missing.", HttpStatus.BAD_REQUEST),

    // ========================================
    // SYSTEM/GENERIC ERRORS (SYSTEM_*)
    // ========================================
    SYSTEM_INTERNAL_ERROR("SYSTEM_001", "An unexpected error occurred.", HttpStatus.INTERNAL_SERVER_ERROR),
    SYSTEM_SERVICE_UNAVAILABLE("SYSTEM_002", "Service is temporarily unavailable.", HttpStatus.SERVICE_UNAVAILABLE),
    SYSTEM_BAD_GATEWAY("SYSTEM_003", "Downstream service error.", HttpStatus.BAD_GATEWAY),
    SYSTEM_TIMEOUT("SYSTEM_004", "Request timed out.", HttpStatus.GATEWAY_TIMEOUT),
    SYSTEM_RATE_LIMITED("SYSTEM_005", "Too many requests. Please try again later.", HttpStatus.TOO_MANY_REQUESTS),
    SYSTEM_RESOURCE_NOT_FOUND("SYSTEM_006", "Requested resource not found.", HttpStatus.NOT_FOUND),
    SYSTEM_METHOD_NOT_ALLOWED("SYSTEM_007", "HTTP method not allowed.", HttpStatus.METHOD_NOT_ALLOWED),
    SYSTEM_MEDIA_TYPE_NOT_SUPPORTED("SYSTEM_008", "Media type not supported.", HttpStatus.UNSUPPORTED_MEDIA_TYPE),
    SYSTEM_DATABASE_ERROR("SYSTEM_009", "Database operation failed.", HttpStatus.INTERNAL_SERVER_ERROR),
    SYSTEM_CONFIGURATION_ERROR("SYSTEM_010", "System configuration error.", HttpStatus.INTERNAL_SERVER_ERROR),

    // ========================================
    // SEARCH ERRORS (SEARCH_*)
    // ========================================
    SEARCH_FAILED("SEARCH_001", "Search operation failed.", HttpStatus.INTERNAL_SERVER_ERROR),
    SEARCH_INVALID_QUERY("SEARCH_002", "Invalid search query.", HttpStatus.BAD_REQUEST),
    SEARCH_SHORTCUT_NOT_FOUND("SEARCH_003", "Keyboard shortcut not found.", HttpStatus.NOT_FOUND),
    SEARCH_SHORTCUT_RESERVED("SEARCH_004", "This key combination is reserved by the browser.", HttpStatus.CONFLICT),
    SEARCH_SHORTCUT_DUPLICATE("SEARCH_005", "This key combination is already in use.", HttpStatus.CONFLICT),

    // ========================================
    // ANALYTICS ERRORS (ANALYTICS_*)
    // ========================================
    ANALYTICS_REPORT_FAILED("ANALYTICS_001", "Failed to generate analytics report.", HttpStatus.INTERNAL_SERVER_ERROR),
    ANALYTICS_DATA_NOT_FOUND("ANALYTICS_002", "Analytics data not found for the specified period.",
            HttpStatus.NOT_FOUND),
    ANALYTICS_INVALID_DATE_RANGE("ANALYTICS_003", "Invalid date range for analytics.", HttpStatus.BAD_REQUEST),

    // ========================================
    // STORY ERRORS (STORY_*)
    // ========================================
    STORY_NOT_FOUND("STORY_001", "Story not found.", HttpStatus.NOT_FOUND),
    STORY_EXPIRED("STORY_002", "Story has expired.", HttpStatus.GONE),
    STORY_CREATION_FAILED("STORY_003", "Failed to create story.", HttpStatus.INTERNAL_SERVER_ERROR),
    STORY_ACCESS_DENIED("STORY_004", "You don't have access to this story.", HttpStatus.FORBIDDEN),

    // ========================================
    // CHAT ERRORS (CHAT_*)
    // ========================================
    CHAT_MESSAGE_NOT_FOUND("CHAT_001", "Chat message not found.", HttpStatus.NOT_FOUND),
    CHAT_SEND_FAILED("CHAT_002", "Failed to send chat message.", HttpStatus.INTERNAL_SERVER_ERROR),
    CHAT_ROOM_NOT_FOUND("CHAT_003", "Chat room not found.", HttpStatus.NOT_FOUND),
    CHAT_ACCESS_DENIED("CHAT_004", "You don't have access to this chat.", HttpStatus.FORBIDDEN);

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
