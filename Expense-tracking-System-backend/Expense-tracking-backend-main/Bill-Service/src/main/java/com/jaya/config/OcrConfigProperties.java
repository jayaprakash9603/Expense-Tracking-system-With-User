package com.jaya.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for OCR functionality.
 */
@Configuration
@ConfigurationProperties(prefix = "ocr")
@Data
public class OcrConfigProperties {

    private Tesseract tesseract = new Tesseract();
    private Preprocessing preprocessing = new Preprocessing();
    private Upload upload = new Upload();
    private Confidence confidence = new Confidence();

    @Data
    public static class Tesseract {
        private String dataPath = "tessdata";
        private String language = "eng";
        private int pageSegMode = 3;
        private int oemMode = 3;
    }

    @Data
    public static class Preprocessing {
        private boolean enabled = true;
        private int targetDpi = 300;
        private int maxWidth = 2000;
        private int maxHeight = 2000;
    }

    @Data
    public static class Upload {
        private String maxFileSize = "10MB";
        private String allowedExtensions = "jpg,jpeg,png,gif,bmp,tiff";
    }

    @Data
    public static class Confidence {
        private double highThreshold = 80.0;
        private double mediumThreshold = 50.0;
    }
}
