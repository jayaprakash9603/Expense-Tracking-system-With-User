package com.jaya.common.exception;

import com.jaya.common.error.ErrorCode;





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

    
    
    

    public static BusinessException notificationSendFailed(String reason) {
        return new BusinessException(ErrorCode.NOTIFICATION_SEND_FAILED, reason);
    }

    public static BusinessException notificationSendFailed(String reason, Throwable cause) {
        return new BusinessException(ErrorCode.NOTIFICATION_SEND_FAILED, reason, cause);
    }

    public static BusinessException notificationUpdateFailed(Long notificationId) {
        return new BusinessException(ErrorCode.NOTIFICATION_UPDATE_FAILED,
                "Failed to update notification with ID: " + notificationId);
    }

    public static BusinessException notificationDeletionFailed(Long notificationId) {
        return new BusinessException(ErrorCode.NOTIFICATION_DELETION_FAILED,
                "Failed to delete notification with ID: " + notificationId);
    }

    
    
    

    public static BusinessException categoryInUse(Long categoryId) {
        return new BusinessException(ErrorCode.CATEGORY_IN_USE,
                "Category with ID " + categoryId + " is in use and cannot be deleted");
    }

    public static BusinessException categoryAlreadyExists(String categoryName) {
        return new BusinessException(ErrorCode.CATEGORY_ALREADY_EXISTS,
                "Category with name '" + categoryName + "' already exists");
    }

    
    
    

    public static BusinessException paymentMethodInUse(Long paymentMethodId) {
        return new BusinessException(ErrorCode.PAYMENT_METHOD_IN_USE,
                "Payment method with ID " + paymentMethodId + " is in use and cannot be deleted");
    }

    public static BusinessException paymentMethodAlreadyExists(String name) {
        return new BusinessException(ErrorCode.PAYMENT_METHOD_ALREADY_EXISTS,
                "Payment method with name '" + name + "' already exists");
    }

    
    
    

    public static BusinessException billAlreadyPaid(Long billId) {
        return new BusinessException(ErrorCode.BILL_ALREADY_PAID,
                "Bill with ID " + billId + " is already paid");
    }

    public static BusinessException billPaymentFailed(Long billId, String reason) {
        return new BusinessException(ErrorCode.BILL_PAYMENT_FAILED,
                "Payment failed for bill " + billId + ": " + reason);
    }

    
    
    

    public static BusinessException userAlreadyExists(String email) {
        return new BusinessException(ErrorCode.USER_ALREADY_EXISTS,
                "User already exists with email: " + email);
    }

    public static BusinessException emailAlreadyTaken(String email) {
        return new BusinessException(ErrorCode.USER_EMAIL_TAKEN,
                "Email '" + email + "' is already registered");
    }

    public static BusinessException usernameAlreadyTaken(String username) {
        return new BusinessException(ErrorCode.USER_USERNAME_TAKEN,
                "Username '" + username + "' is already taken");
    }

    
    
    

    public static BusinessException friendRequestAlreadySent(Long userId, Long friendId) {
        return new BusinessException(ErrorCode.FRIEND_REQUEST_ALREADY_SENT,
                "Friend request already sent from user " + userId + " to user " + friendId);
    }

    public static BusinessException friendRequestAlreadyAccepted(Long requestId) {
        return new BusinessException(ErrorCode.FRIEND_REQUEST_ALREADY_ACCEPTED,
                "Friend request " + requestId + " is already accepted");
    }

    public static BusinessException alreadyFriends(Long userId, Long friendId) {
        return new BusinessException(ErrorCode.FRIEND_ALREADY_ADDED,
                "Users " + userId + " and " + friendId + " are already friends");
    }
}
