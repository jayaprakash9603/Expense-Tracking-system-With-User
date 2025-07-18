package com.jaya.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class AuditEvent {
    private Integer userId;
    private String username;
    private Integer expenseId;
    private String actionType;
    private String details;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    // Default constructor
    public AuditEvent() {
        this.timestamp = LocalDateTime.now();
    }

    // Constructor with parameters
    public AuditEvent(Integer userId, String username, Integer expenseId, String actionType, String details) {
        this.userId = userId;
        this.username = username;
        this.expenseId = expenseId;
        this.actionType = actionType;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Integer getExpenseId() {
        return expenseId;
    }

    public void setExpenseId(Integer expenseId) {
        this.expenseId = expenseId;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "AuditEvent{" +
                "userId=" + userId +
                ", username='" + username + '\'' +
                ", expenseId=" + expenseId +
                ", actionType='" + actionType + '\'' +
                ", details='" + details + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}