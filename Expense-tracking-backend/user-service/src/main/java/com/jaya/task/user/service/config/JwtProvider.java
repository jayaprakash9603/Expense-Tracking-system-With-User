package com.jaya.task.user.service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import javax.crypto.SecretKey;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
















public class JwtProvider {

    static SecretKey key = Keys.hmacShaKeyFor(JWTConstants.SECRET_KEY.getBytes());

    
    private static final long STANDARD_TOKEN_EXPIRY = 86400000; 
    private static final long MFA_TOKEN_EXPIRY = 300000; 

    






    public static String generateToken(Authentication auth) {
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        String roles = populateAuthorities(authorities);

        return Jwts.builder()
                .setIssuedAt(new Date())
                .setExpiration(new Date(new Date().getTime() + STANDARD_TOKEN_EXPIRY))
                .claim("email", auth.getName())
                .claim("authorities", roles)
                .claim("token_type", "STANDARD")
                .signWith(key)
                .compact();
    }

    











    public static String generateMfaToken(Authentication auth) {
        return Jwts.builder()
                .setIssuedAt(new Date())
                .setExpiration(new Date(new Date().getTime() + MFA_TOKEN_EXPIRY))
                .claim("email", auth.getName())
                .claim("token_type", "MFA_PENDING")
                .claim("mfa_pending", true)
                .signWith(key)
                .compact();
    }

    





    public static String populateAuthorities(Collection<? extends GrantedAuthority> collection) {
        Set<String> auths = new HashSet<>();
        for (GrantedAuthority authority : collection) {
            auths.add(authority.getAuthority());
        }
        return String.join(",", auths);
    }

    






    public static String getEmailFromJwt(String jwt) {
        
        if (jwt != null && jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);
        }
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(jwt).getBody();
        return String.valueOf(claims.get("email"));
    }

    






    public static boolean isMfaPendingToken(String jwt) {
        if (jwt != null && jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);
        }
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(jwt).getBody();
            Boolean mfaPending = claims.get("mfa_pending", Boolean.class);
            return Boolean.TRUE.equals(mfaPending);
        } catch (Exception e) {
            return false;
        }
    }
}