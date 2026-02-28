
package com.jaya.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExpenseDTO {

    private Integer id;

    private String date;

    private boolean includeInBudget = false;

    private Set<Integer> budgetIds = new HashSet<>();

    private Integer categoryId = 0;

    private String categoryName = "";

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