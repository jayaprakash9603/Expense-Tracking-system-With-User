package com.jaya.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
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
public class ExpenseDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;

    private String date;

    private LocalDate expenseDate;

    private Integer categoryId;

    private String categoryName;

    private String categoryIcon;

    private String categoryColor;

    private Integer paymentMethodId;

    private String paymentMethodName;

    private String paymentMethodIcon;

    private String paymentMethodColor;

    private ExpenseDetailsDTO expense;

    @Builder.Default
    private boolean includeInBudget = false;

    @Builder.Default
    private boolean isBill = false;

    private Integer userId;

    @Builder.Default
    private Set<Integer> budgetIds = new HashSet<>();

    

    


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ExpenseDetailsDTO implements Serializable {

        private static final long serialVersionUID = 1L;

        private Integer id;

        private String expenseName;

        private Double amount;

        private String type;

        private String paymentMethod;

        private Double netAmount;

        private String comments;

        private Double creditDue;

        @Builder.Default
        private boolean masked = false;

        


        public double getAmountSafe() {
            return amount != null ? amount : 0.0;
        }

        


        public double getNetAmountSafe() {
            return netAmount != null ? netAmount : 0.0;
        }

        


        public double getCreditDueSafe() {
            return creditDue != null ? creditDue : 0.0;
        }
    }

    

    


    public static ExpenseDTO minimal(Integer id, Integer userId) {
        return ExpenseDTO.builder()
                .id(id)
                .userId(userId)
                .build();
    }

    


    public static ExpenseDTO basic(Integer id, Integer userId, Integer categoryId, Double amount) {
        return ExpenseDTO.builder()
                .id(id)
                .userId(userId)
                .categoryId(categoryId)
                .expense(ExpenseDetailsDTO.builder().amount(amount).build())
                .build();
    }
}
