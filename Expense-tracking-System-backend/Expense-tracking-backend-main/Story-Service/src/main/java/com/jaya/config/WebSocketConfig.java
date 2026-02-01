package com.jaya.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Arrays;

/**
 * WebSocket Configuration for Real-time Story Updates
 * Enables STOMP over WebSocket for pushing story events to frontend
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:3001}")
    private String allowedOrigins;

    /**
     * Configure message broker for WebSocket communication
     * - /topic: for broadcast messages (global stories)
     * - /queue: for user-specific messages (targeted stories)
     * - /user: prefix for user-specific destinations
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple in-memory message broker
        config.enableSimpleBroker("/topic", "/queue");

        // Prefix for client-sent messages
        config.setApplicationDestinationPrefixes("/app");

        // Prefix for user-specific destinations
        config.setUserDestinationPrefix("/user");
    }

    /**
     * Register STOMP endpoints for WebSocket connections
     * Frontend connects to: ws://localhost:6010/ws-stories
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Primary endpoint for stories
        registry.addEndpoint("/ws-stories")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        // Alternative endpoint
        registry.addEndpoint("/stories-ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    /**
     * CORS configuration for WebSocket endpoints
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
