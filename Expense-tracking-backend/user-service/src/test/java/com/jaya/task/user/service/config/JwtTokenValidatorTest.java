package com.jaya.task.user.service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtTokenValidatorTest {

    private JwtTokenValidator validator;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        validator = new JwtTokenValidator();
        SecurityContextHolder.clearContext();
    }

    @Nested
    class DoFilterInternal {

        @Test
        void setsAuthenticationForValidToken() throws Exception {
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    "test@example.com", null,
                    List.of(new SimpleGrantedAuthority("ROLE_USER")));
            String token = JwtProvider.generateToken(auth);

            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);

            validator.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
            assertThat(SecurityContextHolder.getContext().getAuthentication().getName())
                    .isEqualTo("test@example.com");
        }

        @Test
        void proceedsWithoutAuthenticationWhenNoHeader() throws Exception {
            when(request.getHeader("Authorization")).thenReturn(null);

            validator.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        void rejectsExpiredToken() throws Exception {
            String expiredToken = "Bearer eyJhbGciOiJIUzM4NCJ9.eyJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMDAwMSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiYXV0aG9yaXRpZXMiOiJST0xFX1VTRVIifQ.invalid";

            when(request.getHeader("Authorization")).thenReturn(expiredToken);

            StringWriter stringWriter = new StringWriter();
            when(response.getWriter()).thenReturn(new PrintWriter(stringWriter));

            validator.doFilterInternal(request, response, filterChain);

            verify(filterChain, never()).doFilter(request, response);
        }

        @Test
        void rejectsMalformedToken() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Bearer not.a.valid.jwt.token");

            StringWriter stringWriter = new StringWriter();
            when(response.getWriter()).thenReturn(new PrintWriter(stringWriter));

            validator.doFilterInternal(request, response, filterChain);

            verify(filterChain, never()).doFilter(request, response);
        }

        @Test
        void ignoresNonBearerAuthHeader() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz");

            validator.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
        }
    }
}
