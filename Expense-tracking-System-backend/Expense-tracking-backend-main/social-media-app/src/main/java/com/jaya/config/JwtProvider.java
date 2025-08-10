//package com.jaya.config;
//
//import java.nio.charset.StandardCharsets;
//import java.security.Key;
//import java.util.Date;
//
//import javax.crypto.SecretKey;
//
//import org.springframework.security.core.Authentication;  // Correct import
//
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.security.Keys;
//import org.springframework.stereotype.Component;
//
//import static com.jaya.config.JwtConstant.SECRET_KEY;
//
//@Component
//public class JwtProvider {
//
//    private static SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
//
//
//
//    public static String getEmailFromJwt(String jwt) {
//        jwt = jwt.substring(7);
//        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(jwt).getBody();
//        return String.valueOf(claims.get("email"));
//    }
//
//
//}
