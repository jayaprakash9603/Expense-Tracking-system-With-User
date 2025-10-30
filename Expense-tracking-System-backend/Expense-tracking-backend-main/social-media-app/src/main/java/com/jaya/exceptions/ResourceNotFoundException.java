package com.jaya.exceptions;

/**
 * ResourceNotFoundException
 * Thrown when a requested resource is not found in the database
 * 
 * Design Pattern: Custom Exception Pattern
 * Purpose: Provides specific exception for resource not found scenarios
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resource, String field, Object value) {
        super(String.format("%s not found with %s: '%s'", resource, field, value));
    }
}
