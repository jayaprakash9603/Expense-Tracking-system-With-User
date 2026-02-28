package com.jaya.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;





@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BudgetDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;

    private String name;

    private String description;

    private Double amount;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonSerialize(using = LocalDateSerializer.class)
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonSerialize(using = LocalDateSerializer.class)
    private LocalDate endDate;

    private Integer userId;

    @Builder.Default
    private Set<Integer> expenseIds = new HashSet<>();

    private Double remainingAmount;

    private Double spentAmount;

    private Double percentageUsed;

    @Builder.Default
    private boolean budgetHasExpenses = false;

    @Builder.Default
    private boolean includeInBudget = false;

    
    @Builder.Default
    private boolean notification50PercentSent = false;

    @Builder.Default
    private boolean notification80PercentSent = false;

    @Builder.Default
    private boolean notification100PercentSent = false;

    private int editCount;

    private boolean edited;

    
    private String status;

    private boolean active;

    private boolean expired;

    private boolean exceeded;

    

    


    public Double calculatePercentageUsed() {
        if (amount == null || amount <= 0 || spentAmount == null) {
            return 0.0;
        }
        return (spentAmount / amount) * 100;
    }

    


    public Double calculateRemainingAmount() {
        if (amount == null || spentAmount == null) {
            return amount;
        }
        return amount - spentAmount;
    }

    


    public boolean isExceeded() {
        return spentAmount != null && amount != null && spentAmount > amount;
    }

    


    public boolean isExpired() {
        return endDate != null && LocalDate.now().isAfter(endDate);
    }

    


    public boolean isActive() {
        return !isExpired() && !isExceeded();
    }

    


    public String getStatusString() {
        if (isExpired())
            return "EXPIRED";
        if (isExceeded())
            return "EXCEEDED";
        Double percentage = calculatePercentageUsed();
        if (percentage >= 80)
            return "WARNING";
        return "ACTIVE";
    }

    

    


    public static BudgetDTO minimal(Integer id, Integer userId) {
        return BudgetDTO.builder()
                .id(id)
                .userId(userId)
                .build();
    }

    


    public static BudgetDTO basic(Integer id, String name, Double amount, Integer userId) {
        return BudgetDTO.builder()
                .id(id)
                .name(name)
                .amount(amount)
                .userId(userId)
                .remainingAmount(amount)
                .spentAmount(0.0)
                .percentageUsed(0.0)
                .build();
    }
}
