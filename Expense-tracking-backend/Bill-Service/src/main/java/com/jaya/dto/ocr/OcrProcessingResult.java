package com.jaya.dto.ocr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OcrProcessingResult {

    private String extractedText;
    private double confidence;
    private boolean success;
    private String errorMessage;
    private long processingTimeMs;

    private int imageWidth;
    private int imageHeight;
    private String qualityAssessment;

    public static OcrProcessingResult success(String text, double confidence, long processingTimeMs) {
        return OcrProcessingResult.builder()
                .extractedText(text)
                .confidence(confidence)
                .success(true)
                .processingTimeMs(processingTimeMs)
                .build();
    }

    public static OcrProcessingResult failure(String errorMessage) {
        return OcrProcessingResult.builder()
                .success(false)
                .errorMessage(errorMessage)
                .build();
    }
}
