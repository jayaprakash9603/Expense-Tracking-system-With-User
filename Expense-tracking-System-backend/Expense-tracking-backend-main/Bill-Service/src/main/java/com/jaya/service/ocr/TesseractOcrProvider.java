package com.jaya.service.ocr;

import com.jaya.config.OcrConfigProperties;
import com.jaya.dto.ocr.OcrProcessingResult;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.stereotype.Component;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Component
@RequiredArgsConstructor
@Slf4j
public class TesseractOcrProvider implements OcrProvider {

    private final OcrConfigProperties config;
    private ITesseract tesseract;
    private boolean available = false;
    private String unavailableReason = null;

    @PostConstruct
    public void init() {
        try {
            tesseract = new Tesseract();

            String dataPath = resolveTessdataPath();
            if (dataPath != null) {
                tesseract.setDatapath(dataPath);
                log.info("Tesseract data path set to: {}", dataPath);
            } else {
                log.info("Using tess4j bundled tessdata");
            }

            tesseract.setLanguage(config.getTesseract().getLanguage());

            tesseract.setPageSegMode(config.getTesseract().getPageSegMode());

            tesseract.setOcrEngineMode(config.getTesseract().getOemMode());

            tesseract.setVariable("tessedit_char_whitelist",
                    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,/$₹@#%&*()-+=:;'\" ");
            tesseract.setVariable("preserve_interword_spaces", "1");

            if (!testTesseractWorks()) {
                unavailableReason = "Tesseract OCR initialization failed. " +
                        "Please ensure tessdata folder exists with language files (eng.traineddata). " +
                        "Download from: https:
                log.warn(unavailableReason);
                available = false;
                return;
            }

            available = true;
            log.info("Tesseract OCR initialized successfully");

        } catch (UnsatisfiedLinkError e) {
            unavailableReason = "Tesseract native libraries error: " + e.getMessage();
            log.error(unavailableReason);
            available = false;
        } catch (Exception e) {
            unavailableReason = "Failed to initialize Tesseract OCR: " + e.getMessage();
            log.error(unavailableReason, e);
            available = false;
        }
    }

    private boolean testTesseractWorks() {
        try {
            BufferedImage testImage = new BufferedImage(50, 50, BufferedImage.TYPE_INT_RGB);
            for (int x = 0; x < 50; x++) {
                for (int y = 0; y < 50; y++) {
                    testImage.setRGB(x, y, 0xFFFFFF);
                }
            }

            tesseract.doOCR(testImage);
            return true;
        } catch (TesseractException e) {
            log.debug("Tesseract test failed with TesseractException: {}", e.getMessage());
            return true;
        } catch (Error e) {
            log.error("Tesseract test failed with Error: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("Tesseract test failed: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public OcrProcessingResult extractText(BufferedImage image) {
        if (!available) {
            String message = unavailableReason != null ? unavailableReason : "Tesseract OCR is not available";
            return OcrProcessingResult.failure(message);
        }

        if (image == null) {
            return OcrProcessingResult.failure("Image is null");
        }

        long startTime = System.currentTimeMillis();

        try {
            String extractedText = tesseract.doOCR(image);
            long processingTime = System.currentTimeMillis() - startTime;

            double confidence = estimateConfidence(extractedText);

            log.debug("OCR completed in {}ms, confidence: {}", processingTime, confidence);

            OcrProcessingResult result = OcrProcessingResult.success(extractedText, confidence, processingTime);
            result.setImageWidth(image.getWidth());
            result.setImageHeight(image.getHeight());

            return result;

        } catch (TesseractException e) {
            log.error("Tesseract OCR failed", e);
            return OcrProcessingResult.failure("OCR processing failed: " + e.getMessage());
        } catch (Error e) {
            log.error("Tesseract native library error", e);
            available = false;
            unavailableReason = "Tesseract native library error: " + e.getMessage();
            return OcrProcessingResult
                    .failure("OCR native library error. Please ensure Tesseract is properly installed.");
        }
    }

    @Override
    public String getProviderName() {
        return "Tesseract";
    }

    @Override
    public boolean isAvailable() {
        return available;
    }

    public String getUnavailableReason() {
        return unavailableReason;
    }

    private String resolveTessdataPath() {
        String configuredPath = config.getTesseract().getDataPath();

        if (configuredPath != null && !configuredPath.isEmpty()) {
            Path configPath = Paths.get(configuredPath);
            if (Files.exists(configPath) && Files.isDirectory(configPath)) {
                if (Files.exists(configPath.resolve("eng.traineddata"))) {
                    log.info("Using configured tessdata path: {}", configPath.toAbsolutePath());
                    return configPath.toAbsolutePath().toString();
                }
            }
        }

        Path targetTessdata = Paths.get("target/classes/tessdata");
        if (Files.exists(targetTessdata) && Files.exists(targetTessdata.resolve("eng.traineddata"))) {
            log.info("Using target/classes tessdata: {}", targetTessdata.toAbsolutePath());
            return targetTessdata.toAbsolutePath().toString();
        }

        Path srcTessdata = Paths.get("src/main/resources/tessdata");
        if (Files.exists(srcTessdata) && Files.exists(srcTessdata.resolve("eng.traineddata"))) {
            log.info("Using src/main/resources tessdata: {}", srcTessdata.toAbsolutePath());
            return srcTessdata.toAbsolutePath().toString();
        }

        try {
            URL resourceUrl = getClass().getClassLoader().getResource("tessdata/eng.traineddata");
            if (resourceUrl != null) {
                String resourcePath = resourceUrl.getPath();
                File tessDataFile = new File(resourcePath).getParentFile();
                if (tessDataFile != null && tessDataFile.exists()) {
                    log.info("Using classpath tessdata: {}", tessDataFile.getAbsolutePath());
                    return tessDataFile.getAbsolutePath();
                }
            }
        } catch (Exception e) {
            log.debug("Could not resolve classpath tessdata: {}", e.getMessage());
        }

        String userHome = System.getProperty("user.home");
        String[] commonPaths = {
                userHome + "\\AppData\\Local\\Programs\\Tesseract-OCR\\tessdata",
                userHome + "\\AppData\\Local\\Tesseract-OCR\\tessdata",
                "C:\\Program Files\\Tesseract-OCR\\tessdata",
                "C:\\Program Files (x86)\\Tesseract-OCR\\tessdata",
                "/usr/share/tesseract-ocr/4.00/tessdata",
                "/usr/share/tesseract-ocr/5/tessdata",
                "/usr/share/tessdata",
                "/usr/local/share/tessdata",
                "/opt/homebrew/share/tessdata",
                userHome + "/tessdata"
        };

        for (String path : commonPaths) {
            Path tessPath = Paths.get(path);
            if (Files.exists(tessPath) && Files.exists(tessPath.resolve("eng.traineddata"))) {
                log.info("Found tessdata at: {}", path);
                return path;
            }
        }

        log.warn("Could not find tessdata directory with eng.traineddata. Tess4j will use defaults.");
        return null;
    }

    private double estimateConfidence(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0.0;
        }

        double confidence = 50.0;

        if (text.contains("$") || text.contains("€") || text.contains("£")) {
            confidence += 10;
        }
        if (text.matches(".*\\d+\\.\\d{2}.*")) {
            confidence += 10;
        }
        if (text.toLowerCase().contains("total") || text.toLowerCase().contains("subtotal")) {
            confidence += 10;
        }
        if (text.matches(".*\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}.*")) {
            confidence += 5;
        }

        int garbleCount = 0;
        for (char c : text.toCharArray()) {
            if (!Character.isLetterOrDigit(c) && !Character.isWhitespace(c)
                    && ".,/$@#%&*()-+=:;'\"".indexOf(c) < 0) {
                garbleCount++;
            }
        }
        double garbleRatio = (double) garbleCount / text.length();
        if (garbleRatio > 0.1) {
            confidence -= 20;
        }

        return Math.max(0, Math.min(100, confidence));
    }
}
