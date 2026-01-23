package com.jaya.dto.ocr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents confidence information for a single extracted field.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FieldConfidence {

    private String fieldName;
    private ConfidenceLevel level;
    private double score;
    private String reason;

    public static FieldConfidence high(String fieldName, String reason) {
        return FieldConfidence.builder()
                .fieldName(fieldName)
                .level(ConfidenceLevel.HIGH)
                .score(90.0)
                .reason(reason)
                .build();
    }

    public static FieldConfidence medium(String fieldName, String reason) {
        return FieldConfidence.builder()
                .fieldName(fieldName)
                .level(ConfidenceLevel.MEDIUM)
                .score(60.0)
                .reason(reason)
                .build();
    }

    public static FieldConfidence low(String fieldName, String reason) {
        return FieldConfidence.builder()
                .fieldName(fieldName)
                .level(ConfidenceLevel.LOW)
                .score(30.0)
                .reason(reason)
                .build();
    }
}
