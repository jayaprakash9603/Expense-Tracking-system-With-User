package com.jaya.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;





@Component("searchServiceJwtUtil")
public class JwtUtil {

    private final SecretKey key;

    public JwtUtil(
            @Value("${jwt.secret:your-256-bit-secret-key-for-hs256-algorithm-minimum-32-chars}") String secretKey) {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalArgumentException("jwt.secret must be configured");
        }
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    






    public Long extractUserId(String token) {
        Claims claims = parseToken(token);

        
        Object userId = claims.get("userId");
        if (userId != null) {
            if (userId instanceof Number) {
                return ((Number) userId).longValue();
            }
            return Long.parseLong(userId.toString());
        }

        
        String email = extractEmail(token);
        if (email != null) {
            
            
            return (long) Math.abs(email.hashCode());
        }

        throw new IllegalArgumentException("Unable to extract user ID from token");
    }

    





    public String extractEmail(String token) {
        Claims claims = parseToken(token);
        return claims.get("email", String.class);
    }

    





    public String extractAuthorities(String token) {
        Claims claims = parseToken(token);
        return claims.get("authorities", String.class);
    }

    





    public boolean isTokenValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    





    private Claims parseToken(String token) {
        
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
