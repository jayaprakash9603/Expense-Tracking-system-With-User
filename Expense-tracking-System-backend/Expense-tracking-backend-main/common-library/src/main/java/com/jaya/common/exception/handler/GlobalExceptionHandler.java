package com.jaya.common.exception.handler;

import com.jaya.common.error.ApiError;
import com.jaya.common.error.ErrorCode;
import com.jaya.common.exception.*;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Global Exception Handler for all microservices.
 * Provides consistent error responses across the entire application.
 * 
 * Features:
 * - Handles all custom BaseException subclasses
 * - Handles validation errors with field-level details
 * - Handles JWT authentication errors
 * - Handles Spring framework exceptions
 * - Includes service name and trace ID in responses
 * - Comprehensive logging with context
 * 
 * Usage:
 * Import this class or let Spring auto-scan find it.
 * Can be extended by individual services for service-specific exception
 * handling.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

        @Value("${spring.application.name:unknown-service}")
        private String serviceName;

        // ========================================
        // CUSTOM EXCEPTION HANDLERS
        // ========================================

        /**
         * Handle all BaseException and its subclasses
         */
        @ExceptionHandler(BaseException.class)
        public ResponseEntity<ApiError> handleBaseException(BaseException ex, WebRequest request) {
                String path = extractPath(request);

                logException(ex, path);

                ApiError error = ApiError.builder()
                                .errorCode(ex.getErrorCodeString())
                                .message(ex.getMessage())
                                .status(ex.getStatusCode())
                                .path(path)
                                .details(ex.getDetails())
                                .serviceName(serviceName)
                                .build();

                return new ResponseEntity<>(error, ex.getHttpStatus());
        }

        /**
         * Handle ResourceNotFoundException specifically (for detailed logging)
         */
        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiError> handleResourceNotFoundException(ResourceNotFoundException ex,
                        WebRequest request) {
                String path = extractPath(request);

                log.warn("Resource not found: {} - {} at path: {}",
                                ex.getResourceType(), ex.getResourceId(), path);

                ApiError error = ApiError.builder()
                                .errorCode(ex.getErrorCodeString())
                                .message(ex.getMessage())
                                .status(ex.getStatusCode())
                                .path(path)
                                .details(ex.getDetails())
                                .serviceName(serviceName)
                                .build();

                return new ResponseEntity<>(error, ex.getHttpStatus());
        }

        // ========================================
        // JWT EXCEPTION HANDLERS
        // ========================================

        @ExceptionHandler(ExpiredJwtException.class)
        public ResponseEntity<ApiError> handleExpiredJwtException(ExpiredJwtException ex, WebRequest request) {
                String path = extractPath(request);

                log.warn("JWT token expired at path: {}", path);

                ApiError error = ApiError.of(ErrorCode.AUTH_TOKEN_EXPIRED, path)
                                .withServiceName(serviceName);

                return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(MalformedJwtException.class)
        public ResponseEntity<ApiError> handleMalformedJwtException(MalformedJwtException ex, WebRequest request) {
                String path = extractPath(request);

                log.warn("Malformed JWT token at path: {}", path);

                ApiError error = ApiError.of(ErrorCode.AUTH_TOKEN_INVALID, path)
                                .withServiceName(serviceName);

                return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(SignatureException.class)
        public ResponseEntity<ApiError> handleSignatureException(SignatureException ex, WebRequest request) {
                String path = extractPath(request);

                log.warn("Invalid JWT signature at path: {}", path);

                ApiError error = ApiError.of(ErrorCode.AUTH_TOKEN_SIGNATURE_INVALID, path)
                                .withServiceName(serviceName);

                return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(UnsupportedJwtException.class)
        public ResponseEntity<ApiError> handleUnsupportedJwtException(UnsupportedJwtException ex, WebRequest request) {
                String path = extractPath(request);

                log.warn("Unsupported JWT token at path: {}", path);

                ApiError error = ApiError.of(ErrorCode.AUTH_TOKEN_UNSUPPORTED, path)
                                .withServiceName(serviceName);

                return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }

        // ========================================
        // VALIDATION EXCEPTION HANDLERS
        // ========================================

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiError> handleMethodArgumentNotValidException(
                        MethodArgumentNotValidException ex, WebRequest request) {

                String path = extractPath(request);

                List<ApiError.FieldError> fieldErrors = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .map(this::mapFieldError)
                                .collect(Collectors.toList());

                log.warn("Validation failed at path: {} - {} field errors", path, fieldErrors.size());

                ApiError error = ApiError.validationError(path, fieldErrors)
                                .withServiceName(serviceName);

                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(BindException.class)
        public ResponseEntity<ApiError> handleBindException(
                        BindException ex, WebRequest request) {

                String path = extractPath(request);

                List<ApiError.FieldError> fieldErrors = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .map(this::mapFieldError)
                                .collect(Collectors.toList());

                log.warn("Binding failed at path: {} - {} field errors", path, fieldErrors.size());

                ApiError error = ApiError.validationError(path, fieldErrors)
                                .withServiceName(serviceName);

                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(ConstraintViolationException.class)
        public ResponseEntity<ApiError> handleConstraintViolationException(
                        ConstraintViolationException ex, WebRequest request) {

                String path = extractPath(request);

                List<ApiError.FieldError> fieldErrors = ex.getConstraintViolations()
                                .stream()
                                .map(this::mapConstraintViolation)
                                .collect(Collectors.toList());

                log.warn("Constraint violation at path: {} - {} violations", path, fieldErrors.size());

                ApiError error = ApiError.validationError(path, fieldErrors)
                                .withServiceName(serviceName);

                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ApiError> handleMethodArgumentTypeMismatchException(
                        MethodArgumentTypeMismatchException ex, WebRequest request) {

                String path = extractPath(request);
                String details = String.format("Parameter '%s' should be of type '%s'",
                                ex.getName(),
                                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");

                log.warn("Type mismatch at path: {} - {}", path, details);

                ApiError error = ApiError.of(ErrorCode.VALIDATION_TYPE_MISMATCH, path, details)
                                .withServiceName(serviceName);

                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        // ========================================
        // REQUEST EXCEPTION HANDLERS
        // ========================================

        @ExceptionHandler(MissingRequestHeaderException.class)
        public ResponseEntity<ApiError> handleMissingRequestHeaderException(
                        MissingRequestHeaderException ex, WebRequest request) {

                String path = extractPath(request);
                String details = "Required header '" + ex.getHeaderName() + "' is missing";

                log.warn("Missing header at path: {} - {}", path, ex.getHeaderName());

                ApiError error = ApiError.of(ErrorCode.VALIDATION_HEADER_MISSING, path, details)
                                .withServiceName(serviceName);

                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(MissingServletRequestParameterException.class)
        public ResponseEntity<ApiError> handleMissingServletRequestParameterException(
                        MissingServletRequestParameterException ex, WebRequest request) {

                String path = extractPath(request);
                String details = "Required parameter '" + ex.getParameterName() + "' is missing";

                log.warn("Missing parameter at path: {} - {}", path, ex.getParameterName());

                ApiError error = ApiError.of(ErrorCode.VALIDATION_FIELD_REQUIRED, path, details)
                                .withServiceName(serviceName);

                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ApiError> handleHttpMessageNotReadableException(
                        HttpMessageNotReadableException ex, WebRequest request) {

                String path = extractPath(request);

                log.warn("Message not readable at path: {} - {}", path, ex.getMessage());

                ApiError error = ApiError.of(ErrorCode.VALIDATION_REQUEST_BODY_MISSING, path,
                                "Request body is missing or malformed")
                                .withServiceName(serviceName);

                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
        public ResponseEntity<ApiError> handleHttpRequestMethodNotSupportedException(
                        HttpRequestMethodNotSupportedException ex, WebRequest request) {

                String path = extractPath(request);
                String details = String.format("Method '%s' is not supported. Supported methods: %s",
                                ex.getMethod(),
                                ex.getSupportedHttpMethods());

                log.warn("Method not allowed at path: {} - {}", path, ex.getMethod());

                ApiError error = ApiError.of(ErrorCode.SYSTEM_METHOD_NOT_ALLOWED, path, details)
                                .withServiceName(serviceName);

                return new ResponseEntity<>(error, HttpStatus.METHOD_NOT_ALLOWED);
        }

        @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
        public ResponseEntity<ApiError> handleHttpMediaTypeNotSupportedException(
                        HttpMediaTypeNotSupportedException ex, WebRequest request) {

                String path = extractPath(request);
                String details = String.format("Media type '%s' is not supported. Supported types: %s",
                                ex.getContentType(),
                                ex.getSupportedMediaTypes());

                log.warn("Media type not supported at path: {} - {}", path, ex.getContentType());

                ApiError error = ApiError.of(ErrorCode.SYSTEM_MEDIA_TYPE_NOT_SUPPORTED, path, details)
                                .withServiceName(serviceName);

                return new ResponseEntity<>(error, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        }

        @ExceptionHandler(NoHandlerFoundException.class)
        public ResponseEntity<ApiError> handleNoHandlerFoundException(
                        NoHandlerFoundException ex, WebRequest request) {

                String path = extractPath(request);
                String details = String.format("No handler found for %s %s", ex.getHttpMethod(), ex.getRequestURL());

                log.warn("No handler found: {} {}", ex.getHttpMethod(), ex.getRequestURL());

                ApiError error = ApiError.of(ErrorCode.SYSTEM_RESOURCE_NOT_FOUND, path, details)
                                .withServiceName(serviceName);

                return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }

        // ========================================
        // ILLEGAL ARGUMENT HANDLER
        // ========================================

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiError> handleIllegalArgumentException(
                        IllegalArgumentException ex, WebRequest request) {

                String path = extractPath(request);

                log.warn("Illegal argument at path: {} - {}", path, ex.getMessage());

                ApiError error = ApiError.of(ErrorCode.VALIDATION_FIELD_INVALID, path, ex.getMessage())
                                .withServiceName(serviceName);

                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        // ========================================
        // FALLBACK EXCEPTION HANDLER
        // ========================================

        /**
         * Catch-all exception handler for any unhandled exceptions
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiError> handleGenericException(Exception ex, WebRequest request) {
                String path = extractPath(request);

                // Log the full stack trace for unexpected errors
                log.error("Unexpected error at path: {} - {}", path, ex.getMessage(), ex);

                ApiError error = ApiError.internalError(path,
                                "An unexpected error occurred. Please try again later.")
                                .withServiceName(serviceName);

                return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // ========================================
        // HELPER METHODS
        // ========================================

        /**
         * Extract path from WebRequest
         */
        private String extractPath(WebRequest request) {
                String description = request.getDescription(false);
                return description.replace("uri=", "");
        }

        /**
         * Map Spring FieldError to ApiError.FieldError
         */
        private ApiError.FieldError mapFieldError(FieldError error) {
                return ApiError.FieldError.builder()
                                .field(error.getField())
                                .message(error.getDefaultMessage())
                                .rejectedValue(error.getRejectedValue())
                                .build();
        }

        /**
         * Map ConstraintViolation to ApiError.FieldError
         */
        private ApiError.FieldError mapConstraintViolation(ConstraintViolation<?> violation) {
                String field = violation.getPropertyPath().toString();
                // Extract just the field name if it contains dots
                if (field.contains(".")) {
                        field = field.substring(field.lastIndexOf('.') + 1);
                }

                return ApiError.FieldError.builder()
                                .field(field)
                                .message(violation.getMessage())
                                .rejectedValue(violation.getInvalidValue())
                                .constraint(violation.getConstraintDescriptor().getAnnotation().annotationType()
                                                .getSimpleName())
                                .build();
        }

        /**
         * Log exception with appropriate level
         */
        private void logException(BaseException ex, String path) {
                if (ex.isServerError()) {
                        log.error("[{}] {} at path: {} - {}",
                                        ex.getErrorCodeString(), ex.getClass().getSimpleName(), path, ex.getMessage(),
                                        ex);
                } else {
                        log.warn("[{}] {} at path: {} - {}",
                                        ex.getErrorCodeString(), ex.getClass().getSimpleName(), path, ex.getMessage());
                }
        }
}
