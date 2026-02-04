package com.jaya.dto.ocr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a single line item extracted from a receipt.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtractedExpenseItem {

    private String description;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
    private ConfidenceLevel confidence;
}
