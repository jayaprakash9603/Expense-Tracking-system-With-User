package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetailedExpensesDTO {
    private String itemName;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
    private String comments;
}
