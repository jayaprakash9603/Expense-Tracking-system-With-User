package com.jaya.error.exceptions;

/**
 * Thrown when a user exceeds the configured request rate limits.
 */
public class RateLimitExceededException extends RuntimeException {

    public RateLimitExceededException(String message) {
        super(message);
    }
}
