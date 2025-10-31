package com.jaya.dto.events;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Event DTO for Payment Method-related events from Payment-Method-Service
 * This matches the PaymentMethodEvent structure from Payment-method-Service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentMethodEventDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer userId;
    private Integer expenseId;
    private String paymentMethodName;
    private String paymentType; // income, expense
    private String description;
    private String icon;
    private String color;
    private String eventType; // CREATE, UPDATE, DELETE
}
