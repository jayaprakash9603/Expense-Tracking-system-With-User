package com.jaya.common.exception;

import com.jaya.common.error.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;


















@Getter
public class BaseException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    


    private final ErrorCode errorCode;

    


    private final String details;

    


    private final HttpStatus httpStatus;

    


    public BaseException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
        this.details = null;
    }

    


    public BaseException(ErrorCode errorCode, String details) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
        this.details = details;
    }

    


    public BaseException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
        this.details = cause.getMessage();
    }

    


    public BaseException(ErrorCode errorCode, String details, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
        this.details = details;
    }

    


    public BaseException(ErrorCode errorCode, String customMessage, String details) {
        super(customMessage);
        this.errorCode = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
        this.details = details;
    }

    


    public boolean isClientError() {
        return httpStatus.is4xxClientError();
    }

    


    public boolean isServerError() {
        return httpStatus.is5xxServerError();
    }

    


    public String getErrorCodeString() {
        return errorCode.getCode();
    }

    


    public int getStatusCode() {
        return httpStatus.value();
    }
}
