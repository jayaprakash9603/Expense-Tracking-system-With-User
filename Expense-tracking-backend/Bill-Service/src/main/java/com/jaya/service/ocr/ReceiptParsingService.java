package com.jaya.service.ocr;

import com.jaya.config.OcrConfigProperties;
import com.jaya.dto.ocr.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReceiptParsingService {

    private final OcrConfigProperties config;

    private static final Pattern CURRENCY_PATTERN = Pattern.compile(
            "[$€£¥₹%Rs\\.?]\\s*([\\d,]+\\.\\d{2})|([\\d,]+\\.\\d{2})\\s*[$€£¥₹%]",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern[] TOTAL_PATTERNS = {
            Pattern.compile("TOTAL\\s*INVOICE\\s*AMOUNT[:\\s]*[₹Rs\\.%]*\\s*([\\d,]+\\.\\d{2})",
                    Pattern.CASE_INSENSITIVE),
            Pattern.compile("TOTAL\\s*RECEIVED\\s*AMOUNT[:\\s]*[₹Rs\\.%]*\\s*([\\d,]+\\.\\d{2})",
                    Pattern.CASE_INSENSITIVE),
            Pattern.compile("(?:GRAND\\s*)?TOTAL[:\\s]*[₹Rs\\.%]*\\s*([\\d,]+\\.\\d{2})", Pattern.CASE_INSENSITIVE),
            Pattern.compile("NET\\s*(?:AMOUNT|PAYABLE)[:\\s]*[₹Rs\\.%]*\\s*([\\d,]+\\.\\d{2})",
                    Pattern.CASE_INSENSITIVE),
            Pattern.compile("(?:AMOUNT|AMT)\\s*(?:PAYABLE|DUE|PAID)[:\\s]*[₹Rs\\.%]*\\s*([\\d,]+\\.\\d{2})",
                    Pattern.CASE_INSENSITIVE),
            Pattern.compile("BILL\\s*AMOUNT[:\\s]*[₹Rs\\.%]*\\s*([\\d,]+\\.\\d{2})", Pattern.CASE_INSENSITIVE),
            Pattern.compile("(?:BALANCE|DUE)[:\\s]*[$€£]?\\s*([\\d,]+\\.\\d{2})", Pattern.CASE_INSENSITIVE),
            Pattern.compile("PAYMENT[:\\s]*[$€£]?\\s*([\\d,]+\\.\\d{2})", Pattern.CASE_INSENSITIVE)
    };

    private static final Pattern[] SUBTOTAL_PATTERNS = {
            Pattern.compile("SUB\\s*TOTAL[:\\s]*[₹Rs\\.$€£]*\\s*([\\d,]+\\.\\d{2})", Pattern.CASE_INSENSITIVE),
            Pattern.compile("SUBTOTAL[:\\s]*[₹Rs\\.$€£]*\\s*([\\d,]+\\.\\d{2})", Pattern.CASE_INSENSITIVE),
            Pattern.compile("TAXABLE\\s*(?:VALUE|AMOUNT)[:\\s]*[₹Rs\\.]*\\s*([\\d,]+\\.\\d{2})",
                    Pattern.CASE_INSENSITIVE)
    };

    private static final Pattern[] TAX_PATTERNS = {
            Pattern.compile("(?:TOTAL\\s*)?GST[:\\s]*[₹Rs\\.]*\\s*([\\d,]+\\.\\d{2})", Pattern.CASE_INSENSITIVE),
            Pattern.compile("CGST[:\\s@%\\d\\.]*[₹Rs\\.]*\\s*([\\d,]+\\.\\d{2})", Pattern.CASE_INSENSITIVE),
            Pattern.compile("SGST[:\\s@%\\d\\.]*[₹Rs\\.]*\\s*([\\d,]+\\.\\d{2})", Pattern.CASE_INSENSITIVE),
            Pattern.compile("IGST[:\\s@%\\d\\.]*[₹Rs\\.]*\\s*([\\d,]+\\.\\d{2})", Pattern.CASE_INSENSITIVE),
            Pattern.compile("CESS[:\\s@%\\d\\.]*[₹Rs\\.]*\\s*([\\d,]+\\.\\d{2})", Pattern.CASE_INSENSITIVE),
            Pattern.compile("(?:SALES\\s*)?TAX[:\\s]*[$€£]?\\s*([\\d,]+\\.\\d{2})", Pattern.CASE_INSENSITIVE),
            Pattern.compile("VAT[:\\s]*[$€£]?\\s*([\\d,]+\\.\\d{2})", Pattern.CASE_INSENSITIVE),
            Pattern.compile("HST[:\\s]*[$€£]?\\s*([\\d,]+\\.\\d{2})", Pattern.CASE_INSENSITIVE)
    };

    private static final DatePattern[] DATE_PATTERNS = {
            new DatePattern("(\\d{1,2})[/-](\\d{1,2})[/-](\\d{4})", "DD/MM/YYYY", 2, 1, 3, true),
            new DatePattern("(\\d{1,2})[/-](\\d{1,2})[/-](\\d{2})", "DD/MM/YY", 2, 1, 3, true),
            new DatePattern("(\\d{4})[/-](\\d{1,2})[/-](\\d{1,2})", "YYYY/MM/DD", 2, 3, 1, false),
            new DatePattern("(\\d{1,2})\\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s*(\\d{4})",
                    "dd MMM yyyy", 1, 0, 3, false),
            new DatePattern("(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s*(\\d{1,2}),?\\s*(\\d{4})",
                    "MMM dd yyyy", 2, 0, 3, false)
    };

    private static final Map<String, String> PAYMENT_KEYWORDS = new LinkedHashMap<>() {
        {
            put("CREDIT CARD", "Credit Card");
            put("CREDITCARD", "Credit Card");
            put("DEBIT CARD", "Debit Card");
            put("DEBITCARD", "Debit Card");
            put("VISA", "Credit Card");
            put("MASTERCARD", "Credit Card");
            put("MASTER CARD", "Credit Card");
            put("AMEX", "Credit Card");
            put("AMERICAN EXPRESS", "Credit Card");
            put("RUPAY", "Debit Card");
            put("UPI", "UPI");
            put("PHONEPE", "UPI");
            put("PAYTM", "UPI");
            put("GPAY", "UPI");
            put("GOOGLE PAY", "UPI");
            put("NET BANKING", "Net Banking");
            put("NEFT", "Net Banking");
            put("IMPS", "Net Banking");
            put("CASH", "Cash");
            put("CHECK", "Check");
            put("CHEQUE", "Check");
        }
    };

    private static final Map<String, List<String>> CATEGORY_KEYWORDS = new LinkedHashMap<>() {
        {
            put("Groceries", List.of("grocery", "supermarket", "market", "walmart", "kroger",
                    "safeway", "costco", "whole foods", "trader joe",
                    "star bazaar", "trent hypermarket", "trent", "hypermarket", "reliance fresh",
                    "reliance smart", "dmart", "d-mart", "big bazaar", "bigbazaar",
                    "more supermarket", "spencer", "nilgiri", "nature basket", "easyday", "spar",
                    "ratnadeep", "heritage", "foodworld", "hypercity", "lulu", "margin free",
                    "banana", "fruit", "vegetable", "kg", "gm", "ltr"));
            put("Food & Dining", List.of("restaurant", "cafe", "coffee", "pizza", "burger", "grill",
                    "diner", "bistro", "kitchen", "mcdonald", "starbucks", "subway", "wendy", "taco",
                    "domino", "swiggy", "zomato", "biryani", "dhaba", "hotel"));
            put("Transportation", List.of("gas", "fuel", "shell", "exxon", "chevron", "bp", "uber",
                    "lyft", "taxi", "parking", "petrol", "diesel", "indian oil", "iocl", "hpcl", "bpcl",
                    "ola", "rapido"));
            put("Shopping", List.of("store", "shop", "retail", "mall", "amazon", "target", "best buy",
                    "flipkart", "myntra", "ajio", "westside", "pantaloons", "lifestyle", "shopper stop",
                    "central", "max", "fbb"));
            put("Healthcare", List.of("pharmacy", "drug", "cvs", "walgreens", "medical", "clinic", "hospital",
                    "apollo", "medplus", "netmeds", "1mg", "pharmeasy"));
            put("Entertainment", List.of("cinema", "movie", "theater", "theatre", "netflix", "spotify",
                    "pvr", "inox", "bookmyshow"));
            put("Utilities", List.of("electric", "power", "water", "internet", "phone", "cable",
                    "airtel", "jio", "vodafone", "vi", "bsnl", "bescom", "electricity"));
        }
    };

    public OcrReceiptResponseDTO parseReceipt(OcrProcessingResult ocrResult) {
        String rawText = ocrResult.getExtractedText();
        if (rawText == null || rawText.trim().isEmpty()) {
            return buildEmptyResponse(ocrResult);
        }

        Map<String, FieldConfidence> confidenceMap = new HashMap<>();
        List<String> warnings = new ArrayList<>();

        String merchant = extractMerchant(rawText, confidenceMap);
        Double amount = extractTotalAmount(rawText, confidenceMap);
        LocalDate date = extractDate(rawText, confidenceMap, warnings);
        Double tax = extractTax(rawText, confidenceMap);
        Double subtotal = extractSubtotal(rawText);
        String paymentMethod = extractPaymentMethod(rawText);
        String currency = detectCurrency(rawText);
        List<ExtractedExpenseItem> items = extractLineItems(rawText);
        String suggestedCategory = suggestCategory(merchant, rawText);

        double overallConfidence = calculateOverallConfidence(confidenceMap);

        return OcrReceiptResponseDTO.builder()
                .merchant(merchant)
                .amount(amount)
                .date(date)
                .tax(tax)
                .subtotal(subtotal)
                .currency(currency)
                .paymentMethod(paymentMethod)
                .expenseItems(items)
                .confidenceMap(confidenceMap)
                .overallConfidence(overallConfidence)
                .rawText(rawText)
                .processingTimeMs(ocrResult.getProcessingTimeMs())
                .imageQuality(ocrResult.getQualityAssessment())
                .suggestedCategory(suggestedCategory)
                .warnings(warnings)
                .build();
    }

    private String extractMerchant(String text, Map<String, FieldConfidence> confidenceMap) {
        String[] lines = text.split("\\r?\\n");
        String lowerText = text.toLowerCase();

        List<String> merchantPatterns = List.of(
                "trent hypermarket", "star bazaar", "star market", "dmart", "d-mart",
                "big bazaar", "bigbazaar", "reliance", "more supermarket", "spencer",
                "nilgiri", "nature basket", "easyday", "spar", "ratnadeep", "heritage",
                "foodworld", "hypercity", "lulu", "margin free", "metro cash", "walmart");

        List<String> skipPatterns = List.of(
                "tax details", "tax detail", "invoice", "tender detail", "tender details",
                "payment", "gst ind", "cgst", "sgst", "igst", "cess", "total", "subtotal",
                "customer id", "cashier", "counter", "credit card", "debit card", "cash",
                "saving", "discount", "received", "balance", "fssai", "gstin", "amount",
                "item", "description", "qty", "hsn", "taxable", "net.amt", "net amt");

        for (String pattern : merchantPatterns) {
            if (lowerText.contains(pattern)) {
                for (String line : lines) {
                    if (line.toLowerCase().contains(pattern)) {
                        String merchant = line.replaceAll("[*#=\\-_]+", " ").replaceAll("\\s+", " ").trim();
                        if (merchant.length() >= 5 && merchant.length() <= 60) {
                            confidenceMap.put("merchant", FieldConfidence.high("merchant",
                                    "Merchant identified by known store pattern"));
                            return merchant;
                        }
                    }
                }
            }
        }

        for (String line : lines) {
            String trimmed = line.trim();
            String lower = trimmed.toLowerCase();
            if ((lower.contains("pvt ltd") || lower.contains("pvt. ltd") ||
                    lower.contains("private limited") || lower.endsWith(" ltd") ||
                    lower.endsWith(" limited")) && trimmed.length() >= 10) {
                boolean skip = false;
                for (String sp : skipPatterns) {
                    if (lower.contains(sp)) {
                        skip = true;
                        break;
                    }
                }
                if (!skip) {
                    String merchant = trimmed.replaceAll("[*#=\\-_]+", " ").replaceAll("\\s+", " ").trim();
                    confidenceMap.put("merchant", FieldConfidence.high("merchant",
                            "Merchant identified by company suffix"));
                    return merchant;
                }
            }
        }

        List<String> candidateLines = new ArrayList<>();
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.length() < 4)
                continue;

            String lower = trimmed.toLowerCase();

            boolean skip = false;
            for (String sp : skipPatterns) {
                if (lower.contains(sp)) {
                    skip = true;
                    break;
                }
            }
            if (skip)
                continue;

            if (trimmed.matches(".*\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}.*") ||
                    trimmed.matches(".*[₹$€£]\\s*\\d+.*") ||
                    trimmed.matches("^\\d+$") ||
                    trimmed.matches("^[\\d\\s\\-:]+$")) {
                continue;
            }

            if (trimmed.matches("^\\d{6,7}\\s+.*")) {
                continue;
            }

            int digitCount = trimmed.replaceAll("[^0-9]", "").length();
            int letterCount = trimmed.replaceAll("[^a-zA-Z]", "").length();
            if (digitCount > letterCount) {
                continue;
            }

            candidateLines.add(trimmed);
            if (candidateLines.size() >= 5)
                break;
        }

        String merchant = null;
        if (!candidateLines.isEmpty()) {
            String candidate = candidateLines.get(0).replaceAll("[*#=\\-_]+", " ").replaceAll("\\s+", " ").trim();

            int digitCount = candidate.replaceAll("[^0-9]", "").length();
            int letterCount = candidate.replaceAll("[^a-zA-Z]", "").length();

            if (letterCount >= 3 && letterCount > digitCount && candidate.length() <= 60) {
                merchant = candidate;
            }
        }

        if (merchant == null || merchant.isBlank()) {
            confidenceMap.put("merchant", FieldConfidence.low("merchant",
                    "No valid merchant name found"));
            return null;
        }

        confidenceMap.put("merchant", FieldConfidence.low("merchant",
                "Merchant name extracted from first lines - verify manually"));

        return merchant;
    }

    private Double extractTotalAmount(String text, Map<String, FieldConfidence> confidenceMap) {
        for (Pattern pattern : TOTAL_PATTERNS) {
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                try {
                    String amountStr = matcher.group(1).replace(",", "");
                    Double amount = Double.parseDouble(amountStr);
                    confidenceMap.put("amount", FieldConfidence.high("amount",
                            "Total amount found with keyword label"));
                    return amount;
                } catch (NumberFormatException e) {
                    log.debug("Failed to parse amount: {}", matcher.group(1));
                }
            }
        }

        List<Double> amounts = new ArrayList<>();
        Matcher currencyMatcher = CURRENCY_PATTERN.matcher(text);
        while (currencyMatcher.find()) {
            try {
                String amountStr = currencyMatcher.group(1) != null ? currencyMatcher.group(1)
                        : currencyMatcher.group(2);
                if (amountStr != null) {
                    amounts.add(Double.parseDouble(amountStr.replace(",", "")));
                }
            } catch (NumberFormatException e) {
            }
        }

        if (!amounts.isEmpty()) {
            Double maxAmount = Collections.max(amounts);
            confidenceMap.put("amount", FieldConfidence.medium("amount",
                    "Amount extracted as highest value - no 'TOTAL' keyword found"));
            return maxAmount;
        }

        confidenceMap.put("amount", FieldConfidence.low("amount",
                "No amount could be extracted"));
        return null;
    }

    private LocalDate extractDate(String text, Map<String, FieldConfidence> confidenceMap,
            List<String> warnings) {
        List<LocalDate> foundDates = new ArrayList<>();

        for (DatePattern dp : DATE_PATTERNS) {
            Pattern pattern = Pattern.compile(dp.regex, Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(text);
            while (matcher.find()) {
                try {
                    LocalDate date = parseDate(matcher, dp);
                    if (date != null && isReasonableDate(date)) {
                        foundDates.add(date);
                    }
                } catch (Exception e) {
                    log.debug("Failed to parse date: {}", e.getMessage());
                }
            }
        }

        if (foundDates.isEmpty()) {
            confidenceMap.put("date", FieldConfidence.low("date", "No date found"));
            return null;
        }

        if (foundDates.size() > 1) {
            warnings.add("Multiple dates found in receipt - using most recent");
            confidenceMap.put("date", FieldConfidence.medium("date",
                    "Multiple dates found - selected most recent"));
        } else {
            confidenceMap.put("date", FieldConfidence.high("date", "Single date found"));
        }

        return foundDates.stream()
                .max(Comparator.naturalOrder())
                .orElse(null);
    }

    private LocalDate parseDate(Matcher matcher, DatePattern dp) {
        try {
            if (dp.monthGroup == 0) {
                String monthStr = matcher.group(1).toLowerCase();
                int month = getMonthNumber(monthStr);
                if (month == 0)
                    return null;

                int day = Integer.parseInt(matcher.group(dp.dayGroup));
                int year = Integer.parseInt(matcher.group(dp.yearGroup));
                if (year < 100)
                    year += 2000;

                return LocalDate.of(year, month, day);
            } else {
                int group1 = Integer.parseInt(matcher.group(dp.monthGroup));
                int group2 = Integer.parseInt(matcher.group(dp.dayGroup));
                int year = Integer.parseInt(matcher.group(dp.yearGroup));
                if (year < 100)
                    year += 2000;

                int month, day;

                if (dp.isDayFirst) {
                    day = group1;
                    month = group2;
                } else {
                    month = group1;
                    day = group2;
                }

                if (month > 12 && day <= 12) {
                    int temp = month;
                    month = day;
                    day = temp;
                }

                if (month < 1 || month > 12 || day < 1 || day > 31) {
                    return null;
                }

                return LocalDate.of(year, month, day);
            }
        } catch (Exception e) {
            return null;
        }
    }

    private int getMonthNumber(String monthStr) {
        String[] months = { "jan", "feb", "mar", "apr", "may", "jun",
                "jul", "aug", "sep", "oct", "nov", "dec" };
        for (int i = 0; i < months.length; i++) {
            if (monthStr.startsWith(months[i])) {
                return i + 1;
            }
        }
        return 0;
    }

    private boolean isReasonableDate(LocalDate date) {
        LocalDate now = LocalDate.now();
        LocalDate fiveYearsAgo = now.minusYears(5);
        LocalDate oneYearAhead = now.plusYears(1);
        return date.isAfter(fiveYearsAgo) && date.isBefore(oneYearAhead);
    }

    private Double extractTax(String text, Map<String, FieldConfidence> confidenceMap) {
        for (Pattern pattern : TAX_PATTERNS) {
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                try {
                    String taxStr = matcher.group(1).replace(",", "");
                    Double tax = Double.parseDouble(taxStr);
                    confidenceMap.put("tax", FieldConfidence.high("tax", "Tax found with keyword label"));
                    return tax;
                } catch (NumberFormatException e) {
                    log.debug("Failed to parse tax: {}", matcher.group(1));
                }
            }
        }
        return null;
    }

    private Double extractSubtotal(String text) {
        for (Pattern pattern : SUBTOTAL_PATTERNS) {
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                try {
                    String subtotalStr = matcher.group(1).replace(",", "");
                    return Double.parseDouble(subtotalStr);
                } catch (NumberFormatException e) {
                    log.debug("Failed to parse subtotal: {}", matcher.group(1));
                }
            }
        }
        return null;
    }

    private String extractPaymentMethod(String text) {
        String upperText = text.toUpperCase();
        for (Map.Entry<String, String> entry : PAYMENT_KEYWORDS.entrySet()) {
            String keyword = entry.getKey();
            Pattern wordPattern = Pattern.compile("\\b" + Pattern.quote(keyword) + "\\b");
            if (wordPattern.matcher(upperText).find()) {
                return entry.getValue();
            }
        }
        return null;
    }

    private String detectCurrency(String text) {
        String upperText = text.toUpperCase();

        if (text.contains("₹"))
            return "INR";
        if (text.contains("$") && !upperText.contains("RS"))
            return "USD";
        if (text.contains("€"))
            return "EUR";
        if (text.contains("£"))
            return "GBP";
        if (text.contains("¥"))
            return "JPY";

        if (upperText.contains("RS.") || upperText.contains("RS ") ||
                upperText.contains("RUPEES") || upperText.contains("INR") ||
                upperText.contains("PAISA")) {
            return "INR";
        }

        if (upperText.contains("CGST") || upperText.contains("SGST") ||
                upperText.contains("IGST") || upperText.contains("GSTIN") ||
                upperText.contains("FSSAI")) {
            return "INR";
        }

        return "USD";
    }

    private List<ExtractedExpenseItem> extractLineItems(String text) {
        List<ExtractedExpenseItem> items = new ArrayList<>();
        Map<String, ExtractedExpenseItem> itemMap = new LinkedHashMap<>();

        String[] lines = text.split("\\r?\\n");

        log.debug("Extracting line items from {} lines", lines.length);

        Pattern indianItemPattern = Pattern.compile(
                "^\\s*(\\d{6,7})\\s+" +
                        "([\\d.]+)\\s*(KG|PC|GM|LTR|ML|PCS|NOS)?\\s*" +
                        "[₹Rs\\.$€£%]?\\s*([\\d,]+\\.\\d{2})\\s+" +
                        "[₹Rs\\.$€£%]?\\s*([\\d,]+\\.\\d{2})",
                Pattern.CASE_INSENSITIVE);

        Pattern descriptionPattern = Pattern.compile(
                "^\\s*([A-Za-z][A-Za-z0-9\\s]{2,35})\\s+" +
                        "(\\d{8})\\s*" +
                        "[₹Rs\\.$€£%]?\\s*([\\d,]+\\.\\d{2})",
                Pattern.CASE_INSENSITIVE);

        Pattern simpleItemPattern = Pattern.compile(
                "^\\s*([A-Za-z][A-Za-z0-9\\s]{2,35})\\s+" +
                        "(?:[xX]?(\\d+)\\s+)?" +
                        "[₹Rs\\.$€£%]?\\s*([\\d,]+\\.\\d{2})\\s*$",
                Pattern.CASE_INSENSITIVE);

        Pattern descAmountPattern = Pattern.compile(
                "^\\s*([A-Za-z][A-Za-z0-9\\s]{3,40})\\s+" +
                        "([\\d,]+\\.\\d{2})\\s*$",
                Pattern.CASE_INSENSITIVE);

        String pendingItemCode = null;
        Double pendingQty = null;
        String pendingUnit = null;
        Double pendingUnitPrice = null;
        Double pendingTotalPrice = null;

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty())
                continue;

            if (shouldSkipLine(line))
                continue;

            Matcher indianMatcher = indianItemPattern.matcher(line);
            if (indianMatcher.find()) {
                pendingItemCode = indianMatcher.group(1);
                try {
                    pendingQty = Double.parseDouble(indianMatcher.group(2));
                } catch (Exception e) {
                    pendingQty = 1.0;
                }
                pendingUnit = indianMatcher.group(3);
                try {
                    pendingUnitPrice = parseAmount(indianMatcher.group(4));
                    pendingTotalPrice = parseAmount(indianMatcher.group(5));

                    if (pendingUnitPrice == null || pendingTotalPrice == null ||
                            pendingUnitPrice > 50000 || pendingTotalPrice > 50000) {
                        log.debug("Skipping unreasonable price: {} / {}", pendingUnitPrice, pendingTotalPrice);
                        pendingItemCode = null;
                        continue;
                    }
                } catch (Exception e) {
                    pendingItemCode = null;
                    continue;
                }
                continue;
            }

            Matcher descMatcher = descriptionPattern.matcher(line);
            if (descMatcher.find()) {
                String description = descMatcher.group(1).trim();
                Double taxableAmount = parseAmount(descMatcher.group(3));

                if (taxableAmount == null || taxableAmount > 50000) {
                    log.debug("Skipping unreasonable taxable amount: {}", taxableAmount);
                    continue;
                }

                if (shouldSkipLine(description)) {
                    pendingItemCode = null;
                    pendingTotalPrice = null;
                    continue;
                }

                String key = description.toLowerCase() + "|" + taxableAmount;

                if (pendingItemCode != null && pendingTotalPrice != null) {
                    if (Math.abs(taxableAmount - pendingTotalPrice) < 1.0) {
                        if (!itemMap.containsKey(key)) {
                            itemMap.put(key, ExtractedExpenseItem.builder()
                                    .description(description)
                                    .quantity(pendingQty != null ? pendingQty.intValue() : 1)
                                    .unitPrice(pendingUnitPrice)
                                    .totalPrice(pendingTotalPrice)
                                    .confidence(ConfidenceLevel.HIGH)
                                    .build());
                            log.debug("Added item (with code): {} @ {}", description, pendingTotalPrice);
                        }
                    }
                } else {
                    if (!itemMap.containsKey(key)) {
                        itemMap.put(key, ExtractedExpenseItem.builder()
                                .description(description)
                                .quantity(1)
                                .unitPrice(taxableAmount)
                                .totalPrice(taxableAmount)
                                .confidence(ConfidenceLevel.MEDIUM)
                                .build());
                        log.debug("Added item (direct): {} @ {}", description, taxableAmount);
                    }
                }
                pendingItemCode = null;
                pendingTotalPrice = null;
                continue;
            }

            Matcher simpleMatcher = simpleItemPattern.matcher(line);
            if (simpleMatcher.find()) {
                String description = simpleMatcher.group(1).trim();

                if (shouldSkipLine(description))
                    continue;

                Integer qty = 1;
                if (simpleMatcher.group(2) != null) {
                    try {
                        qty = Integer.parseInt(simpleMatcher.group(2));
                    } catch (Exception e) {
                    }
                }

                Double price = parseAmount(simpleMatcher.group(3));

                if (price == null || price > 50000)
                    continue;

                String key = description.toLowerCase() + "|" + price;
                if (!itemMap.containsKey(key)) {
                    itemMap.put(key, ExtractedExpenseItem.builder()
                            .description(description)
                            .quantity(qty)
                            .unitPrice(price / qty)
                            .totalPrice(price)
                            .confidence(ConfidenceLevel.MEDIUM)
                            .build());
                }
                continue;
            }

            Matcher descAmountMatcher = descAmountPattern.matcher(line);
            if (descAmountMatcher.find()) {
                String description = descAmountMatcher.group(1).trim();

                if (shouldSkipLine(description))
                    continue;

                Double price = parseAmount(descAmountMatcher.group(2));

                if (price == null || price < 1 || price > 50000)
                    continue;

                String key = description.toLowerCase() + "|" + price;
                if (!itemMap.containsKey(key)) {
                    itemMap.put(key, ExtractedExpenseItem.builder()
                            .description(description)
                            .quantity(1)
                            .unitPrice(price)
                            .totalPrice(price)
                            .confidence(ConfidenceLevel.LOW)
                            .build());
                }
            }
        }

        items.addAll(itemMap.values());

        if (items.size() > 20) {
            items = items.subList(0, 20);
        }

        log.debug("Extracted {} line items from receipt", items.size());
        return items;
    }

    private boolean shouldSkipLine(String line) {
        if (line == null || line.length() < 3)
            return true;

        String lower = line.toLowerCase();
        return lower.contains("total") ||
                lower.contains("subtotal") ||
                lower.contains("sub total") ||
                lower.contains("balance") ||
                lower.contains("cgst") ||
                lower.contains("sgst") ||
                lower.contains("igst") ||
                lower.contains("cess") ||
                lower.contains("tax") ||
                lower.contains("gst") ||
                lower.contains("invoice") ||
                lower.contains("tender") ||
                lower.contains("credit card") ||
                lower.contains("debit card") ||
                lower.contains("received") ||
                lower.contains("saving") ||
                lower.contains("discount") ||
                lower.contains("customer") ||
                lower.contains("cashier") ||
                lower.contains("counter") ||
                lower.contains("fssai") ||
                lower.contains("gstin") ||
                lower.matches(".*\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}.*");
    }

    private Double parseAmount(String amountStr) {
        if (amountStr == null || amountStr.isBlank())
            return null;

        String cleaned = amountStr
                .replaceAll("^[₹\\$€£]", "")
                .replaceAll("^Rs\\.?\\s*", "")
                .replaceAll("^INR\\s*", "")
                .replace(",", "")
                .trim();

        if (!cleaned.isEmpty() && !Character.isDigit(cleaned.charAt(0)) && cleaned.charAt(0) != '.') {
            cleaned = cleaned.substring(1).trim();
        }

        if (cleaned.isEmpty())
            return null;

        try {
            return Double.parseDouble(cleaned);
        } catch (NumberFormatException e) {
            log.debug("Failed to parse amount: '{}' -> '{}'", amountStr, cleaned);
            return null;
        }
    }

    private String suggestCategory(String merchant, String text) {
        String searchText = (merchant != null ? merchant : "") + " " + text;
        searchText = searchText.toLowerCase();

        for (Map.Entry<String, List<String>> entry : CATEGORY_KEYWORDS.entrySet()) {
            for (String keyword : entry.getValue()) {
                if (searchText.contains(keyword.toLowerCase())) {
                    return entry.getKey();
                }
            }
        }

        return "Uncategorized";
    }

    private double calculateOverallConfidence(Map<String, FieldConfidence> confidenceMap) {
        if (confidenceMap.isEmpty()) {
            return 0.0;
        }

        double weightedSum = 0.0;
        double totalWeight = 0.0;

        Map<String, Double> weights = Map.of(
                "amount", 3.0,
                "date", 2.0,
                "merchant", 1.0,
                "tax", 0.5);

        for (Map.Entry<String, FieldConfidence> entry : confidenceMap.entrySet()) {
            double weight = weights.getOrDefault(entry.getKey(), 1.0);
            weightedSum += entry.getValue().getScore() * weight;
            totalWeight += weight;
        }

        return totalWeight > 0 ? weightedSum / totalWeight : 0.0;
    }

    private OcrReceiptResponseDTO buildEmptyResponse(OcrProcessingResult ocrResult) {
        return OcrReceiptResponseDTO.builder()
                .rawText(ocrResult.getExtractedText())
                .processingTimeMs(ocrResult.getProcessingTimeMs())
                .overallConfidence(0.0)
                .confidenceMap(new HashMap<>())
                .warnings(List.of("OCR extraction produced no usable text"))
                .build();
    }

    private static class DatePattern {
        String regex;
        String format;
        int monthGroup;
        int dayGroup;
        int yearGroup;
        boolean isDayFirst;

        DatePattern(String regex, String format, int monthGroup, int dayGroup, int yearGroup, boolean isDayFirst) {
            this.regex = regex;
            this.format = format;
            this.monthGroup = monthGroup;
            this.dayGroup = dayGroup;
            this.yearGroup = yearGroup;
            this.isDayFirst = isDayFirst;
        }

        DatePattern(String regex, String format, int monthGroup, int dayGroup, int yearGroup) {
            this(regex, format, monthGroup, dayGroup, yearGroup, false);
        }
    }
}
