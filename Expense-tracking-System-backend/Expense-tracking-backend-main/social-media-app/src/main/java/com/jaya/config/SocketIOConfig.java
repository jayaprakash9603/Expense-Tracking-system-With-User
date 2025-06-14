package com.jaya.config;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class SocketIOConfig {

    @Value("${socketio.host:0.0.0.0}")
    private String host;

    @Value("${socketio.port:9999}")
    private int port;

    // Store connected users (userId -> socketId)
    private static final Map<Integer, String> connectedUsers = new ConcurrentHashMap<>();

    private SocketIOServer server;

    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname(host);
        config.setPort(port);
        config.setOrigin("*");

        // JWT Authentication for socket connections
        config.setAuthorizationListener(data -> {
            String token = data.getSingleUrlParam("token");
            System.out.println("Authorization attempt with token: " +
                    (token != null ? (token.length() > 20 ? token.substring(0, 20) + "..." : token) : "null"));

            if (token != null && !token.isEmpty()) {
                try {
                    // Validate JWT token
                    String email = JwtProvider.getEmailFromJwtToken(token);
                    if (email == null || email.isEmpty()) {
                        System.out.println("Invalid token: Email extraction failed");
                        return false;
                    }
                    return true;
                } catch (Exception e) {
                    System.out.println("Token validation error: " + e.getMessage());
                    e.printStackTrace(); // Log stack trace for debugging
                    return false;
                }
            }
            return false;
        });

        server = new SocketIOServer(config);

        // Handle connection events
        server.addConnectListener(new ConnectListener() {
            @Override
            public void onConnect(com.corundumstudio.socketio.SocketIOClient client) {
                String userId = client.getHandshakeData().getSingleUrlParam("userId");
                if (userId != null && !userId.isEmpty()) {
                    connectedUsers.put(Integer.parseInt(userId), client.getSessionId().toString());
                    System.out.println("Client connected: " + userId);
                }
            }
        });

        // Handle disconnection events
        server.addDisconnectListener(new DisconnectListener() {
            @Override
            public void onDisconnect(com.corundumstudio.socketio.SocketIOClient client) {
                String userId = client.getHandshakeData().getSingleUrlParam("userId");
                if (userId != null && !userId.isEmpty()) {
                    connectedUsers.remove(Integer.parseInt(userId));
                    System.out.println("Client disconnected: " + userId);
                }
            }
        });

        return server;
    }

    // Get socket client for a specific user
    public static com.corundumstudio.socketio.SocketIOClient getClientForUser(SocketIOServer server, Integer userId) {
        String socketId = connectedUsers.get(userId);
        if (socketId != null) {
            return server.getClient(java.util.UUID.fromString(socketId));
        }
        return null;
    }

    // Check if a user is connected
    public static boolean isUserConnected(Integer userId) {
        return connectedUsers.containsKey(userId);
    }

    // Get all connected users (for monitoring)
    public static Map<Integer, String> getConnectedUsers() {
        return new HashMap<>(connectedUsers);
    }

    @PreDestroy
    public void stopSocketIOServer() {
        if (server != null) {
            server.stop();
        }
    }
}