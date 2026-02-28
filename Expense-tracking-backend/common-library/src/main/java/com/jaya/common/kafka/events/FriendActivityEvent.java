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
public class FriendActivityEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    


    @Builder.Default
    private String eventId = UUID.randomUUID().toString();

    


    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    
    private Integer actorUserId;
    private String actorUsername;
    private String actorFullName;
    private String actorImage;

    
    private String activityType;
    private String entityType;
    private Long entityId;
    private String entityName;
    private String description;
    private Double amount;

    
    private Map<String, Object> entityPayload;

    
    private String sourceService;

    
    public static class ActivityType {
        
        public static final String EXPENSE_ADDED = "EXPENSE_ADDED";
        public static final String EXPENSE_UPDATED = "EXPENSE_UPDATED";

        
        public static final String BUDGET_CREATED = "BUDGET_CREATED";
        public static final String BUDGET_ACHIEVED = "BUDGET_ACHIEVED";

        
        public static final String CATEGORY_CREATED = "CATEGORY_CREATED";

        
        public static final String PAYMENT_METHOD_ADDED = "PAYMENT_METHOD_ADDED";

        
        public static final String BILL_PAID = "BILL_PAID";

        
        public static final String SAVINGS_GOAL_REACHED = "SAVINGS_GOAL_REACHED";
        public static final String STREAK_ACHIEVED = "STREAK_ACHIEVED";

        private ActivityType() {
        }
    }
}
