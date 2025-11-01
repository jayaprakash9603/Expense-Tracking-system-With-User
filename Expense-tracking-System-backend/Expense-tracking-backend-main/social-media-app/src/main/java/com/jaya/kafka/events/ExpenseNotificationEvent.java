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
 * Event DTO for Expense notifications
 * This matches the ExpenseEventDTO structure expected by Notification Service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseNotificationEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer expenseId;
    private Integer userId;
    private String action; // CREATE, UPDATE, DELETE, APPROVE, REJECT
    private Double amount;
    private String description;
    private String category;
    private String paymentMethod;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime timestamp;

    private String metadata; // JSON string for additional data

    /**
     * Action constants for expense events
     */
    public static class Action {
        public static final String CREATE = "CREATE";
        public static final String UPDATE = "UPDATE";
        public static final String DELETE = "DELETE";
        public static final String APPROVE = "APPROVE";
        public static final String REJECT = "REJECT";

        private Action() {
            // Utility class
        }
    }
}
