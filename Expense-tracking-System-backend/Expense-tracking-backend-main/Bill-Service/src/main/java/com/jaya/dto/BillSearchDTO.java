package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Lightweight DTO for bill search results.
 * Avoids lazy loading issues by containing only essential fields.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillSearchDTO {
    private Integer id;
    private String name;
    private String description;
    private double amount;
    private String paymentMethod;
    private String type;
    private LocalDate date;
    private double netAmount;
    private String category;
    private Integer categoryId;
    private Integer userId;
}
