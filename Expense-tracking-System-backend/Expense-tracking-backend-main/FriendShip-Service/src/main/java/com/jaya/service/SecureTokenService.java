package com.jaya.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Service for generating secure, non-guessable tokens.
 * Tokens have minimum 128-bit entropy for security.
 */
@Service
@Slf4j
public class SecureTokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Default token length in bytes (32 bytes = 256 bits).
     * Results in 43-character Base64 URL-safe string.
     */
    private static final int DEFAULT_TOKEN_BYTES = 32;

    /**
     * Minimum token bytes for 128-bit entropy.
     */
    private static final int MIN_TOKEN_BYTES = 16;

    /**
     * Generate a secure, URL-safe token with 256-bit entropy.
     * 
     * @return URL-safe Base64 encoded token
     */
    public String generateToken() {
        return generateToken(DEFAULT_TOKEN_BYTES);
    }

    /**
     * Generate a secure, URL-safe token with specified byte length.
     * 
     * @param byteLength Number of random bytes (minimum 16 for 128-bit entropy)
     * @return URL-safe Base64 encoded token
     */
    public String generateToken(int byteLength) {
        if (byteLength < MIN_TOKEN_BYTES) {
            log.warn("Token byte length {} is below minimum {}, using minimum", byteLength, MIN_TOKEN_BYTES);
            byteLength = MIN_TOKEN_BYTES;
        }

        byte[] randomBytes = new byte[byteLength];
        SECURE_RANDOM.nextBytes(randomBytes);

        // Use URL-safe Base64 encoding (no +, /, =)
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        log.debug("Generated secure token with {} bits of entropy", byteLength * 8);
        return token;
    }

    /**
     * Generate a shorter token (128-bit) for less critical uses.
     * 
     * @return URL-safe Base64 encoded token (22 characters)
     */
    public String generateShortToken() {
        return generateToken(MIN_TOKEN_BYTES);
    }

    /**
     * Validate token format (basic validation).
     * 
     * @param token Token to validate
     * @return true if token appears valid
     */
    public boolean isValidTokenFormat(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        // URL-safe Base64 characters only
        return token.matches("^[A-Za-z0-9_-]+$") && token.length() >= 22;
    }
}
