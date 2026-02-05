package com.jaya.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;
@Service
@Slf4j
public class SecureTokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private static final int DEFAULT_TOKEN_BYTES = 32;
    private static final int MIN_TOKEN_BYTES = 16;
    public String generateToken() {
        return generateToken(DEFAULT_TOKEN_BYTES);
    }
    public String generateToken(int byteLength) {
        if (byteLength < MIN_TOKEN_BYTES) {
            log.warn("Token byte length {} is below minimum {}, using minimum", byteLength, MIN_TOKEN_BYTES);
            byteLength = MIN_TOKEN_BYTES;
        }

        byte[] randomBytes = new byte[byteLength];
        SECURE_RANDOM.nextBytes(randomBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        log.debug("Generated secure token with {} bits of entropy", byteLength * 8);
        return token;
    }
    public String generateShortToken() {
        return generateToken(MIN_TOKEN_BYTES);
    }
    public boolean isValidTokenFormat(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        return token.matches("^[A-Za-z0-9_-]+$") && token.length() >= 22;
    }
}
