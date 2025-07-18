package com.jaya.models;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetailedExpenses {
    private String itemName;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
    private String comments = "";
}