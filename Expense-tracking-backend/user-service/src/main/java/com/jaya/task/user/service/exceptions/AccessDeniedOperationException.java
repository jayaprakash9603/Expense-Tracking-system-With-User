package com.jaya.task.user.service.exceptions;

public class AccessDeniedOperationException extends RuntimeException {

    public AccessDeniedOperationException(String message) {
        super(message);
    }
}
