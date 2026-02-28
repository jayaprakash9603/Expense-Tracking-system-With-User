package com.jaya.common.exception.handler;

import com.jaya.common.error.ApiError;
import com.jaya.common.error.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;








@RestControllerAdvice
@Slf4j
@ConditionalOnClass(name = "org.springframework.security.core.AuthenticationException")
public class SecurityExceptionHandler {

    @Value("${spring.application.name:unknown-service}")
    private String serviceName;

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleSpringAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {

        String path = extractPath(request);

        log.warn("Access denied at path: {}", path);

        ApiError error = ApiError.of(ErrorCode.AUTHZ_ACCESS_DENIED, path)
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleSpringAuthenticationException(
            AuthenticationException ex, WebRequest request) {

        String path = extractPath(request);

        log.warn("Authentication failed at path: {} - {}", path, ex.getMessage());

        ApiError error = ApiError.of(ErrorCode.AUTH_CREDENTIALS_INVALID, path, ex.getMessage())
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    private String extractPath(WebRequest request) {
        String description = request.getDescription(false);
        return description.replace("uri=", "");
    }
}
