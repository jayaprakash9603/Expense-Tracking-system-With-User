package com.jaya.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when attempting to access an expired share.
 */
@ResponseStatus(HttpStatus.GONE)
public class ShareExpiredException extends RuntimeException {
    
    public ShareExpiredException(String message) {
        super(message);
    }
    
    public ShareExpiredException(String message, Throwable cause) {
        super(message, cause);
    }
}
