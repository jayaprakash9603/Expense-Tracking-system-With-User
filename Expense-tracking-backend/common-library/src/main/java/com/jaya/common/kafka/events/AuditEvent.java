package com.jaya.common.kafka.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;





@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    


    @Builder.Default
    private String eventId = UUID.randomUUID().toString();

    


    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    
    private Integer userId;
    private String username;
    private String userEmail;
    private String userRole;

    
    private String action;
    private String entityType;
    private Long entityId;
    private String entityName;

    
    private String sourceService;
    private String serviceVersion;
    private String environment;

    
    private String ipAddress;
    private String userAgent;
    private String sessionId;
    private String correlationId;
    private String requestId;
    private String httpMethod;
    private String endpoint;
    private Long executionTimeMs;

    
    private Map<String, Object> oldValues;
    private Map<String, Object> newValues;
    private String requestBody;
    private String responseBody;

    
    @Builder.Default
    private String status = Status.SUCCESS;
    private String errorMessage;
    private Integer responseCode;

    
    @Builder.Default
    private String severity = Severity.INFO;

    
    public static class Status {
        public static final String SUCCESS = "SUCCESS";
        public static final String FAILURE = "FAILURE";

        private Status() {
        }
    }

    public static class Severity {
        public static final String DEBUG = "DEBUG";
        public static final String INFO = "INFO";
        public static final String WARN = "WARN";
        public static final String ERROR = "ERROR";
        public static final String CRITICAL = "CRITICAL";

        private Severity() {
        }
    }

    public static class Action {
        public static final String CREATE = "CREATE";
        public static final String READ = "READ";
        public static final String UPDATE = "UPDATE";
        public static final String DELETE = "DELETE";
        public static final String LOGIN = "LOGIN";
        public static final String LOGOUT = "LOGOUT";
        public static final String EXPORT = "EXPORT";
        public static final String IMPORT = "IMPORT";

        private Action() {
        }
    }
}
