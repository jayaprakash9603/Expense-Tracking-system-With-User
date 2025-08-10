package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class ValidationErrorResponse extends ErrorResponse {
    private List<FieldError> fieldErrors;

    public ValidationErrorResponse(String error, String message, int status, String path,
                                   LocalDateTime timestamp, List<FieldError> fieldErrors) {
        super(error, message, status, path, timestamp, null);
        this.fieldErrors = fieldErrors;
    }

    @Data
    @AllArgsConstructor
    public static class FieldError {
        private String field;
        private String message;
        private Object rejectedValue;
    }
}