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
import java.util.Set;

/**
 * Event DTO for Budget-related events from Budget-Service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetEventDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer budgetId;
    private Integer userId;
    private String action; // CREATE, UPDATE, DELETE, EXCEEDED, WARNING, LIMIT_APPROACHING
    private String budgetName;
    private Double amount;
    private Double spentAmount;
    private Double remainingAmount;
    private String category;
    private String period; // MONTHLY, WEEKLY, YEARLY
    private Set<Integer> expenseIds;
    private Double percentageUsed;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime timestamp;

    private String metadata;
}
