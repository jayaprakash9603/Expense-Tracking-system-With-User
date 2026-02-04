package com.jaya.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

/**
 * JWT Token Provider for extracting user information from tokens
 */
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:your-256-bit-secret-key-here-for-production}")
    private String jwtSecret;

    /**
     * Extract user email from JWT token
     */
    public String getEmailFromToken(String token) {
        try {
            String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(jwt)
                    .getBody();

            return claims.get("email", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Extract user ID from JWT token
     */
    public Integer getUserIdFromToken(String token) {
        try {
            String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(jwt)
                    .getBody();

            Object userId = claims.get("userId");
            if (userId instanceof Integer) {
                return (Integer) userId;
            } else if (userId instanceof Long) {
                return ((Long) userId).intValue();
            } else if (userId instanceof String) {
                return Integer.parseInt((String) userId);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(jwt);

            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
