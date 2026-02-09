package com.jaya.task.user.service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JwtTokenValidator extends OncePerRequestFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String jwt = request.getHeader(JWTConstants.JWT_HEADER);

        if (jwt != null && jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);

            try {
                SecretKey key = Keys.hmacShaKeyFor(JWTConstants.SECRET_KEY.getBytes());
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(jwt)
                        .getBody();

                String email = String.valueOf(claims.get("email"));
                String authorities = String.valueOf(claims.get("authorities"));

                List<GrantedAuthority> auths = AuthorityUtils.commaSeparatedStringToAuthorityList(authorities);
                Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, auths);
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (ExpiredJwtException e) {
                handleJwtException(response, HttpServletResponse.SC_UNAUTHORIZED,
                        "Token has expired. Please login again.");
                return;

            } catch (MalformedJwtException e) {
                handleJwtException(response, HttpServletResponse.SC_UNAUTHORIZED,
                        "Invalid token format.");
                return;

            } catch (SignatureException e) {
                handleJwtException(response, HttpServletResponse.SC_UNAUTHORIZED,
                        "Invalid token signature.");
                return;

            } catch (UnsupportedJwtException e) {
                handleJwtException(response, HttpServletResponse.SC_UNAUTHORIZED,
                        "Unsupported token.");
                return;

            } catch (IllegalArgumentException e) {
                handleJwtException(response, HttpServletResponse.SC_BAD_REQUEST,
                        "Token cannot be null or empty.");
                return;

            } catch (Exception e) {
                handleJwtException(response, HttpServletResponse.SC_UNAUTHORIZED,
                        "Invalid token: " + e.getMessage());
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void handleJwtException(HttpServletResponse response, int status, String message)
            throws IOException {

        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now().toString());
        errorResponse.put("error", getErrorName(status));
        errorResponse.put("message", message);

        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);
    }

    private String getErrorName(int status) {
        switch (status) {
            case HttpServletResponse.SC_UNAUTHORIZED:
                return "Unauthorized";
            case HttpServletResponse.SC_BAD_REQUEST:
                return "Bad Request";
            case HttpServletResponse.SC_FORBIDDEN:
                return "Forbidden";
            default:
                return "Error";
        }
    }
}