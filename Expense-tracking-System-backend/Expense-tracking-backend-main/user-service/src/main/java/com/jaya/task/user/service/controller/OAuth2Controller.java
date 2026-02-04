package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.request.GoogleAuthRequest;
import com.jaya.task.user.service.response.AuthResponse;
import com.jaya.task.user.service.service.OAuth2Service;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for OAuth2 authentication endpoints.
 * Handles Google Sign-In and other OAuth providers.
 */
@RestController
@RequestMapping("/auth/oauth2")
@Validated
@Slf4j
public class OAuth2Controller {

    @Autowired
    private OAuth2Service oAuth2Service;

    /**
     * Authenticates a user using Google OAuth2.
     * Accepts Google user info from the frontend and returns a JWT.
     *
     * @param request Contains the Google user info (email, name, picture, etc.)
     * @return AuthResponse with JWT token on success
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> authenticateWithGoogle(
            @Valid @RequestBody GoogleAuthRequest request) {

        log.info("Received Google authentication request for email: {}", request.getEmail());

        AuthResponse response = oAuth2Service.authenticateWithGoogle(request);

        if (response.isStatus()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    /**
     * Health check endpoint for OAuth2 service.
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("OAuth2 service is running");
    }
}
