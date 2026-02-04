package com.jaya.service.ocr;

import com.jaya.dto.ocr.ExtractedExpenseItem;
import com.jaya.dto.ocr.FieldConfidence;
import com.jaya.dto.ocr.OcrProcessingResult;
import com.jaya.dto.ocr.OcrReceiptResponseDTO;
import com.jaya.exceptions.InvalidImageException;
import com.jaya.exceptions.OcrProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.awt.image.BufferedImage;
import java.util.*;

/**
 * Main orchestration service for receipt OCR processing.
 * Coordinates image preprocessing, OCR extraction, and text parsing.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReceiptOcrService {

    private final ImagePreprocessingService imagePreprocessingService;
    private final OcrService ocrService;
    private final ReceiptParsingService receiptParsingService;

    /**
     * Processes a receipt image and extracts structured data.
     * 
     * @param file The uploaded receipt image
     * @return Parsed receipt data with confidence scores
     * @throws InvalidImageException  if image is invalid
     * @throws OcrProcessingException if OCR processing fails
     */
    public OcrReceiptResponseDTO processReceipt(MultipartFile file) {
        long startTime = System.currentTimeMillis();
        List<String> warnings = new ArrayList<>();

        log.info("Starting receipt OCR processing for file: {}", file.getOriginalFilename());

        // 1. Validate and preprocess image
        BufferedImage preprocessedImage;
        try {
            preprocessedImage = imagePreprocessingService.preprocessImage(file);
            log.debug("Image preprocessing completed");
        } catch (InvalidImageException e) {
            log.error("Image validation/preprocessing failed: {}", e.getMessage());
            throw e;
        }

        // 2. Assess image quality
        String quality = imagePreprocessingService.assessImageQuality(preprocessedImage);
        if ("POOR".equals(quality)) {
            warnings.add("Image quality is poor - OCR results may be inaccurate");
        }

        // 3. Perform OCR
        OcrProcessingResult ocrResult;
        try {
            ocrResult = ocrService.performOcr(preprocessedImage);
            ocrResult.setQualityAssessment(quality);
            log.debug("OCR completed, extracted {} characters",
                    ocrResult.getExtractedText() != null ? ocrResult.getExtractedText().length() : 0);
        } catch (OcrProcessingException e) {
            log.error("OCR processing failed: {}", e.getMessage());
            throw e;
        }

        // 4. Parse extracted text
        OcrReceiptResponseDTO response = receiptParsingService.parseReceipt(ocrResult);

        // Add any processing warnings
        if (response.getWarnings() == null) {
            response.setWarnings(warnings);
        } else {
            response.getWarnings().addAll(warnings);
        }

        // Update processing time to total
        long totalTime = System.currentTimeMillis() - startTime;
        response.setProcessingTimeMs(totalTime);

        log.info("Receipt OCR processing completed in {}ms. Merchant: {}, Amount: {}, Date: {}",
                totalTime, response.getMerchant(), response.getAmount(), response.getDate());

        return response;
    }

    /**
     * Processes multiple receipt images (pages of the same receipt) and merges
     * results.
     * Useful for multi-page receipts like Star Bazaar/Trent Hypermarket bills.
     * 
     * @param files Array of receipt images (pages)
     * @return Merged receipt data with combined items and confidence scores
     */
    public OcrReceiptResponseDTO processMultipleReceipts(MultipartFile[] files) {
        long startTime = System.currentTimeMillis();
        log.info("Processing {} receipt images (multi-page scan)", files.length);

        List<OcrReceiptResponseDTO> pageResults = new ArrayList<>();
        List<String> allWarnings = new ArrayList<>();
        StringBuilder combinedRawText = new StringBuilder();

        // Process each page
        for (int i = 0; i < files.length; i++) {
            try {
                log.debug("Processing page {} of {}: {}", i + 1, files.length, files[i].getOriginalFilename());
                OcrReceiptResponseDTO pageResult = processReceipt(files[i]);
                pageResults.add(pageResult);

                // Append raw text with page separator
                if (pageResult.getRawText() != null) {
                    combinedRawText.append("\n--- PAGE ").append(i + 1).append(" ---\n");
                    combinedRawText.append(pageResult.getRawText());
                }

                if (pageResult.getWarnings() != null) {
                    for (String warning : pageResult.getWarnings()) {
                        allWarnings.add("Page " + (i + 1) + ": " + warning);
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to process page {}: {}", i + 1, e.getMessage());
                allWarnings.add("Page " + (i + 1) + " processing failed: " + e.getMessage());
            }
        }

        if (pageResults.isEmpty()) {
            throw new OcrProcessingException("Failed to process any of the uploaded images");
        }

        // Merge results from all pages
        OcrReceiptResponseDTO mergedResult = mergePageResults(pageResults);
        mergedResult.setRawText(combinedRawText.toString());
        mergedResult.setWarnings(allWarnings);
        mergedResult.setProcessingTimeMs(System.currentTimeMillis() - startTime);

        // Add metadata about multi-page scan
        if (mergedResult.getWarnings() == null) {
            mergedResult.setWarnings(new ArrayList<>());
        }
        mergedResult.getWarnings().add(0, "Scanned " + files.length + " pages, merged results");

        log.info("Multi-page receipt scan completed in {}ms. Merchant: {}, Amount: {}, Items: {}",
                mergedResult.getProcessingTimeMs(), mergedResult.getMerchant(),
                mergedResult.getAmount(),
                mergedResult.getExpenseItems() != null ? mergedResult.getExpenseItems().size() : 0);

        return mergedResult;
    }

    /**
     * Merges OCR results from multiple receipt pages into a single result.
     * Strategy:
     * - Merchant: Use first non-null value (usually header on first page)
     * - Amount/Total: Use the value with highest confidence or from the page with
     * "Total Invoice Amount"
     * - Date: Use first non-null value
     * - Tax: Sum all tax values found
     * - Items: Combine all items from all pages
     * - Currency: Use most common currency found
     */
    private OcrReceiptResponseDTO mergePageResults(List<OcrReceiptResponseDTO> pageResults) {
        OcrReceiptResponseDTO merged = OcrReceiptResponseDTO.builder()
                .expenseItems(new ArrayList<>())
                .confidenceMap(new HashMap<>())
                .build();

        String bestMerchant = null;
        Double bestAmount = null;
        Double bestAmountConfidence = 0.0;
        Double totalTax = 0.0;
        List<ExtractedExpenseItem> allItems = new ArrayList<>();
        Map<String, Integer> currencyCount = new HashMap<>();
        double totalConfidence = 0.0;

        for (OcrReceiptResponseDTO page : pageResults) {
            // Merchant: prefer first non-empty value
            if (bestMerchant == null && page.getMerchant() != null && !page.getMerchant().isBlank()) {
                bestMerchant = page.getMerchant();
                if (page.getConfidenceMap() != null && page.getConfidenceMap().containsKey("merchant")) {
                    merged.getConfidenceMap().put("merchant", page.getConfidenceMap().get("merchant"));
                }
            }

            // Amount: prefer value with higher confidence or labeled as "Total Invoice
            // Amount"
            if (page.getAmount() != null) {
                double pageAmountConfidence = 0.5; // Default
                if (page.getConfidenceMap() != null && page.getConfidenceMap().containsKey("amount")) {
                    FieldConfidence fc = page.getConfidenceMap().get("amount");
                    pageAmountConfidence = fc.getScore();
                }

                // Check if this page's raw text contains "Total Invoice Amount" or "Net
                // Payable"
                boolean hasInvoiceTotal = page.getRawText() != null &&
                        (page.getRawText().toLowerCase().contains("total invoice amount") ||
                                page.getRawText().toLowerCase().contains("net payable") ||
                                page.getRawText().toLowerCase().contains("total received amount"));

                if (hasInvoiceTotal || pageAmountConfidence > bestAmountConfidence) {
                    bestAmount = page.getAmount();
                    bestAmountConfidence = hasInvoiceTotal ? 1.0 : pageAmountConfidence;
                    if (page.getConfidenceMap() != null && page.getConfidenceMap().containsKey("amount")) {
                        merged.getConfidenceMap().put("amount", page.getConfidenceMap().get("amount"));
                    }
                }
            }

            // Date: prefer first non-null value
            if (merged.getDate() == null && page.getDate() != null) {
                merged.setDate(page.getDate());
                if (page.getConfidenceMap() != null && page.getConfidenceMap().containsKey("date")) {
                    merged.getConfidenceMap().put("date", page.getConfidenceMap().get("date"));
                }
            }

            // Tax: sum all tax values
            if (page.getTax() != null && page.getTax() > 0) {
                totalTax += page.getTax();
            }

            // Subtotal: take first non-null
            if (merged.getSubtotal() == null && page.getSubtotal() != null) {
                merged.setSubtotal(page.getSubtotal());
            }

            // Items: collect all
            if (page.getExpenseItems() != null) {
                allItems.addAll(page.getExpenseItems());
            }

            // Currency: count occurrences
            if (page.getCurrency() != null) {
                currencyCount.merge(page.getCurrency(), 1, Integer::sum);
            }

            // Payment method: first non-null
            if (merged.getPaymentMethod() == null && page.getPaymentMethod() != null) {
                merged.setPaymentMethod(page.getPaymentMethod());
            }

            // Category: first non-null
            if (merged.getSuggestedCategory() == null && page.getSuggestedCategory() != null) {
                merged.setSuggestedCategory(page.getSuggestedCategory());
            }

            // Image quality: take worst
            if (page.getImageQuality() != null) {
                if (merged.getImageQuality() == null || "POOR".equals(page.getImageQuality())) {
                    merged.setImageQuality(page.getImageQuality());
                }
            }

            totalConfidence += page.getOverallConfidence() != null ? page.getOverallConfidence() : 0;
        }

        // Set merged values
        merged.setMerchant(bestMerchant);
        merged.setAmount(bestAmount);
        merged.setTax(totalTax > 0 ? totalTax : null);
        merged.setExpenseItems(deduplicateItems(allItems));

        // Set most common currency (default to INR for Indian receipts)
        merged.setCurrency(currencyCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("INR"));

        // Calculate average confidence
        merged.setOverallConfidence(totalConfidence / pageResults.size());

        return merged;
    }

    /**
     * Removes duplicate items based on description similarity.
     */
    private List<ExtractedExpenseItem> deduplicateItems(List<ExtractedExpenseItem> items) {
        if (items == null || items.isEmpty())
            return items;

        List<ExtractedExpenseItem> unique = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        for (ExtractedExpenseItem item : items) {
            // Create a normalized key for deduplication
            String key = normalizeItemKey(item);
            if (!seen.contains(key)) {
                seen.add(key);
                unique.add(item);
            }
        }

        return unique;
    }

    /**
     * Creates a normalized key for item comparison.
     */
    private String normalizeItemKey(ExtractedExpenseItem item) {
        String desc = item.getDescription() != null ? item.getDescription().toLowerCase().replaceAll("\\s+", " ").trim()
                : "";
        Double price = item.getTotalPrice() != null ? item.getTotalPrice() : 0.0;
        return desc + "|" + String.format("%.2f", price);
    }

    /**
     * Checks if OCR service is available and ready.
     * 
     * @return true if OCR can process receipts
     */
    public boolean isServiceAvailable() {
        return ocrService.isOcrAvailable();
    }

    /**
     * Gets the name of the active OCR provider.
     * 
     * @return Provider name
     */
    public String getActiveProvider() {
        return ocrService.getActiveProviderName();
    }
}
