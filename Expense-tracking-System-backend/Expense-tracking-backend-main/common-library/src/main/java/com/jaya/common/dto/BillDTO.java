package com.jaya.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Common Bill DTO used across all microservices.
 * Contains bill information for inter-service communication.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BillDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;

    private String name;

    private String description;

    private Double amount;

    private String paymentMethod;

    private String type;

    private Double creditDue;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    private LocalDate dueDate;

    private Double netAmount;

    private Integer userId;

    private String category;

    private Integer categoryId;

    private Integer expenseId;

    private List<BillExpenseDTO> expenses;

    @Builder.Default
    private boolean includeInBudget = false;

    @Builder.Default
    private Set<Integer> budgetIds = new HashSet<>();

    // Bill status
    private String status;

    private boolean paid;

    private boolean overdue;

    private boolean recurring;

    private String recurrencePattern;

    // ==================== Nested DTO ====================

    /**
     * Bill expense details
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class BillExpenseDTO implements Serializable {

        private static final long serialVersionUID = 1L;

        private Integer id;

        private String name;

        private Double amount;

        private String description;
    }

    // ==================== Bill Status Constants ====================

    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_PAID = "PAID";
    public static final String STATUS_OVERDUE = "OVERDUE";
    public static final String STATUS_CANCELLED = "CANCELLED";

    // ==================== Factory Methods ====================

    /**
     * Create a minimal BillDTO
     */
    public static BillDTO minimal(Integer id, Integer userId) {
        return BillDTO.builder()
                .id(id)
                .userId(userId)
                .build();
    }

    /**
     * Create BillDTO with basic info
     */
    public static BillDTO basic(Integer id, String name, Double amount, LocalDate dueDate, Integer userId) {
        return BillDTO.builder()
                .id(id)
                .name(name)
                .amount(amount)
                .dueDate(dueDate)
                .userId(userId)
                .status(STATUS_PENDING)
                .build();
    }

    /**
     * Check if bill is overdue
     */
    public boolean isOverdue() {
        return !paid && dueDate != null && LocalDate.now().isAfter(dueDate);
    }

    /**
     * Get bill status string
     */
    public String getStatusString() {
        if (paid)
            return STATUS_PAID;
        if (isOverdue())
            return STATUS_OVERDUE;
        return STATUS_PENDING;
    }
}
