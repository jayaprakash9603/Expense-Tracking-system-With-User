package com.jaya.common.security;

import com.jaya.common.config.InternalServiceAuthProperties;
import jakarta.servlet.ServletException;
import java.io.IOException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;

class InternalServiceAuthFilterTest {

    private InternalServiceAuthProperties properties;
    private InternalServiceAuthFilter filter;

    @BeforeEach
    void setUp() {
        properties = new InternalServiceAuthProperties();
        properties.setToken("test-internal-token");
        filter = new InternalServiceAuthFilter(properties);
    }

    @Test
    void rejectsInternalPathWithoutServiceToken() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET",
                "/api/expenses/internal/get-by-id");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertEquals(403, response.getStatus());
    }

    @Test
    void allowsInternalPathWithValidServiceToken() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET",
                "/api/expenses/internal/get-by-id");
        request.addHeader(InternalServiceAuthSupport.SERVICE_TOKEN_HEADER, "test-internal-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertEquals(200, response.getStatus());
    }

    @Test
    void allowsPublicPathWithoutServiceToken() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET",
                "/api/expenses/summary-expenses");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertEquals(200, response.getStatus());
    }
}
