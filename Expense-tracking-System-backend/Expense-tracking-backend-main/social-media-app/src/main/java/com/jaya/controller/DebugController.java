package com.jaya.controller;

import com.jaya.config.JwtProvider;
import com.jaya.config.SocketIOConfig;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/debug")
public class DebugController {

    @GetMapping("/token")
    public ResponseEntity<Map<String, Object>> checkToken(@RequestParam String token) {
        Map<String, Object> response = new HashMap<>();

        try {
            // URL decode the token
            String decodedToken = URLDecoder.decode(token, StandardCharsets.UTF_8.toString());

            // Remove Bearer prefix if present
            if (decodedToken.startsWith("Bearer ")) {
                decodedToken = decodedToken.substring(7);
            }

            // Print token for debugging
            System.out.println("Checking token: " + decodedToken);

            String email = JwtProvider.getEmailFromJwtToken(decodedToken);
            response.put("valid", true);
            response.put("email", email);
        } catch (Exception e) {
            response.put("valid", false);
            response.put("error", e.getMessage());
            response.put("errorType", e.getClass().getName());
            e.printStackTrace(); // Print stack trace for debugging
        }

        return ResponseEntity.ok(response);
    }

    // Other methods remain the same
    @GetMapping("/socket/users")
    public ResponseEntity<Map<String, Object>> getConnectedUsers() {
        Map<String, Object> response = new HashMap<>();
        response.put("connectedUsers", SocketIOConfig.getConnectedUsers());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/socket/status/{userId}")
    public ResponseEntity<Map<String, Object>> getUserStatus(@PathVariable Integer userId) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("connected", SocketIOConfig.isUserConnected(userId));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Server is running");
    }

    // Add a new endpoint that accepts the token in the request body
    @PostMapping("/validate-token")
    public ResponseEntity<Map<String, Object>> validateTokenInBody(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        String token = request.get("token");

        try {
            // Remove Bearer prefix if present
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            String email = JwtProvider.getEmailFromJwtToken(token);
            response.put("valid", true);
            response.put("email", email);
        } catch (Exception e) {
            response.put("valid", false);
            response.put("error", e.getMessage());
            response.put("errorType", e.getClass().getName());
        }

        return ResponseEntity.ok(response);
    }
}