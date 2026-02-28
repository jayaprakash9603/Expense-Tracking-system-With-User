package com.jaya.common.exception;

import com.jaya.common.error.ErrorCode;





public class ConflictException extends BaseException {

    private static final long serialVersionUID = 1L;

    public ConflictException(ErrorCode errorCode) {
        super(errorCode);
    }

    public ConflictException(ErrorCode errorCode, String details) {
        super(errorCode, details);
    }

    
    public static ConflictException userAlreadyExists(String email) {
        return new ConflictException(ErrorCode.USER_ALREADY_EXISTS,
                "User already exists with email: " + email);
    }

    public static ConflictException emailTaken(String email) {
        return new ConflictException(ErrorCode.USER_EMAIL_TAKEN,
                "Email is already registered: " + email);
    }

    public static ConflictException usernameTaken(String username) {
        return new ConflictException(ErrorCode.USER_USERNAME_TAKEN,
                "Username is already taken: " + username);
    }

    public static ConflictException categoryAlreadyExists(String categoryName) {
        return new ConflictException(ErrorCode.CATEGORY_ALREADY_EXISTS,
                "Category already exists with name: " + categoryName);
    }

    public static ConflictException categoryInUse(Long categoryId) {
        return new ConflictException(ErrorCode.CATEGORY_IN_USE,
                "Category with ID " + categoryId + " is in use and cannot be deleted");
    }

    public static ConflictException budgetAlreadyExists(String period) {
        return new ConflictException(ErrorCode.BUDGET_ALREADY_EXISTS,
                "Budget already exists for period: " + period);
    }

    public static ConflictException billAlreadyPaid(Long billId) {
        return new ConflictException(ErrorCode.BILL_ALREADY_PAID,
                "Bill with ID " + billId + " is already paid");
    }

    public static ConflictException friendRequestAlreadySent() {
        return new ConflictException(ErrorCode.FRIEND_REQUEST_ALREADY_SENT);
    }

    public static ConflictException alreadyFriends() {
        return new ConflictException(ErrorCode.FRIEND_ALREADY_ADDED);
    }

    public static ConflictException paymentMethodInUse(Long paymentMethodId) {
        return new ConflictException(ErrorCode.PAYMENT_METHOD_IN_USE,
                "Payment method with ID " + paymentMethodId + " is in use and cannot be deleted");
    }
}
