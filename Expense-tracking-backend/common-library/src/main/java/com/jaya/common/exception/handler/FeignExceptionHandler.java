package com.jaya.common.exception.handler;

import com.jaya.common.error.ApiError;
import com.jaya.common.error.ErrorCode;
import feign.FeignException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

/**
 * Feign exception handlers - only loaded when Feign is on the classpath.
 */
@RestControllerAdvice
@Slf4j
@ConditionalOnClass(name = "feign.FeignException")
public class FeignExceptionHandler {

    @Value("${spring.application.name:unknown-service}")
    private String serviceName;

    @ExceptionHandler(FeignException.Unauthorized.class)
    public ResponseEntity<ApiError> handleFeignUnauthorizedException(
            FeignException.Unauthorized ex, WebRequest request) {
        String path = extractPath(request);

        log.warn("Feign client unauthorized at path: {} - {}", path, ex.getMessage());

        ApiError error = ApiError.of(ErrorCode.AUTH_TOKEN_EXPIRED, path,
                "Authentication failed when calling downstream service. Please re-login.")
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(FeignException.Forbidden.class)
    public ResponseEntity<ApiError> handleFeignForbiddenException(
            FeignException.Forbidden ex, WebRequest request) {
        String path = extractPath(request);

        log.warn("Feign client forbidden at path: {} - {}", path, ex.getMessage());

        ApiError error = ApiError.of(ErrorCode.AUTHZ_ACCESS_DENIED, path,
                "Access denied when calling downstream service")
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(FeignException.NotFound.class)
    public ResponseEntity<ApiError> handleFeignNotFoundException(
            FeignException.NotFound ex, WebRequest request) {
        String path = extractPath(request);

        log.warn("Feign client not found at path: {} - {}", path, ex.getMessage());

        ApiError error = ApiError.of(ErrorCode.SYSTEM_RESOURCE_NOT_FOUND, path,
                "Requested resource not found in downstream service")
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(FeignException.BadRequest.class)
    public ResponseEntity<ApiError> handleFeignBadRequestException(
            FeignException.BadRequest ex, WebRequest request) {
        String path = extractPath(request);

        log.warn("Feign client bad request at path: {} - {}", path, ex.getMessage());

        ApiError error = ApiError.of(ErrorCode.VALIDATION_FAILED, path,
                "Invalid request to downstream service")
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(FeignException.ServiceUnavailable.class)
    public ResponseEntity<ApiError> handleFeignServiceUnavailableException(
            FeignException.ServiceUnavailable ex, WebRequest request) {
        String path = extractPath(request);

        log.error("Feign client service unavailable at path: {} - {}", path, ex.getMessage());

        ApiError error = ApiError.of(ErrorCode.SYSTEM_SERVICE_UNAVAILABLE, path,
                "Downstream service is currently unavailable. Please try again later.")
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, HttpStatus.SERVICE_UNAVAILABLE);
    }

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<ApiError> handleFeignException(
            FeignException ex, WebRequest request) {
        String path = extractPath(request);
        int status = ex.status();

        log.error("Feign client error at path: {} - status: {} - {}", path, status, ex.getMessage());

        HttpStatus httpStatus = HttpStatus.resolve(status);
        if (httpStatus == null) {
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        String message = String.format("Error communicating with downstream service (status: %d)", status);

        ApiError error = ApiError.of(ErrorCode.SYSTEM_EXTERNAL_SERVICE_ERROR, path, message)
                .withServiceName(serviceName);

        return new ResponseEntity<>(error, httpStatus);
    }

    private String extractPath(WebRequest request) {
        String description = request.getDescription(false);
        return description.replace("uri=", "");
    }
}
