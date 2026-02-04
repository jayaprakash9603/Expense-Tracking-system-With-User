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

/**
 * =============================================================================
 * JwtProvider - JWT Token Generation and Validation
 * =============================================================================
 * 
 * Handles all JWT operations for authentication:
 * - Standard JWT generation (24 hour expiry)
 * - MFA token generation (5 minute expiry, limited scope)
 * - Token parsing and email extraction
 * 
 * Token Types:
 * 1. STANDARD: Full access token, issued after complete authentication
 * 2. MFA: Limited token, only valid for MFA verification endpoint
 * =============================================================================
 */
public class JwtProvider {

    static SecretKey key = Keys.hmacShaKeyFor(JWTConstants.SECRET_KEY.getBytes());

    // Token expiration times
    private static final long STANDARD_TOKEN_EXPIRY = 86400000; // 24 hours
    private static final long MFA_TOKEN_EXPIRY = 300000; // 5 minutes

    /**
     * Generates a standard JWT token after successful authentication.
     * Valid for 24 hours with full access to protected resources.
     * 
     * @param auth Authentication object with user details and authorities
     * @return JWT token string
     */
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

    /**
     * Generates a short-lived MFA token after password verification.
     * Valid for 5 minutes, only usable for MFA verification endpoint.
     * 
     * SECURITY:
     * - Short expiry limits exposure window
     * - mfa_pending claim identifies this as incomplete auth
     * - Should only be accepted by /auth/mfa/verify endpoint
     * 
     * @param auth Authentication object with user email
     * @return MFA token string
     */
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

    /**
     * Converts authorities collection to comma-separated string.
     * 
     * @param collection Collection of GrantedAuthority
     * @return Comma-separated string of authorities
     */
    public static String populateAuthorities(Collection<? extends GrantedAuthority> collection) {
        Set<String> auths = new HashSet<>();
        for (GrantedAuthority authority : collection) {
            auths.add(authority.getAuthority());
        }
        return String.join(",", auths);
    }

    /**
     * Extracts email from JWT token.
     * Handles both "Bearer " prefixed and raw tokens.
     * 
     * @param jwt JWT token string (may include "Bearer " prefix)
     * @return Email claim from token
     */
    public static String getEmailFromJwt(String jwt) {
        // Handle Bearer prefix if present
        if (jwt != null && jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);
        }
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(jwt).getBody();
        return String.valueOf(claims.get("email"));
    }

    /**
     * Checks if token is an MFA pending token.
     * Used to validate token type before allowing full access.
     * 
     * @param jwt JWT token string
     * @return true if this is an MFA pending token
     */
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