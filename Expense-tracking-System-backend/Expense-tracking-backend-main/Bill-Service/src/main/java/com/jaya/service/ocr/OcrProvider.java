package com.jaya.service.ocr;

import com.jaya.dto.ocr.OcrProcessingResult;

import java.awt.image.BufferedImage;

/**
 * Interface for OCR providers.
 * Allows for easy swapping between Tesseract, Google Vision, AWS Textract, etc.
 */
public interface OcrProvider {

    /**
     * Extracts text from the given image.
     * 
     * @param image The preprocessed image to extract text from
     * @return OcrProcessingResult containing extracted text and confidence
     */
    OcrProcessingResult extractText(BufferedImage image);

    /**
     * Returns the name of this OCR provider.
     * 
     * @return Provider name (e.g., "Tesseract", "Google Vision")
     */
    String getProviderName();

    /**
     * Checks if this provider is available and properly configured.
     * 
     * @return true if provider is ready to use
     */
    boolean isAvailable();
}
