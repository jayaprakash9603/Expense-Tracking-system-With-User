package com.jaya.common.exception;

import com.jaya.common.error.ErrorCode;





public class ValidationException extends BaseException {

    private static final long serialVersionUID = 1L;

    public ValidationException(String message) {
        super(ErrorCode.VALIDATION_FAILED, message);
    }

    public ValidationException(ErrorCode errorCode) {
        super(errorCode);
    }

    public ValidationException(ErrorCode errorCode, String details) {
        super(errorCode, details);
    }

    public ValidationException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    
    public static ValidationException fieldRequired(String fieldName) {
        return new ValidationException(ErrorCode.VALIDATION_FIELD_REQUIRED,
                "Field '" + fieldName + "' is required");
    }

    public static ValidationException fieldInvalid(String fieldName, String reason) {
        return new ValidationException(ErrorCode.VALIDATION_FIELD_INVALID,
                "Field '" + fieldName + "' is invalid: " + reason);
    }

    public static ValidationException invalidAmount() {
        return new ValidationException(ErrorCode.EXPENSE_INVALID_AMOUNT,
                "Amount must be a positive number");
    }

    public static ValidationException invalidDateRange() {
        return new ValidationException(ErrorCode.BUDGET_INVALID_DATE_RANGE);
    }

    public static ValidationException requestBodyMissing() {
        return new ValidationException(ErrorCode.VALIDATION_REQUEST_BODY_MISSING);
    }

    public static ValidationException headerMissing(String headerName) {
        return new ValidationException(ErrorCode.VALIDATION_HEADER_MISSING,
                "Required header '" + headerName + "' is missing");
    }
}
