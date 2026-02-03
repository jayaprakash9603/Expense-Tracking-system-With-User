package com.jaya.common.exception;

import com.jaya.common.error.ErrorCode;

/**
 * Exception thrown when a business rule is violated.
 * Used for domain-specific errors that don't fit other categories.
 */
public class BusinessException extends BaseException {

    private static final long serialVersionUID = 1L;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode);
    }

    public BusinessException(ErrorCode errorCode, String details) {
        super(errorCode, details);
    }

    public BusinessException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public BusinessException(ErrorCode errorCode, String details, Throwable cause) {
        super(errorCode, details, cause);
    }

    // Factory methods for common business errors
    public static BusinessException budgetExceeded(Long budgetId, Double currentAmount, Double budgetLimit) {
        return new BusinessException(ErrorCode.BUDGET_EXCEEDED,
                String.format("Budget %d exceeded: current %.2f, limit %.2f", budgetId, currentAmount, budgetLimit));
    }

    public static BusinessException cannotSendFriendRequestToSelf() {
        return new BusinessException(ErrorCode.FRIEND_SELF_REQUEST);
    }

    public static BusinessException shareExpired(String shareCode) {
        return new BusinessException(ErrorCode.SHARE_EXPIRED,
                "Share with code " + shareCode + " has expired");
    }

    public static BusinessException rateLimitExceeded(String resource) {
        return new BusinessException(ErrorCode.SYSTEM_RATE_LIMITED,
                "Rate limit exceeded for: " + resource);
    }
}
