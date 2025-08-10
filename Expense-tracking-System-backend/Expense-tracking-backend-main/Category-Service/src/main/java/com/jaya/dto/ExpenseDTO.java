
package com.jaya.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExpenseDTO {

    private Integer id;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    private boolean includeInBudget = false;

    private Set<Integer> budgetIds = new HashSet<>();

    private Integer categoryId = 0;

    private String categoryName = "";

    // Nested expense details - matches the @OneToOne relationship
    private ExpenseDetailsDTO expense;

    private boolean isBill = false;

    private Integer userId;

    @Override
    public String toString() {
        return "ExpenseDTO{" +
                "id=" + id +
                ", date=" + date +
                ", includeInBudget=" + includeInBudget +
                ", budgetIds=" + budgetIds +
                ", categoryId=" + categoryId +
                ", categoryName='" + categoryName + '\'' +
                ", expense=" + expense +
                ", isBill=" + isBill +
                ", userId=" + userId +
                '}';
    }
}