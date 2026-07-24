package com.jaya.task.user.service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.task.user.service.modal.AccountStatus;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.service.UserProfileCacheService;
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
 * Blocks API access only for terminal / in-progress purge states.
 * During {@link AccountStatus#DELETION_PENDING} the user may sign in, use the
 * app, export data, and cancel deletion before the scheduled purge date.
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

    private final UserProfileCacheService userProfileCacheService;
    private final ObjectMapper objectMapper;
    private final UrlPathHelper pathHelper = new UrlPathHelper();

    static boolean shouldBlockAccess(AccountStatus status) {
        if (status == null || status == AccountStatus.ACTIVE || status == AccountStatus.DELETION_PENDING) {
            return false;
        }
        return status == AccountStatus.PURGING
                || status == AccountStatus.DELETED
                || status == AccountStatus.FAILED;
    }

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
        User user = email == null ? null : userProfileCacheService.getUserByEmail(email);
        if (user == null || !shouldBlockAccess(user.getAccountStatus())) {
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
        String message = status == AccountStatus.PURGING
                ? "Your account is being permanently deleted. Please try again later or contact support."
                : "This account is no longer available.";
        objectMapper.writeValue(response.getWriter(), Map.of(
                "error", "ACCOUNT_DELETION_IN_PROGRESS",
                "message", message,
                "accountStatus", status.name()
        ));
    }
}
