package com.jaya.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Common JWT authentication filter.
 * Validates JWT tokens and sets up Spring Security context.
 * 
 * Bean is registered via CommonLibraryAutoConfiguration when:
 * - common-library.jwt.filter.enabled=true (opt-in)
 * - Spring Security is on the classpath
 */
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) 
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                if (jwtUtil.validateToken(token)) {
                    var claims = jwtUtil.extractAllClaims(token);
                    String email = claims.get("email", String.class);
                    String authorities = claims.get("authorities", String.class);
                    
                    List<SimpleGrantedAuthority> grantedAuthorities = Collections.emptyList();
                    if (authorities != null && !authorities.isEmpty()) {
                        grantedAuthorities = Arrays.stream(authorities.split(","))
                                .map(SimpleGrantedAuthority::new)
                                .collect(Collectors.toList());
                    }
                    
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(email, null, grantedAuthorities);
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("JWT authentication successful for user: {}", email);
                }
            } catch (Exception e) {
                log.warn("JWT authentication failed: {}", e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
