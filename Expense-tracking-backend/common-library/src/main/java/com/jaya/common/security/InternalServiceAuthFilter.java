package com.jaya.common.security;

import com.jaya.common.config.InternalServiceAuthProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.UrlPathHelper;

public class InternalServiceAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(InternalServiceAuthFilter.class);

    private final InternalServiceAuthProperties properties;
    private final UrlPathHelper pathHelper = new UrlPathHelper();

    public InternalServiceAuthFilter(InternalServiceAuthProperties properties) {
        this.properties = properties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!properties.isEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = pathHelper.getPathWithinApplication(request);
        if (!InternalServiceAuthSupport.isInternalPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String expectedToken = properties.resolveToken();
        if (expectedToken.isBlank()) {
            log.error("Rejected internal request because SERVICE_INTERNAL_TOKEN is not configured: {} {}",
                    request.getMethod(), path);
            writeError(response, HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "Internal service authentication is not configured");
            return;
        }

        String providedToken = request.getHeader(InternalServiceAuthSupport.SERVICE_TOKEN_HEADER);
        if (!expectedToken.equals(providedToken)) {
            log.warn("Rejected unauthorized internal request: {} {}", request.getMethod(), path);
            writeError(response, HttpServletResponse.SC_FORBIDDEN, "Forbidden");
            return;
        }

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "internal-service",
                null,
                AuthorityUtils.createAuthorityList(InternalServiceAuthSupport.ROLE_SERVICE)));
        filterChain.doFilter(request, response);
    }

    private static void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}
