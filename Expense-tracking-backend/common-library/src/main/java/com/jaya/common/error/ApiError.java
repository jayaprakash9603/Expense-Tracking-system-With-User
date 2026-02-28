package com.jaya.common.error;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;


















@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError implements Serializable {

    private static final long serialVersionUID = 1L;

    


    private String errorCode;

    


    private String message;

    


    private int status;

    


    private String path;

    


    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    


    private String details;

    


    private String traceId;

    


    private String serviceName;

    


    private List<FieldError> fieldErrors;

    


    private Map<String, Object> metadata;

    
    
    

    


    public static ApiError of(ErrorCode errorCode, String path) {
        return ApiError.builder()
                .errorCode(errorCode.getCode())
                .message(errorCode.getMessage())
                .status(errorCode.getHttpStatus().value())
                .path(path)
                .timestamp(LocalDateTime.now())
                .build();
    }

    


    public static ApiError of(ErrorCode errorCode, String path, String details) {
        return ApiError.builder()
                .errorCode(errorCode.getCode())
                .message(errorCode.getMessage())
                .status(errorCode.getHttpStatus().value())
                .path(path)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
    }

    


    public static ApiError withMessage(ErrorCode errorCode, String path, String customMessage) {
        return ApiError.builder()
                .errorCode(errorCode.getCode())
                .message(customMessage)
                .status(errorCode.getHttpStatus().value())
                .path(path)
                .timestamp(LocalDateTime.now())
                .build();
    }

    


    public static ApiError validationError(String path, List<FieldError> fieldErrors) {
        return ApiError.builder()
                .errorCode(ErrorCode.VALIDATION_FAILED.getCode())
                .message("Validation failed for one or more fields")
                .status(ErrorCode.VALIDATION_FAILED.getHttpStatus().value())
                .path(path)
                .fieldErrors(fieldErrors)
                .timestamp(LocalDateTime.now())
                .build();
    }

    


    public static ApiError internalError(String path, String details) {
        return ApiError.builder()
                .errorCode(ErrorCode.SYSTEM_INTERNAL_ERROR.getCode())
                .message(ErrorCode.SYSTEM_INTERNAL_ERROR.getMessage())
                .status(ErrorCode.SYSTEM_INTERNAL_ERROR.getHttpStatus().value())
                .path(path)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
    }

    
    
    

    


    public ApiError withTraceId(String traceId) {
        this.traceId = traceId;
        return this;
    }

    


    public ApiError withServiceName(String serviceName) {
        this.serviceName = serviceName;
        return this;
    }

    


    public ApiError withMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
        return this;
    }

    
    
    

    


    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FieldError implements Serializable {
        private static final long serialVersionUID = 1L;

        


        private String field;

        


        private String message;

        


        private Object rejectedValue;

        


        private String constraint;

        


        public static FieldError of(String field, String message) {
            return FieldError.builder()
                    .field(field)
                    .message(message)
                    .build();
        }

        


        public static FieldError of(String field, String message, Object rejectedValue) {
            return FieldError.builder()
                    .field(field)
                    .message(message)
                    .rejectedValue(rejectedValue)
                    .build();
        }
    }
}
