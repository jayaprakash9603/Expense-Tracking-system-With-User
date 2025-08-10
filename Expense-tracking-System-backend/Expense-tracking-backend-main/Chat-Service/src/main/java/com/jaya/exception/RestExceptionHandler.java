package com.jaya.exception;

import feign.FeignException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

/**
 * Centralized exception handler for REST APIs.
 */
@ControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(ChatServiceException.class)
    public ResponseEntity<Map<String, String>> handleChatServiceException(ChatServiceException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ServiceCommunicationException.class)
    public ResponseEntity<Map<String, Object>> handleServiceCommunicationException(ServiceCommunicationException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", "Service communication failed");
        error.put("message", ex.getMessage());
        error.put("service", ex.getServiceName());
        error.put("statusCode", ex.getStatusCode());

        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode());
        return new ResponseEntity<>(error, status);
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<Map<String, Object>> handleFeignException(FeignException ex) {
        Map<String, Object> error = new HashMap<>();

        // Extract status code from Feign exception
        HttpStatus status = HttpStatus.valueOf(ex.status());

        // Try to extract meaningful message from the response body
        String message = extractMessageFromFeignException(ex);

        error.put("error", "Service communication error");
        error.put("message", message);
        error.put("status", ex.status());
        error.put("service", extractServiceName(ex));

        return new ResponseEntity<>(error, status);
    }

    @ExceptionHandler(FeignException.InternalServerError.class)
    public ResponseEntity<Map<String, Object>> handleFeignInternalServerError(FeignException.InternalServerError ex) {
        Map<String, Object> error = new HashMap<>();

        String message = extractMessageFromFeignException(ex);

        error.put("error", "Internal service error");
        error.put("message", message);
        error.put("status", 500);
        error.put("service", extractServiceName(ex));

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(FeignException.BadRequest.class)
    public ResponseEntity<Map<String, Object>> handleFeignBadRequest(FeignException.BadRequest ex) {
        Map<String, Object> error = new HashMap<>();

        String message = extractMessageFromFeignException(ex);

        error.put("error", "Bad request to service");
        error.put("message", message);
        error.put("status", 400);
        error.put("service", extractServiceName(ex));

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(FeignException.NotFound.class)
    public ResponseEntity<Map<String, Object>> handleFeignNotFound(FeignException.NotFound ex) {
        Map<String, Object> error = new HashMap<>();

        String message = extractMessageFromFeignException(ex);

        error.put("error", "Resource not found in service");
        error.put("message", message);
        error.put("status", 404);
        error.put("service", extractServiceName(ex));

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Internal server error");
        error.put("message", ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred");
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Extract meaningful message from Feign exception response body
     */
    private String extractMessageFromFeignException(FeignException ex) {
        try {
            String responseBody = ex.contentUTF8();
            if (responseBody != null && !responseBody.isEmpty()) {
                // Try to extract message from JSON response
                if (responseBody.contains("\"message\":")) {
                    int start = responseBody.indexOf("\"message\":\"") + 11;
                    int end = responseBody.indexOf("\"", start);
                    if (start > 10 && end > start) {
                        return responseBody.substring(start, end);
                    }
                }
                // If JSON parsing fails, return the first part of response body
                return responseBody.length() > 200 ? responseBody.substring(0, 200) + "..." : responseBody;
            }
        } catch (Exception e) {
            // If extraction fails, fall back to default message
        }

        return "Service returned error: " + ex.getMessage();
    }

    /**
     * Extract service name from Feign exception
     */
    private String extractServiceName(FeignException ex) {
        try {
            String message = ex.getMessage();
            if (message != null && message.contains("to [http://")) {
                int start = message.indexOf("to [http://") + 11;
                int end = message.indexOf("/", start);
                if (start > 10 && end > start) {
                    String url = message.substring(start, end);
                    // Extract service name from URL (e.g., localhost:6009 -> FRIENDSHIP-SERVICE)
                    if (url.contains(":6009")) {
                        return "FRIENDSHIP-SERVICE";
                    } else if (url.contains(":8080")) {
                        return "USER-SERVICE";
                    }
                    return url;
                }
            }
        } catch (Exception e) {
            // If extraction fails, return unknown
        }
        return "UNKNOWN-SERVICE";
    }
}