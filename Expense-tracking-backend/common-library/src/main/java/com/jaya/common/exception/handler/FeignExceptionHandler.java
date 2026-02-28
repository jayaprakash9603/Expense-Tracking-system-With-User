package com.jaya.common.exception.handler;

import com.jaya.common.error.ApiError;
import feign.FeignException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.nio.charset.StandardCharsets;

@RestControllerAdvice
@Slf4j
@ConditionalOnClass(FeignException.class)
public class FeignExceptionHandler {

    @Value("${spring.application.name:unknown-service}")
    private String serviceName;

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<ApiError> handleFeignException(FeignException ex, WebRequest request) {
        String path = request.getDescription(false).replace("uri=", "");
        int feignStatus = ex.status();
        HttpStatus httpStatus = HttpStatus.resolve(feignStatus);
        if (httpStatus == null) {
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        String userMessage = extractMessage(ex);

        log.warn("Downstream service error at path: {} - status={}, message={}", path, feignStatus, userMessage);

        ApiError error = ApiError.builder()
                .errorCode(httpStatus.is4xxClientError() ? "DOWNSTREAM_CLIENT_ERROR" : "DOWNSTREAM_SERVICE_ERROR")
                .message(userMessage)
                .status(httpStatus.value())
                .path(path)
                .serviceName(serviceName)
                .build();

        return new ResponseEntity<>(error, httpStatus);
    }

    private String extractMessage(FeignException ex) {
        try {
            byte[] body = ex.responseBody()
                    .map(buf -> { byte[] b = new byte[buf.remaining()]; buf.get(b); return b; })
                    .orElse(null);
            if (body != null && body.length > 0) {
                String json = new String(body, StandardCharsets.UTF_8);
                com.fasterxml.jackson.databind.JsonNode node =
                        new com.fasterxml.jackson.databind.ObjectMapper().readTree(json);
                if (node.has("message") && !node.get("message").isNull()) {
                    return node.get("message").asText();
                }
                if (node.has("error") && !node.get("error").isNull()) {
                    return node.get("error").asText();
                }
            }
        } catch (Exception ignored) {
        }
        String raw = ex.getMessage();
        if (raw != null && raw.length() > 200) {
            return raw.substring(0, 200);
        }
        return raw != null ? raw : "Downstream service error";
    }
}
