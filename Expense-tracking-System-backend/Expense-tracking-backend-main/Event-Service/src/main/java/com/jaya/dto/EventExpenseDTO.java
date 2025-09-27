package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventExpenseDTO {

    private Integer id;
    private Integer eventId;
    private String expenseName;
    private String description;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String category;
    private String paymentMethod;
    private String vendor;
    private String receiptNumber;
    private String notes;
    private Integer userId;
}