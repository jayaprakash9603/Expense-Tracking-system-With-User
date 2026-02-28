package com.jaya.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Common JWT utilities shared across all services.
 * Provides token validation and claims extraction.
 * 
 * Bean is registered via CommonLibraryAutoConfiguration when:
 * - common-library.jwt.enabled=true (default)
 * - Spring Security is on the classpath
 */
@Slf4j
public class JwtUtil {

    @Value("${jwt.secret:your-256-bit-secret-key-for-hs256-algorithm-minimum-32-chars}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private Long expiration;

    /**
     * Get the signing key for JWT operations.
     */
    public SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Extract all claims from a JWT token.
     *
     * @param token the JWT token
     * @return the claims
     */
    public Claims extractAllClaims(String token) {
        String cleanToken = cleanToken(token);
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(cleanToken)
                .getPayload();
    }

    /**
     * Extract the email/username from a JWT token.
     *
     * @param token the JWT token
     * @return the email/username
     */
    public String extractEmail(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("email", String.class);
    }

    /**
     * Extract the user ID from a JWT token.
     *
     * @param token the JWT token
     * @return the user ID
     */
    public Integer extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("userId", Integer.class);
    }

    /**
     * Check if the token is expired.
     *
     * @param token the JWT token
     * @return true if expired
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = extractAllClaims(token);
            Date expiration = claims.getExpiration();
            return expiration != null && expiration.before(new Date());
        } catch (Exception e) {
            log.warn("Error checking token expiration: {}", e.getMessage());
            return true;
        }
    }

    /**
     * Validate the token.
     *
     * @param token the JWT token
     * @return true if valid
     */
    public boolean validateToken(String token) {
        try {
            String cleanToken = cleanToken(token);
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(cleanToken);
            return !isTokenExpired(token);
        } catch (Exception e) {
            log.warn("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Clean the token by removing "Bearer " prefix if present.
     */
    private String cleanToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return token;
    }
}
