package com.jaya.dto.ocr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OcrReceiptResponseDTO {

    private String merchant;
    private Double amount;
    private LocalDate date;
    private Double tax;
    private Double subtotal;
    private String currency;
    private String paymentMethod;

    private List<ExtractedExpenseItem> expenseItems;

    private Map<String, FieldConfidence> confidenceMap;

    private Double overallConfidence;

    private String rawText;

    private Long processingTimeMs;
    private String imageQuality;

    private String suggestedCategory;

    private List<String> warnings;
}
