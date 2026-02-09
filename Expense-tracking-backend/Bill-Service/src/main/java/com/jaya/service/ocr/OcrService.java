package com.jaya.service.ocr;

import com.jaya.dto.ocr.OcrProcessingResult;
import com.jaya.exceptions.OcrProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OcrService {

    private final List<OcrProvider> ocrProviders;

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

    private OcrProvider findAvailableProvider() {
        for (OcrProvider provider : ocrProviders) {
            if (provider.isAvailable()) {
                return provider;
            }
        }
        throw new OcrProcessingException("No OCR provider is available. Please check configuration.");
    }

    public String getActiveProviderName() {
        for (OcrProvider provider : ocrProviders) {
            if (provider.isAvailable()) {
                return provider.getProviderName();
            }
        }
        return "None";
    }

    public boolean isOcrAvailable() {
        return ocrProviders.stream().anyMatch(OcrProvider::isAvailable);
    }
}
