package com.jaya.task.user.service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.task.user.service.modal.AccountStatus;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.UrlPathHelper;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

/**
 * Blocks normal API access for users whose account is in a non-ACTIVE state.
 * Only a narrow allow-list of endpoints (deletion status / cancel /
 * authentication / logout / admin-side flows) is permitted while a deletion
 * request is pending.
 */
@Component
@RequiredArgsConstructor
public class DeletionAccessBlockFilter extends OncePerRequestFilter {

    private static final Set<String> ALWAYS_ALLOWED_PREFIXES = Set.of(
            "/auth/",
            "/api/user/me/deletion-request",
            "/api/admin/",
            "/api/internal/"
    );

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final UrlPathHelper pathHelper = new UrlPathHelper();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || isServiceCaller(auth)) {
            filterChain.doFilter(request, response);
            return;
        }
        String path = pathHelper.getPathWithinApplication(request);
        for (String prefix : ALWAYS_ALLOWED_PREFIXES) {
            if (path != null && path.startsWith(prefix)) {
                filterChain.doFilter(request, response);
                return;
            }
        }
        String email = auth.getName();
        User user = email == null ? null : userRepository.findByEmail(email);
        if (user == null || user.getAccountStatus() == null || user.getAccountStatus() == AccountStatus.ACTIVE) {
            filterChain.doFilter(request, response);
            return;
        }
        respondBlocked(response, user.getAccountStatus());
    }

    private static boolean isServiceCaller(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_SERVICE".equals(a.getAuthority()));
    }

    private void respondBlocked(HttpServletResponse response, AccountStatus status) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), Map.of(
                "error", "ACCOUNT_DELETION_IN_PROGRESS",
                "message", "Your account is scheduled for deletion. Cancel the deletion request to restore access.",
                "accountStatus", status.name()
        ));
    }
}
