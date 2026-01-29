package com.jaya.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a user attempts to access a share they don't own.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class ShareAccessDeniedException extends RuntimeException {
    
    public ShareAccessDeniedException(String message) {
        super(message);
    }
    
    public ShareAccessDeniedException(String message, Throwable cause) {
        super(message, cause);
    }
}
