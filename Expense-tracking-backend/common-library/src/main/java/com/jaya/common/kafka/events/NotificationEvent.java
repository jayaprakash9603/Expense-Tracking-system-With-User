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
public class NotificationEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    


    @Builder.Default
    private String eventId = UUID.randomUUID().toString();

    


    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    


    private String notificationType;

    


    private Integer targetUserId;

    


    private Integer sourceUserId;

    


    private String title;

    


    private String message;

    


    private String entityType;

    


    private Long entityId;

    


    @Builder.Default
    private String priority = Priority.NORMAL;

    


    private String[] channels;

    


    private Map<String, Object> data;

    


    private String actionUrl;

    


    private String icon;

    


    private String sourceService;

    


    @Builder.Default
    private Boolean isRead = false;

    
    public static class Type {
        
        public static final String EXPENSE_CREATED = "EXPENSE_CREATED";
        public static final String EXPENSE_UPDATED = "EXPENSE_UPDATED";
        public static final String EXPENSE_DELETED = "EXPENSE_DELETED";

        
        public static final String BUDGET_CREATED = "BUDGET_CREATED";
        public static final String BUDGET_UPDATED = "BUDGET_UPDATED";
        public static final String BUDGET_EXCEEDED = "BUDGET_EXCEEDED";
        public static final String BUDGET_THRESHOLD_WARNING = "BUDGET_THRESHOLD_WARNING";

        
        public static final String BILL_CREATED = "BILL_CREATED";
        public static final String BILL_DUE_SOON = "BILL_DUE_SOON";
        public static final String BILL_OVERDUE = "BILL_OVERDUE";
        public static final String BILL_PAID = "BILL_PAID";

        
        public static final String FRIEND_REQUEST_RECEIVED = "FRIEND_REQUEST_RECEIVED";
        public static final String FRIEND_REQUEST_ACCEPTED = "FRIEND_REQUEST_ACCEPTED";
        public static final String FRIEND_ACTIVITY = "FRIEND_ACTIVITY";

        
        public static final String SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT";
        public static final String SECURITY_ALERT = "SECURITY_ALERT";

        private Type() {
        }
    }

    
    public static class Priority {
        public static final String LOW = "LOW";
        public static final String NORMAL = "NORMAL";
        public static final String HIGH = "HIGH";
        public static final String URGENT = "URGENT";

        private Priority() {
        }
    }

    
    public static class Channel {
        public static final String IN_APP = "IN_APP";
        public static final String PUSH = "PUSH";
        public static final String EMAIL = "EMAIL";
        public static final String SMS = "SMS";

        private Channel() {
        }
    }
}
