package com.jaya.exceptions;

/**
 * Exception thrown when an invalid image is uploaded for OCR processing.
 */
public class InvalidImageException extends RuntimeException {

    public InvalidImageException(String message) {
        super(message);
    }

    public InvalidImageException(String message, Throwable cause) {
        super(message, cause);
    }
}
