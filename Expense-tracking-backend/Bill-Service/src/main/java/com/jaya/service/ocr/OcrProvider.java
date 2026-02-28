package com.jaya.service.ocr;

import com.jaya.dto.ocr.OcrProcessingResult;

import java.awt.image.BufferedImage;

public interface OcrProvider {

    OcrProcessingResult extractText(BufferedImage image);

    String getProviderName();

    boolean isAvailable();
}
