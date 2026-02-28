package com.jaya.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * Intercepts WebSocket handshake to extract userId from headers and store in session attributes.
 */
public class UserIdHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        // Try query parameters first
        String query = request.getURI().getQuery();
        if (query != null) {
            for (String param : query.split("&")) {
                String[] parts = param.split("=");
                if (parts.length == 2 && "userId".equals(parts[0])) {
                    try {
                        Integer userId = Integer.parseInt(parts[1]);
                        attributes.put("userId", userId);
                        return true;
                    } catch (NumberFormatException ignored) {}
                }
            }
        }

        // Try headers if using servlet request
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            String userIdHeader = servletRequest.getServletRequest().getHeader("userId");
            if (userIdHeader != null) {
                try {
                    Integer userId = Integer.parseInt(userIdHeader);
                    attributes.put("userId", userId);
                    return true;
                } catch (NumberFormatException ignored) {}
            }
        }

        return true; // Allow connection even without userId (will be set in /app/connect)
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // No-op
    }
}
