package com.jaya.dto.ocr;

/**
 * Represents confidence levels for OCR field extraction.
 * Used to indicate how reliable the extracted data is.
 */
public enum ConfidenceLevel {
    HIGH("high", 80.0),
    MEDIUM("medium", 50.0),
    LOW("low", 0.0);

    private final String label;
    private final double minScore;

    ConfidenceLevel(String label, double minScore) {
        this.label = label;
        this.minScore = minScore;
    }

    public String getLabel() {
        return label;
    }

    public double getMinScore() {
        return minScore;
    }

    /**
     * Determines confidence level based on numeric score.
     */
    public static ConfidenceLevel fromScore(double score) {
        if (score >= HIGH.minScore)
            return HIGH;
        if (score >= MEDIUM.minScore)
            return MEDIUM;
        return LOW;
    }
}
