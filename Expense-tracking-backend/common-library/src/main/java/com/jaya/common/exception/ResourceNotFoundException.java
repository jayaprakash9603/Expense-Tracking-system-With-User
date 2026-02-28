package com.jaya.common.exception;

import com.jaya.common.error.ErrorCode;
import lombok.Getter;












@Getter
public class ResourceNotFoundException extends BaseException {

    private static final long serialVersionUID = 1L;

    


    private final String resourceType;

    


    private final String resourceId;

    


    public ResourceNotFoundException(ErrorCode errorCode) {
        super(errorCode);
        this.resourceType = null;
        this.resourceId = null;
    }

    


    public ResourceNotFoundException(ErrorCode errorCode, String details) {
        super(errorCode, details);
        this.resourceType = null;
        this.resourceId = null;
    }

    


    public ResourceNotFoundException(ErrorCode errorCode, String resourceType, String resourceId) {
        super(errorCode, String.format("%s not found with ID: %s", resourceType, resourceId));
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }

    


    public ResourceNotFoundException(ErrorCode errorCode, String resourceType, Long resourceId) {
        this(errorCode, resourceType, String.valueOf(resourceId));
    }

    


    public ResourceNotFoundException(ErrorCode errorCode, String resourceType, Integer resourceId) {
        this(errorCode, resourceType, String.valueOf(resourceId));
    }

    
    
    

    public static ResourceNotFoundException userNotFound(Long userId) {
        return new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, "User", userId);
    }

    public static ResourceNotFoundException userNotFound(Integer userId) {
        return new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, "User", userId);
    }

    public static ResourceNotFoundException expenseNotFound(Long expenseId) {
        return new ResourceNotFoundException(ErrorCode.EXPENSE_NOT_FOUND, "Expense", expenseId);
    }

    public static ResourceNotFoundException expenseNotFound(Integer expenseId) {
        return new ResourceNotFoundException(ErrorCode.EXPENSE_NOT_FOUND, "Expense", expenseId);
    }

    public static ResourceNotFoundException budgetNotFound(Long budgetId) {
        return new ResourceNotFoundException(ErrorCode.BUDGET_NOT_FOUND, "Budget", budgetId);
    }

    public static ResourceNotFoundException budgetNotFound(Integer budgetId) {
        return new ResourceNotFoundException(ErrorCode.BUDGET_NOT_FOUND, "Budget", budgetId);
    }

    public static ResourceNotFoundException billNotFound(Long billId) {
        return new ResourceNotFoundException(ErrorCode.BILL_NOT_FOUND, "Bill", billId);
    }

    public static ResourceNotFoundException billNotFound(Integer billId) {
        return new ResourceNotFoundException(ErrorCode.BILL_NOT_FOUND, "Bill", billId);
    }

    public static ResourceNotFoundException categoryNotFound(Long categoryId) {
        return new ResourceNotFoundException(ErrorCode.CATEGORY_NOT_FOUND, "Category", categoryId);
    }

    public static ResourceNotFoundException categoryNotFound(Integer categoryId) {
        return new ResourceNotFoundException(ErrorCode.CATEGORY_NOT_FOUND, "Category", categoryId);
    }

    public static ResourceNotFoundException paymentMethodNotFound(Long paymentMethodId) {
        return new ResourceNotFoundException(ErrorCode.PAYMENT_METHOD_NOT_FOUND, "PaymentMethod", paymentMethodId);
    }

    public static ResourceNotFoundException paymentMethodNotFound(Integer paymentMethodId) {
        return new ResourceNotFoundException(ErrorCode.PAYMENT_METHOD_NOT_FOUND, "PaymentMethod", paymentMethodId);
    }

    public static ResourceNotFoundException notificationNotFound(Long notificationId) {
        return new ResourceNotFoundException(ErrorCode.NOTIFICATION_NOT_FOUND, "Notification", notificationId);
    }

    public static ResourceNotFoundException notificationNotFound(Integer notificationId) {
        return new ResourceNotFoundException(ErrorCode.NOTIFICATION_NOT_FOUND, "Notification", notificationId);
    }

    public static ResourceNotFoundException friendRequestNotFound(Long requestId) {
        return new ResourceNotFoundException(ErrorCode.FRIEND_REQUEST_NOT_FOUND, "FriendRequest", requestId);
    }

    public static ResourceNotFoundException friendRequestNotFound(Integer requestId) {
        return new ResourceNotFoundException(ErrorCode.FRIEND_REQUEST_NOT_FOUND, "FriendRequest", requestId);
    }

    public static ResourceNotFoundException friendNotFound(Long friendId) {
        return new ResourceNotFoundException(ErrorCode.FRIEND_NOT_FOUND, "Friend", friendId);
    }

    public static ResourceNotFoundException friendNotFound(Integer friendId) {
        return new ResourceNotFoundException(ErrorCode.FRIEND_NOT_FOUND, "Friend", friendId);
    }

    public static ResourceNotFoundException chatMessageNotFound(Long messageId) {
        return new ResourceNotFoundException(ErrorCode.CHAT_MESSAGE_NOT_FOUND, "ChatMessage", messageId);
    }

    public static ResourceNotFoundException chatRoomNotFound(Long roomId) {
        return new ResourceNotFoundException(ErrorCode.CHAT_ROOM_NOT_FOUND, "ChatRoom", roomId);
    }

    public static ResourceNotFoundException storyNotFound(Long storyId) {
        return new ResourceNotFoundException(ErrorCode.STORY_NOT_FOUND, "Story", storyId);
    }

    public static ResourceNotFoundException shareNotFound(String shareCode) {
        return new ResourceNotFoundException(ErrorCode.SHARE_NOT_FOUND, "Share with code: " + shareCode);
    }
}
