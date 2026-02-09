package com.jaya.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

/**
 * Custom handshake handler that sets the user Principal from the userId header or query param.
 * This allows convertAndSendToUser to route messages correctly.
 */
public class CustomHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler,
                                       Map<String, Object> attributes) {
        String userId = null;

        // Try to get userId from query parameters
        String query = request.getURI().getQuery();
        if (query != null) {
            for (String param : query.split("&")) {
                String[] parts = param.split("=");
                if (parts.length == 2 && "userId".equals(parts[0])) {
                    userId = parts[1];
                    break;
                }
            }
        }

        // Try to get from attributes (set by interceptor)
        if (userId == null && attributes.containsKey("userId")) {
            Object userIdObj = attributes.get("userId");
            userId = userIdObj != null ? userIdObj.toString() : null;
        }

        // Fallback: try servlet request headers
        if (userId == null && request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            userId = servletRequest.getServletRequest().getHeader("userId");
        }

        if (userId != null) {
            final String finalUserId = userId;
            return () -> finalUserId;
        }

        return super.determineUser(request, wsHandler, attributes);
    }
}
