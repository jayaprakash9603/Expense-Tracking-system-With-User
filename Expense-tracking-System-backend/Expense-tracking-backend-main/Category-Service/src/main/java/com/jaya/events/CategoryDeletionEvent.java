package com.jaya.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDeletionEvent {
    private Integer deletedCategoryId;
    private String deletedCategoryName;
    private Integer userId;
    private List<Integer> affectedExpenseIds;
    private Integer targetCategoryId;
    private String targetCategoryName;
    private LocalDateTime timestamp;
    private String eventType; // "USER_CATEGORY_DELETED" or "GLOBAL_CATEGORY_DELETED"
}
