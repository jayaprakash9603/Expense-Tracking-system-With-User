package com.jaya.config;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.security.core.Authentication;  // Correct import

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import static com.jaya.config.JwtConstant.SECRET_KEY;

@Component
public class JwtProvider {

    private static SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

   
    public static String generateToken(Authentication auth) {
        String jwt = Jwts.builder()
                .setIssuer("Jayaprakash")
                .setIssuedAt(new Date())
                .setExpiration(new Date(new Date().getTime() + 86400000))  // 1 day expiration
                .claim("email", auth.getName())
                .signWith(key)
                .compact();
        return jwt;
    }
    
    public static String getEmailFromJwtToken(String jwt)
    {
        try {
            if (jwt == null || jwt.isEmpty()) {
                System.out.println("Token is null or empty");
                return null;
            }

            System.out.println("Parsing token: " + jwt);

            // Remove 'Bearer ' prefix if present
            if (jwt.startsWith("Bearer ")) {
                jwt = jwt.substring(7);
            }

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(jwt)
                    .getBody();

            String email = claims.get("email", String.class);
            System.out.println("Extracted email: " + email);

            return email;
        } catch (Exception e) {
            System.out.println("Error parsing token: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }


    public static String getEmailFromJwtTokenDebug(String token) {
        try {
            // Print token for debugging
            System.out.println("Parsing token: " + token);

            // Create signing key
            Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));

            // Parse token and extract claims
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Extract email from claims
            String email = claims.get("email", String.class);
            System.out.println("Extracted email: " + email);

            return email;
        } catch (Exception e) {
            System.out.println("Error parsing token: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
