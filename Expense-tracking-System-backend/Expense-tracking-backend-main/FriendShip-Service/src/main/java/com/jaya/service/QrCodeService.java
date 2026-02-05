package com.jaya.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;
@Service
@Slf4j
public class QrCodeService {

    @Value("${app.share.base-url:http://localhost:3000}")
    private String shareBaseUrl;

    @Value("${app.qr.size:300}")
    private int qrSize;

    @Value("${app.qr.margin:2}")
    private int qrMargin;

    private static final String IMAGE_FORMAT = "PNG";

    public String generateQrCodeDataUri(String shareToken) {
        String shareUrl = buildShareUrl(shareToken);
        return generateQrCodeForUrl(shareUrl);
    }

    public String generateQrCodeForUrl(String url) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, qrMargin);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

            BitMatrix bitMatrix = qrCodeWriter.encode(url, BarcodeFormat.QR_CODE, qrSize, qrSize, hints);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, IMAGE_FORMAT, outputStream);

            byte[] imageBytes = outputStream.toByteArray();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            log.debug("Generated QR code for URL: {}", url);
            return "data:image/png;base64," + base64Image;

        } catch (WriterException | IOException e) {
            log.error("Failed to generate QR code for URL: {}", url, e);
            throw new RuntimeException("QR code generation failed", e);
        }
    }

    public String buildShareUrl(String shareToken) {
        return shareBaseUrl + "/share/" + shareToken;
    }

    public String generateQrCodeWithSize(String shareToken, int size) {
        String shareUrl = buildShareUrl(shareToken);
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, qrMargin);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

            BitMatrix bitMatrix = qrCodeWriter.encode(shareUrl, BarcodeFormat.QR_CODE, size, size, hints);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, IMAGE_FORMAT, outputStream);

            byte[] imageBytes = outputStream.toByteArray();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            return "data:image/png;base64," + base64Image;

        } catch (WriterException | IOException e) {
            log.error("Failed to generate QR code", e);
            throw new RuntimeException("QR code generation failed", e);
        }
    }
}
