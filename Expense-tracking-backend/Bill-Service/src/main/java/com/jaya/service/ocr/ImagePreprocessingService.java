package com.jaya.service.ocr;

import com.jaya.config.OcrConfigProperties;
import com.jaya.exceptions.InvalidImageException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.color.ColorSpace;
import java.awt.image.*;
import java.io.ByteArrayInputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImagePreprocessingService {

    private final OcrConfigProperties config;

    public BufferedImage preprocessImage(MultipartFile file) {
        try {
            validateImage(file);

            byte[] imageBytes = file.getBytes();
            BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(imageBytes));

            if (originalImage == null) {
                throw new InvalidImageException("Could not read image file. Invalid or corrupted image format.");
            }

            if (!config.getPreprocessing().isEnabled()) {
                log.debug("Preprocessing disabled, returning original image");
                return originalImage;
            }

            return processImage(originalImage);

        } catch (InvalidImageException e) {
            throw e;
        } catch (IOException e) {
            log.error("Failed to read image file", e);
            throw new InvalidImageException("Failed to read image file: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Image preprocessing failed", e);
            throw new InvalidImageException("Image preprocessing failed: " + e.getMessage(), e);
        }
    }

    public void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidImageException("No image file provided");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.isEmpty()) {
            throw new InvalidImageException("Invalid filename");
        }

        String extension = getFileExtension(filename).toLowerCase();
        String[] allowedExtensions = config.getUpload().getAllowedExtensions().split(",");
        boolean validExtension = false;
        for (String allowed : allowedExtensions) {
            if (extension.equals(allowed.trim().toLowerCase())) {
                validExtension = true;
                break;
            }
        }

        if (!validExtension) {
            throw new InvalidImageException("Invalid file type. Allowed: " + config.getUpload().getAllowedExtensions());
        }

        long maxSize = parseFileSize(config.getUpload().getMaxFileSize());
        if (file.getSize() > maxSize) {
            throw new InvalidImageException(
                    "File size exceeds maximum allowed: " + config.getUpload().getMaxFileSize());
        }
    }

    private BufferedImage processImage(BufferedImage original) {
        log.debug("Processing image: {}x{}", original.getWidth(), original.getHeight());

        BufferedImage resized = resizeIfNeeded(original);

        BufferedImage grayscale = convertToGrayscale(resized);

        BufferedImage enhanced = enhanceContrast(grayscale);

        BufferedImage sharpened = sharpenImage(enhanced);

        log.debug("Image preprocessing complete: {}x{}", sharpened.getWidth(), sharpened.getHeight());

        return sharpened;
    }

    private BufferedImage resizeIfNeeded(BufferedImage image) {
        int maxWidth = config.getPreprocessing().getMaxWidth();
        int maxHeight = config.getPreprocessing().getMaxHeight();

        if (image.getWidth() <= maxWidth && image.getHeight() <= maxHeight) {
            return image;
        }

        double scaleX = (double) maxWidth / image.getWidth();
        double scaleY = (double) maxHeight / image.getHeight();
        double scale = Math.min(scaleX, scaleY);

        int newWidth = (int) (image.getWidth() * scale);
        int newHeight = (int) (image.getHeight() * scale);

        BufferedImage resized = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resized.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.drawImage(image, 0, 0, newWidth, newHeight, null);
        g2d.dispose();

        log.debug("Resized image from {}x{} to {}x{}",
                image.getWidth(), image.getHeight(), newWidth, newHeight);

        return resized;
    }

    private BufferedImage convertToGrayscale(BufferedImage image) {
        ColorConvertOp op = new ColorConvertOp(
                ColorSpace.getInstance(ColorSpace.CS_GRAY), null);
        BufferedImage grayscale = new BufferedImage(
                image.getWidth(), image.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
        op.filter(image, grayscale);
        return grayscale;
    }

    private BufferedImage enhanceContrast(BufferedImage image) {
        int min = 255;
        int max = 0;

        for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                int pixel = image.getRaster().getSample(x, y, 0);
                min = Math.min(min, pixel);
                max = Math.max(max, pixel);
            }
        }

        if (max - min < 50) {
            min = Math.max(0, min - 20);
            max = Math.min(255, max + 20);
        }

        BufferedImage enhanced = new BufferedImage(
                image.getWidth(), image.getHeight(), BufferedImage.TYPE_BYTE_GRAY);

        double scale = 255.0 / (max - min);

        for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                int pixel = image.getRaster().getSample(x, y, 0);
                int newPixel = (int) ((pixel - min) * scale);
                newPixel = Math.max(0, Math.min(255, newPixel));
                enhanced.getRaster().setSample(x, y, 0, newPixel);
            }
        }

        return enhanced;
    }

    private BufferedImage sharpenImage(BufferedImage image) {
        float[] sharpenKernel = {
                0, -1, 0,
                -1, 5, -1,
                0, -1, 0
        };

        Kernel kernel = new Kernel(3, 3, sharpenKernel);
        ConvolveOp op = new ConvolveOp(kernel, ConvolveOp.EDGE_NO_OP, null);

        BufferedImage sharpened = new BufferedImage(
                image.getWidth(), image.getHeight(), image.getType());
        op.filter(image, sharpened);

        return sharpened;
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
            return filename.substring(lastDotIndex + 1);
        }
        return "";
    }

    private long parseFileSize(String sizeStr) {
        sizeStr = sizeStr.toUpperCase().trim();
        long multiplier = 1;

        if (sizeStr.endsWith("KB")) {
            multiplier = 1024;
            sizeStr = sizeStr.substring(0, sizeStr.length() - 2);
        } else if (sizeStr.endsWith("MB")) {
            multiplier = 1024 * 1024;
            sizeStr = sizeStr.substring(0, sizeStr.length() - 2);
        } else if (sizeStr.endsWith("GB")) {
            multiplier = 1024 * 1024 * 1024;
            sizeStr = sizeStr.substring(0, sizeStr.length() - 2);
        }

        return Long.parseLong(sizeStr.trim()) * multiplier;
    }

    public String assessImageQuality(BufferedImage image) {
        if (image == null) {
            return "POOR";
        }

        int width = image.getWidth();
        int height = image.getHeight();

        if (width < 200 || height < 200) {
            return "POOR";
        }

        if (width >= 800 && height >= 600) {
            return "GOOD";
        }

        return "FAIR";
    }
}
