package com.jaya.common.exception;

import com.jaya.common.error.ErrorCode;
import lombok.Getter;

/**
 * Exception thrown when a requested resource is not found.
 * This is a common exception used across all microservices.
 * 
 * Usage:
 * 
 * <pre>
 * throw new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, "User", "123");
 * throw new ResourceNotFoundException(ErrorCode.EXPENSE_NOT_FOUND, "Expense not found with ID: 456");
 * </pre>
 */
@Getter
public class ResourceNotFoundException extends BaseException {

    private static final long serialVersionUID = 1L;

    /**
     * Type of resource that was not found (e.g., "User", "Expense", "Budget")
     */
    private final String resourceType;

    /**
     * Identifier of the resource that was not found
     */
    private final String resourceId;

    /**
     * Create exception with error code only
     */
    public ResourceNotFoundException(ErrorCode errorCode) {
        super(errorCode);
        this.resourceType = null;
        this.resourceId = null;
    }

    /**
     * Create exception with error code and details
     */
    public ResourceNotFoundException(ErrorCode errorCode, String details) {
        super(errorCode, details);
        this.resourceType = null;
        this.resourceId = null;
    }

    /**
     * Create exception with resource type and ID
     */
    public ResourceNotFoundException(ErrorCode errorCode, String resourceType, String resourceId) {
        super(errorCode, String.format("%s not found with ID: %s", resourceType, resourceId));
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }

    /**
     * Create exception with resource type and numeric ID
     */
    public ResourceNotFoundException(ErrorCode errorCode, String resourceType, Long resourceId) {
        this(errorCode, resourceType, String.valueOf(resourceId));
    }

    /**
     * Create exception with resource type and integer ID
     */
    public ResourceNotFoundException(ErrorCode errorCode, String resourceType, Integer resourceId) {
        this(errorCode, resourceType, String.valueOf(resourceId));
    }

    // ========================================
    // CONVENIENCE FACTORY METHODS
    // ========================================

    public static ResourceNotFoundException userNotFound(Long userId) {
        return new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, "User", userId);
    }

    public static ResourceNotFoundException userNotFound(Integer userId) {
        return new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, "User", userId);
    }

    public static ResourceNotFoundException expenseNotFound(Long expenseId) {
        return new ResourceNotFoundException(ErrorCode.EXPENSE_NOT_FOUND, "Expense", expenseId);
    }

    public static ResourceNotFoundException budgetNotFound(Long budgetId) {
        return new ResourceNotFoundException(ErrorCode.BUDGET_NOT_FOUND, "Budget", budgetId);
    }

    public static ResourceNotFoundException billNotFound(Long billId) {
        return new ResourceNotFoundException(ErrorCode.BILL_NOT_FOUND, "Bill", billId);
    }

    public static ResourceNotFoundException categoryNotFound(Long categoryId) {
        return new ResourceNotFoundException(ErrorCode.CATEGORY_NOT_FOUND, "Category", categoryId);
    }

    public static ResourceNotFoundException paymentMethodNotFound(Long paymentMethodId) {
        return new ResourceNotFoundException(ErrorCode.PAYMENT_METHOD_NOT_FOUND, "PaymentMethod", paymentMethodId);
    }

    public static ResourceNotFoundException notificationNotFound(Long notificationId) {
        return new ResourceNotFoundException(ErrorCode.NOTIFICATION_NOT_FOUND, "Notification", notificationId);
    }

    public static ResourceNotFoundException friendRequestNotFound(Long requestId) {
        return new ResourceNotFoundException(ErrorCode.FRIEND_REQUEST_NOT_FOUND, "FriendRequest", requestId);
    }
}
