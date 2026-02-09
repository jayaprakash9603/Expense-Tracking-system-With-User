package com.jaya.events;

import java.io.Serializable;
import java.time.LocalDateTime;

public class CategoryExpenseEvent implements Serializable {
    private Integer userId;
    private Integer expenseId;
    private Integer categoryId;
    private String categoryName;
    private String action;
    private LocalDateTime timestamp;

    public CategoryExpenseEvent() {
        this.timestamp = LocalDateTime.now();
    }

    public CategoryExpenseEvent(Integer userId, Integer expenseId, Integer categoryId, String categoryName,
            String action) {
        this.userId = userId;
        this.expenseId = expenseId;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.action = action;
        this.timestamp = LocalDateTime.now();
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getExpenseId() {
        return expenseId;
    }

    public void setExpenseId(Integer expenseId) {
        this.expenseId = expenseId;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "CategoryExpenseEvent{" +
                "userId=" + userId +
                ", expenseId=" + expenseId +
                ", categoryId=" + categoryId +
                ", categoryName='" + categoryName + '\'' +
                ", action='" + action + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}