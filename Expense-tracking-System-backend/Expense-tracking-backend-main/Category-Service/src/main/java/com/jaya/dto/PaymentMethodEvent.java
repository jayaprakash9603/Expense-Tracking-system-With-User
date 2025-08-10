package com.jaya.dto;

import java.io.Serializable;

public class PaymentMethodEvent implements Serializable {
    private Integer userId;
    private Integer expenseId;
    private String paymentMethodName;
    private String paymentType;
    private String description;
    private String icon;
    private String color;
    private String eventType; // CREATE, UPDATE, DELETE

    // Constructors
    public PaymentMethodEvent() {}

    public PaymentMethodEvent(Integer userId, Integer expenseId, String paymentMethodName,
                              String paymentType, String description, String icon,
                              String color, String eventType) {
        this.userId = userId;
        this.expenseId = expenseId;
        this.paymentMethodName = paymentMethodName;
        this.paymentType = paymentType;
        this.description = description;
        this.icon = icon;
        this.color = color;
        this.eventType = eventType;
    }

    // Getters and Setters
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Integer getExpenseId() { return expenseId; }
    public void setExpenseId(Integer expenseId) { this.expenseId = expenseId; }

    public String getPaymentMethodName() { return paymentMethodName; }
    public void setPaymentMethodName(String paymentMethodName) { this.paymentMethodName = paymentMethodName; }

    public String getPaymentType() { return paymentType; }
    public void setPaymentType(String paymentType) { this.paymentType = paymentType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
}