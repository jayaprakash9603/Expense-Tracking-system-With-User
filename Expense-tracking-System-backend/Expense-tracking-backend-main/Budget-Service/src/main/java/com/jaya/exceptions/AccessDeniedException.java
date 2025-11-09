package com.jaya.exceptions;

/**
 * Thrown when an authenticated user lacks required authorization for an action.
 */
public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException(String message) {
        super(message);
    }
}