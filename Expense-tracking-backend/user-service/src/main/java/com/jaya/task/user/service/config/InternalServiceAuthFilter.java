package com.jaya.task.user.service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.UrlPathHelper;

import java.io.IOException;
import java.util.Set;

@Component
public class InternalServiceAuthFilter extends OncePerRequestFilter {

    private static final String SERVICE_TOKEN_HEADER = "X-Service-Token";

    private static final Set<String> SERVICE_TOKEN_PATHS = Set.of(
            "/api/user/all",
            "/api/user/email",
            "/api/user/by-email");

    private final UrlPathHelper pathHelper = new UrlPathHelper();

    @Value("${USER_SERVICE_INTERNAL_TOKEN:}")
    private String expectedServiceToken;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = pathHelper.getPathWithinApplication(request);
        if (!"GET".equalsIgnoreCase(request.getMethod()) || !SERVICE_TOKEN_PATHS.contains(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        if (expectedServiceToken == null || expectedServiceToken.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        String provided = request.getHeader(SERVICE_TOKEN_HEADER);
        if (expectedServiceToken.equals(provided)) {
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    "internal-service",
                    null,
                    AuthorityUtils.createAuthorityList("ROLE_SERVICE"));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }
}
