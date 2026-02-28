package com.jaya.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;




@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:your-256-bit-secret-key-here-for-production}")
    private String jwtSecret;

    


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
