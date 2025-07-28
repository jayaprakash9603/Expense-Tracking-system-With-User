package com.jaya.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import java.time.LocalDateTime;
import java.util.Set;

public class ExpenseDeletionEvent {
    private Integer userId;
    private Integer expenseId;
    private Integer categoryId;
    private String paymentMethod;
    private String paymentType;
    private Set<Integer> budgetIds;
    private String action;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    public ExpenseDeletionEvent() {
        this.timestamp = LocalDateTime.now();
    }

    public ExpenseDeletionEvent(Integer userId, Integer expenseId, Integer categoryId,
                                String paymentMethod, String paymentType, Set<Integer> budgetIds, String action) {
        this.userId = userId;
        this.expenseId = expenseId;
        this.categoryId = categoryId;
        this.paymentMethod = paymentMethod;
        this.paymentType = paymentType;
        this.budgetIds = budgetIds;
        this.action = action;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and setters
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Integer getExpenseId() { return expenseId; }
    public void setExpenseId(Integer expenseId) { this.expenseId = expenseId; }

    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentType() { return paymentType; }
    public void setPaymentType(String paymentType) { this.paymentType = paymentType; }

    public Set<Integer> getBudgetIds() { return budgetIds; }
    public void setBudgetIds(Set<Integer> budgetIds) { this.budgetIds = budgetIds; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    @Override
    public String toString() {
        return "ExpenseDeletionEvent{" +
                "userId=" + userId +
                ", expenseId=" + expenseId +
                ", categoryId=" + categoryId +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", paymentType='" + paymentType + '\'' +
                ", budgetIds=" + budgetIds +
                ", action='" + action + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}