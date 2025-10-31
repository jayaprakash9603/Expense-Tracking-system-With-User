package com.jaya.dto.events;

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
 * Event DTO for Expense-related events from social-media-app service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseEventDTO implements Serializable {
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
}
