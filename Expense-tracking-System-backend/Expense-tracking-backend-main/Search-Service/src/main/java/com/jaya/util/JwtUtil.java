package com.jaya.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

/**
 * JWT Utility for extracting user information from JWT tokens.
 * Used by controllers to identify the authenticated user.
 */
@Component
public class JwtUtil {

    private final SecretKey key;

    public JwtUtil(
            @Value("${jwt.secret:lajlskdjfoqiuweorlasjdfljqweoirulajsdfkqweori,nmnm,zxhcvoasuier}") String secretKey) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    /**
     * Extract user ID from JWT token.
     * The user ID is typically stored as a claim in the token.
     *
     * @param token JWT token string (without "Bearer " prefix)
     * @return User ID as Long
     */
    public Long extractUserId(String token) {
        Claims claims = parseToken(token);

        // Try to get userId claim directly
        Object userId = claims.get("userId");
        if (userId != null) {
            if (userId instanceof Number) {
                return ((Number) userId).longValue();
            }
            return Long.parseLong(userId.toString());
        }

        // Fallback: extract from email and lookup (simplified - return hash for now)
        String email = extractEmail(token);
        if (email != null) {
            // In production, you'd lookup the user ID from email
            // For now, use email hashCode as a temporary ID
            return (long) Math.abs(email.hashCode());
        }

        throw new IllegalArgumentException("Unable to extract user ID from token");
    }

    /**
     * Extract email from JWT token.
     *
     * @param token JWT token string (without "Bearer " prefix)
     * @return Email address
     */
    public String extractEmail(String token) {
        Claims claims = parseToken(token);
        return claims.get("email", String.class);
    }

    /**
     * Extract authorities/roles from JWT token.
     *
     * @param token JWT token string (without "Bearer " prefix)
     * @return Comma-separated authorities string
     */
    public String extractAuthorities(String token) {
        Claims claims = parseToken(token);
        return claims.get("authorities", String.class);
    }

    /**
     * Check if token is valid (not expired, properly signed).
     *
     * @param token JWT token string
     * @return true if valid
     */
    public boolean isTokenValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Parse JWT token and return claims.
     *
     * @param token JWT token string
     * @return Claims from token
     */
    private Claims parseToken(String token) {
        // Handle Bearer prefix if present
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
