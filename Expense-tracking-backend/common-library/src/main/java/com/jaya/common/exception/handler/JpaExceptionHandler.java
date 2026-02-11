package com.jaya.common.exception.handler;

import com.jaya.common.error.ApiError;
import com.jaya.common.error.ErrorCode;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.OptimisticLockException;
import jakarta.persistence.PersistenceException;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.sql.SQLException;

/**
 * JPA/Database exception handlers - only loaded when JPA is on the classpath.
 */
@RestControllerAdvice
@Slf4j
@ConditionalOnClass(name = "jakarta.persistence.PersistenceException")
public class JpaExceptionHandler {

    @Value("${spring.application.name:unknown-service}")
    private String serviceName;

    @ExceptionHandler(JpaSystemException.class)
    public ResponseEntity<ApiError> handleJpaSystemException(JpaSystemException ex, WebRequest request) {
        String path = extractPath(request);
        String rootCauseMessage = extractRootCauseMessage(ex);

        log.error("JPA System error at path: {} - {}", path, rootCauseMessage, ex);

        String userMessage = "Database operation failed. ";
        if (rootCauseMessage.contains("doesn't have a default value")) {
            String fieldName = extractFieldFromDefaultValueError(rootCauseMessage);
            userMessage += "Missing required database field: " + fieldName;
        } else if (rootCauseMessage.contains("constraint")) {
            userMessage += "Data integrity constraint violated.";
        } else {
            userMessage += "Please contact support if the issue persists.";
        }

        ApiError error = ApiError.of(ErrorCode.SYSTEM_DATABASE_ERROR, path, userMessage)
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex, WebRequest request) {

        String path = extractPath(request);
        String rootCauseMessage = extractRootCauseMessage(ex);

        log.error("Data integrity violation at path: {} - {}", path, rootCauseMessage);

        String userMessage = "Data integrity error. ";
        HttpStatus status = HttpStatus.CONFLICT;

        if (rootCauseMessage.toLowerCase().contains("duplicate")) {
            userMessage += "A record with the same unique identifier already exists.";
        } else if (rootCauseMessage.toLowerCase().contains("foreign key")) {
            userMessage += "Referenced record does not exist or cannot be modified.";
            status = HttpStatus.BAD_REQUEST;
        } else if (rootCauseMessage.contains("doesn't have a default value")) {
            String fieldName = extractFieldFromDefaultValueError(rootCauseMessage);
            userMessage = "Missing required field: " + fieldName;
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        } else {
            userMessage += "The operation violates data constraints.";
        }

        ApiError error = ApiError.of(ErrorCode.SYSTEM_DATABASE_ERROR, path, userMessage)
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, status);
    }

    @ExceptionHandler({OptimisticLockingFailureException.class, OptimisticLockException.class})
    public ResponseEntity<ApiError> handleOptimisticLockingFailure(Exception ex, WebRequest request) {
        String path = extractPath(request);

        log.warn("Optimistic locking failure at path: {} - {}", path, ex.getMessage());

        ApiError error = ApiError.of(ErrorCode.SYSTEM_DATABASE_ERROR, path,
                "The record was modified by another user. Please refresh and try again.")
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> handleEntityNotFoundException(EntityNotFoundException ex, WebRequest request) {
        String path = extractPath(request);

        log.warn("Entity not found at path: {} - {}", path, ex.getMessage());

        ApiError error = ApiError.of(ErrorCode.SYSTEM_RESOURCE_NOT_FOUND, path, ex.getMessage())
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(EmptyResultDataAccessException.class)
    public ResponseEntity<ApiError> handleEmptyResultDataAccessException(
            EmptyResultDataAccessException ex, WebRequest request) {

        String path = extractPath(request);

        log.warn("Empty result at path: {} - {}", path, ex.getMessage());

        ApiError error = ApiError.of(ErrorCode.SYSTEM_RESOURCE_NOT_FOUND, path,
                "The requested resource was not found.")
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TransactionSystemException.class)
    public ResponseEntity<ApiError> handleTransactionSystemException(
            TransactionSystemException ex, WebRequest request) {

        String path = extractPath(request);
        Throwable rootCause = ex.getRootCause();
        String rootCauseMessage = rootCause != null ? rootCause.getMessage() : ex.getMessage();

        log.error("Transaction error at path: {} - {}", path, rootCauseMessage, ex);

        if (rootCause instanceof ConstraintViolationException) {
            // Delegate to GlobalExceptionHandler's constraint violation handler
            log.warn("Transaction failed due to constraint violation at path: {}", path);
        }

        ApiError error = ApiError.of(ErrorCode.SYSTEM_DATABASE_ERROR, path,
                "Transaction failed. Please try again.")
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(PersistenceException.class)
    public ResponseEntity<ApiError> handlePersistenceException(PersistenceException ex, WebRequest request) {
        String path = extractPath(request);
        String rootCauseMessage = extractRootCauseMessage(ex);

        log.error("Persistence error at path: {} - {}", path, rootCauseMessage, ex);

        String userMessage = "Database operation failed. ";
        if (rootCauseMessage.contains("doesn't have a default value")) {
            String fieldName = extractFieldFromDefaultValueError(rootCauseMessage);
            userMessage = "Missing required database field: " + fieldName;
        } else {
            userMessage += "Please try again or contact support.";
        }

        ApiError error = ApiError.of(ErrorCode.SYSTEM_DATABASE_ERROR, path, userMessage)
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(SQLException.class)
    public ResponseEntity<ApiError> handleSQLException(SQLException ex, WebRequest request) {
        String path = extractPath(request);

        log.error("SQL error at path: {} - SQLState: {}, ErrorCode: {}, Message: {}",
                path, ex.getSQLState(), ex.getErrorCode(), ex.getMessage(), ex);

        String userMessage = "Database error occurred. ";
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        String sqlState = ex.getSQLState();
        if (sqlState != null) {
            if (sqlState.startsWith("23")) {
                userMessage = "Data integrity constraint violated.";
                status = HttpStatus.CONFLICT;
            } else if (sqlState.startsWith("22")) {
                userMessage = "Invalid data format provided.";
                status = HttpStatus.BAD_REQUEST;
            } else if (sqlState.startsWith("08")) {
                userMessage = "Database connection error. Please try again.";
                status = HttpStatus.SERVICE_UNAVAILABLE;
            }
        }

        ApiError error = ApiError.of(ErrorCode.SYSTEM_DATABASE_ERROR, path, userMessage)
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, status);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiError> handleDataAccessException(DataAccessException ex, WebRequest request) {
        String path = extractPath(request);
        String rootCauseMessage = extractRootCauseMessage(ex);

        log.error("Data access error at path: {} - {}", path, rootCauseMessage, ex);

        ApiError error = ApiError.of(ErrorCode.SYSTEM_DATABASE_ERROR, path,
                "Database operation failed. Please try again.")
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private String extractPath(WebRequest request) {
        String description = request.getDescription(false);
        return description.replace("uri=", "");
    }

    private String extractRootCauseMessage(Throwable ex) {
        Throwable rootCause = ex;
        while (rootCause.getCause() != null && rootCause.getCause() != rootCause) {
            rootCause = rootCause.getCause();
        }
        return rootCause.getMessage() != null ? rootCause.getMessage() : ex.getMessage();
    }

    private String extractFieldFromDefaultValueError(String message) {
        if (message == null) {
            return "unknown";
        }
        int startIdx = message.indexOf("'");
        if (startIdx != -1) {
            int endIdx = message.indexOf("'", startIdx + 1);
            if (endIdx != -1) {
                return message.substring(startIdx + 1, endIdx);
            }
        }
        return "unknown";
    }
}
