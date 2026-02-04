package com.jaya.service.ocr;

import com.jaya.dto.ocr.OcrProcessingResult;
import com.jaya.exceptions.OcrProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.util.List;

/**
 * Main OCR service that orchestrates OCR processing using available providers.
 * Supports multiple OCR providers with fallback capability.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OcrService {

    private final List<OcrProvider> ocrProviders;

    /**
     * Extracts text from the given image using the first available OCR provider.
     * 
     * @param image Preprocessed image
     * @return OcrProcessingResult with extracted text
     * @throws OcrProcessingException if all providers fail
     */
    public OcrProcessingResult performOcr(BufferedImage image) {
        if (image == null) {
            throw new OcrProcessingException("Image cannot be null");
        }

        OcrProvider availableProvider = findAvailableProvider();

        log.info("Performing OCR using {} provider", availableProvider.getProviderName());

        OcrProcessingResult result = availableProvider.extractText(image);

        if (!result.isSuccess()) {
            throw new OcrProcessingException("OCR failed: " + result.getErrorMessage());
        }

        return result;
    }

    /**
     * Finds the first available OCR provider.
     * 
     * @return Available OCR provider
     * @throws OcrProcessingException if no provider is available
     */
    private OcrProvider findAvailableProvider() {
        for (OcrProvider provider : ocrProviders) {
            if (provider.isAvailable()) {
                return provider;
            }
        }
        throw new OcrProcessingException("No OCR provider is available. Please check configuration.");
    }

    /**
     * Gets the name of the currently active OCR provider.
     * 
     * @return Provider name or "None" if unavailable
     */
    public String getActiveProviderName() {
        for (OcrProvider provider : ocrProviders) {
            if (provider.isAvailable()) {
                return provider.getProviderName();
            }
        }
        return "None";
    }

    /**
     * Checks if any OCR provider is available.
     * 
     * @return true if at least one provider is available
     */
    public boolean isOcrAvailable() {
        return ocrProviders.stream().anyMatch(OcrProvider::isAvailable);
    }
}
