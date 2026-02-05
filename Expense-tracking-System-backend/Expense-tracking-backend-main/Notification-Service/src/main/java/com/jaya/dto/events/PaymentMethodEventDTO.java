package com.jaya.dto.events;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
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
    private String paymentType;
    private String description;
    private String icon;
    private String color;
    private String eventType;

    @Builder.Default
    private Boolean notifyUser = false;
}
