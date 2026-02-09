package com.jaya.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
public class ShareRateLimitException extends RuntimeException {

    public ShareRateLimitException(String message) {
        super(message);
    }

    public ShareRateLimitException(String message, Throwable cause) {
        super(message, cause);
    }
}
