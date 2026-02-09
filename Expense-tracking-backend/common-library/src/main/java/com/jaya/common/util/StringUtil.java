package com.jaya.common.util;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;
import java.util.regex.Pattern;




public final class StringUtil {

    private StringUtil() {
        
    }

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "^\\+?[1-9]\\d{1,14}$");

    
    
    

    


    public static boolean isEmpty(String str) {
        return str == null || str.isEmpty();
    }

    


    public static boolean isBlank(String str) {
        return str == null || str.isBlank();
    }

    


    public static boolean isNotEmpty(String str) {
        return str != null && !str.isEmpty();
    }

    


    public static boolean isNotBlank(String str) {
        return str != null && !str.isBlank();
    }

    


    public static String defaultIfBlank(String str, String defaultValue) {
        return isBlank(str) ? defaultValue : str;
    }

    
    
    

    


    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    


    public static boolean isValidPhoneNumber(String phone) {
        return phone != null && PHONE_PATTERN.matcher(phone.replaceAll("[\\s-]", "")).matches();
    }

    


    public static boolean isNumeric(String str) {
        return str != null && !str.isEmpty() && str.chars().allMatch(Character::isDigit);
    }

    


    public static boolean isAlpha(String str) {
        return str != null && !str.isEmpty() && str.chars().allMatch(Character::isLetter);
    }

    


    public static boolean isAlphanumeric(String str) {
        return str != null && !str.isEmpty() && str.chars().allMatch(Character::isLetterOrDigit);
    }

    
    
    

    


    public static String capitalize(String str) {
        if (isBlank(str)) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    


    public static String capitalizeWords(String str) {
        if (isBlank(str)) {
            return str;
        }
        String[] words = str.trim().split("\\s+");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (result.length() > 0) {
                result.append(" ");
            }
            result.append(capitalize(word));
        }
        return result.toString();
    }

    


    public static String truncate(String str, int maxLength) {
        if (str == null || str.length() <= maxLength) {
            return str;
        }
        return str.substring(0, maxLength - 3) + "...";
    }

    


    public static String normalizeWhitespace(String str) {
        if (str == null) {
            return null;
        }
        return str.trim().replaceAll("\\s+", " ");
    }

    


    public static String mask(String str, int visibleChars) {
        if (str == null || str.length() <= visibleChars) {
            return str;
        }
        int maskLength = str.length() - visibleChars;
        return "*".repeat(maskLength) + str.substring(maskLength);
    }

    


    public static String maskEmail(String email) {
        if (!isValidEmail(email)) {
            return email;
        }
        int atIndex = email.indexOf('@');
        String localPart = email.substring(0, atIndex);
        String domain = email.substring(atIndex);

        if (localPart.length() <= 4) {
            return localPart.charAt(0) + "***" + domain;
        }

        return localPart.substring(0, 2) +
                "*".repeat(localPart.length() - 4) +
                localPart.substring(localPart.length() - 2) +
                domain;
    }

    
    
    

    


    public static String generateId() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    


    public static String generateRandomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder result = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            result.append(chars.charAt(SECURE_RANDOM.nextInt(chars.length())));
        }
        return result.toString();
    }

    


    public static String generateNumericCode(int length) {
        StringBuilder result = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            result.append(SECURE_RANDOM.nextInt(10));
        }
        return result.toString();
    }

    


    public static String generateSecureToken(int byteLength) {
        byte[] bytes = new byte[byteLength];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    


    public static String slugify(String str) {
        if (isBlank(str)) {
            return "";
        }
        return str.toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}
