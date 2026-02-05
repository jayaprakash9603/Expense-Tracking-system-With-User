package com.jaya.common.exception;

import com.jaya.common.error.ErrorCode;





public class AccessDeniedException extends BaseException {

    private static final long serialVersionUID = 1L;

    public AccessDeniedException() {
        super(ErrorCode.AUTHZ_ACCESS_DENIED);
    }

    public AccessDeniedException(String details) {
        super(ErrorCode.AUTHZ_ACCESS_DENIED, details);
    }

    public AccessDeniedException(ErrorCode errorCode) {
        super(errorCode);
    }

    public AccessDeniedException(ErrorCode errorCode, String details) {
        super(errorCode, details);
    }

    
    public static AccessDeniedException forExpense(Long expenseId) {
        return new AccessDeniedException(ErrorCode.EXPENSE_ACCESS_DENIED,
                "Access denied to expense with ID: " + expenseId);
    }

    public static AccessDeniedException forBudget(Long budgetId) {
        return new AccessDeniedException(ErrorCode.BUDGET_ACCESS_DENIED,
                "Access denied to budget with ID: " + budgetId);
    }

    public static AccessDeniedException forCategory(Long categoryId) {
        return new AccessDeniedException(ErrorCode.CATEGORY_ACCESS_DENIED,
                "Access denied to category with ID: " + categoryId);
    }

    public static AccessDeniedException forBill(Long billId) {
        return new AccessDeniedException(ErrorCode.BILL_ACCESS_DENIED,
                "Access denied to bill with ID: " + billId);
    }

    public static AccessDeniedException forPaymentMethod(Long paymentMethodId) {
        return new AccessDeniedException(ErrorCode.PAYMENT_METHOD_ACCESS_DENIED,
                "Access denied to payment method with ID: " + paymentMethodId);
    }
}
