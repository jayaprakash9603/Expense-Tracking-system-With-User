package com.jaya.dto.ocr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Response DTO containing all extracted receipt data with confidence scores.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OcrReceiptResponseDTO {

    // Extracted fields
    private String merchant;
    private Double amount;
    private LocalDate date;
    private Double tax;
    private Double subtotal;
    private String currency;
    private String paymentMethod;

    // Line items (if detected)
    private List<ExtractedExpenseItem> expenseItems;

    // Confidence information for each field
    private Map<String, FieldConfidence> confidenceMap;

    // Overall OCR confidence score (0-100)
    private Double overallConfidence;

    // Raw extracted text for debugging/manual review
    private String rawText;

    // Processing metadata
    private Long processingTimeMs;
    private String imageQuality;

    // Suggested category based on merchant name
    private String suggestedCategory;

    // Any warnings or notes about the extraction
    private List<String> warnings;
}
