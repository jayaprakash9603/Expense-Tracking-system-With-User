package com.jaya.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseUpdateEvent {
    private Integer expenseId;
    private Integer oldCategoryId;
    private Integer newCategoryId;
    private String newCategoryName;
    private Integer userId;
    private LocalDateTime timestamp;
    private String reason; // "CATEGORY_DELETED"
}