package com.jaya.kafka.events;

import com.fasterxml.jackson.annotation.JsonFormat;
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

/**
 * Event DTO for Category notifications
 * This matches the CategoryEventDTO structure expected by Notification Service
 * 
 * Follows the same pattern as ExpenseNotificationEvent for consistency
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryNotificationEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer categoryId;
    private Integer userId;
    private String action; // CREATE, UPDATE, DELETE, BUDGET_EXCEEDED
    private String categoryName;
    private String description;
    private String icon;
    private String color;
    private Double budgetLimit;
    private Double totalExpenses;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime timestamp;

    private String metadata; // JSON string for additional data

    /**
     * Action constants for category events
     */
    public static class Action {
        public static final String CREATE = "CREATE";
        public static final String UPDATE = "UPDATE";
        public static final String DELETE = "DELETE";
        public static final String BUDGET_EXCEEDED = "BUDGET_EXCEEDED";

        private Action() {
            // Utility class
        }
    }
}
