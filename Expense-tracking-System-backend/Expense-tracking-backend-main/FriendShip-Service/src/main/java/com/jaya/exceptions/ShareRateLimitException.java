package com.jaya.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when share rate limit is exceeded.
 */
@ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
public class ShareRateLimitException extends RuntimeException {

    public ShareRateLimitException(String message) {
        super(message);
    }

    public ShareRateLimitException(String message, Throwable cause) {
        super(message, cause);
    }
}
