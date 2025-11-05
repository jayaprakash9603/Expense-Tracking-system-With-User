package com.jaya.exceptions;

import com.jaya.dto.ErrorResponse;
import com.jaya.dto.ValidationErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

        private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

        /*
         * ---------------------------------- Helper Methods
         * ----------------------------------
         */

        private String extractPath(WebRequest request) {
                if (request == null)
                        return "";
                String desc = request.getDescription(false);
                return desc == null ? "" : desc.replace("uri=", "");
        }

        /**
         * Build an ErrorResponse using metadata defaults.
         * messageOverride: if provided replaces the default message (code used when
         * blank).
         * detailsOverride: if provided replaces metadata default details description.
         */
        private ResponseEntity<ErrorResponse> buildErrorResponse(ErrorMetadata metadata,
                        String messageOverride,
                        WebRequest request,
                        String detailsOverride) {
                String path = extractPath(request);
                String message = (messageOverride == null || messageOverride.isBlank()) ? metadata.getCode()
                                : messageOverride;
                String details = (detailsOverride == null || detailsOverride.isBlank()) ? metadata.getDefaultDetails()
                                : detailsOverride;

                ErrorResponse errorResponse = new ErrorResponse(
                                metadata.getCode(),
                                message,
                                metadata.getStatus().value(),
                                path,
                                LocalDateTime.now(),
                                details);
                // Logging differentiation: 5xx as error, 4xx as warn
                if (metadata.getStatus().is5xxServerError()) {
                        logger.error("{}: {} path={} details={}", metadata.getCode(), message, path, details);
                } else {
                        logger.warn("{}: {} path={} details={}", metadata.getCode(), message, path, details);
                }
                return new ResponseEntity<>(errorResponse, metadata.getStatus());
        }

        private List<ValidationErrorResponse.FieldError> mapFieldErrors(BindingResult bindingResult) {
                if (bindingResult == null)
                        return List.of();
                return bindingResult.getFieldErrors().stream()
                                .map(error -> new ValidationErrorResponse.FieldError(
                                                error.getField(),
                                                error.getDefaultMessage(),
                                                error.getRejectedValue()))
                                .collect(Collectors.toList());
        }

        /**
         * Build a ValidationErrorResponse using provided field errors. Uses metadata to
         * derive error code/status and defaults for message when override is blank.
         */
        private ResponseEntity<ValidationErrorResponse> buildValidationErrorResponse(ErrorMetadata metadata,
                        String messageOverride,
                        WebRequest request,
                        List<ValidationErrorResponse.FieldError> fieldErrors) {
                String path = extractPath(request);
                String message = (messageOverride == null || messageOverride.isBlank()) ? metadata.getDefaultDetails()
                                : messageOverride;
                ValidationErrorResponse errorResponse = new ValidationErrorResponse(
                                metadata.getCode(),
                                message,
                                metadata.getStatus().value(),
                                path,
                                LocalDateTime.now(),
                                fieldErrors);
                logger.warn("{}: {} path={} fieldErrors={} count={}", metadata.getCode(), message, path,
                                fieldErrors.stream().map(ValidationErrorResponse.FieldError::getField)
                                                .collect(Collectors.toList()),
                                fieldErrors.size());
                return new ResponseEntity<>(errorResponse, metadata.getStatus());
        }

        @ExceptionHandler(NotificationNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleNotificationNotFoundException(NotificationNotFoundException ex,
                        WebRequest request) {
                return buildErrorResponse(ErrorMetadata.NOTIFICATION_NOT_FOUND, ex.getMessage(), request, null);
        }

        @ExceptionHandler(UnauthorizedException.class)
        public ResponseEntity<ErrorResponse> handleUnauthorizedException(UnauthorizedException ex, WebRequest request) {
                return buildErrorResponse(ErrorMetadata.UNAUTHORIZED, ex.getMessage(), request, null);
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
                return buildErrorResponse(ErrorMetadata.ACCESS_DENIED, ex.getMessage(), request, null);
        }

        @ExceptionHandler(BudgetNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleBudgetNotFoundException(BudgetNotFoundException ex,
                        WebRequest request) {
                return buildErrorResponse(ErrorMetadata.BUDGET_NOT_FOUND, ex.getMessage(), request, null);
        }

        @ExceptionHandler(UserNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleUserNotFoundException(UserNotFoundException ex,
                        WebRequest request) {
                return buildErrorResponse(ErrorMetadata.USER_NOT_FOUND, ex.getMessage(), request, null);
        }

        @ExceptionHandler(NotificationException.class)
        public ResponseEntity<ErrorResponse> handleNotificationException(NotificationException ex,
                        WebRequest request) {
                return buildErrorResponse(ErrorMetadata.NOTIFICATION_ERROR, ex.getMessage(), request, null);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ValidationErrorResponse> handleValidationException(MethodArgumentNotValidException ex,
                        WebRequest request) {
                return buildValidationErrorResponse(ErrorMetadata.VALIDATION_ERROR, null, request,
                                mapFieldErrors(ex.getBindingResult()));
        }

        @ExceptionHandler(BindException.class)
        public ResponseEntity<ValidationErrorResponse> handleBindException(BindException ex, WebRequest request) {
                return buildValidationErrorResponse(ErrorMetadata.BINDING_ERROR, null, request,
                                mapFieldErrors(ex.getBindingResult()));
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ErrorResponse> handleTypeMismatchException(MethodArgumentTypeMismatchException ex,
                        WebRequest request) {
                String expectedType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
                String message = String.format("Invalid value '%s' for parameter '%s'. Expected type: %s",
                                ex.getValue(), ex.getName(), expectedType);
                return buildErrorResponse(ErrorMetadata.TYPE_MISMATCH, message, request, null);
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex,
                        WebRequest request) {
                return buildErrorResponse(ErrorMetadata.ILLEGAL_ARGUMENT, ex.getMessage(), request, null);
        }

        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex, WebRequest request) {
                return buildErrorResponse(ErrorMetadata.RUNTIME_ERROR, ex.getMessage(), request, null);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, WebRequest request) {
                return buildErrorResponse(ErrorMetadata.INTERNAL_SERVER_ERROR, "An unexpected error occurred", request,
                                ex.getMessage());
        }
}