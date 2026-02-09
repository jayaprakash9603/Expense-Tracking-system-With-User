package com.jaya.controller;

import com.jaya.dto.*;
import com.jaya.service.KeyboardShortcutService;
import com.jaya.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;











@RestController
@RequestMapping("/api/shortcuts")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class KeyboardShortcutController {

    private final KeyboardShortcutService shortcutService;
    private final JwtUtil jwtUtil;

    




    @GetMapping
    public ResponseEntity<ShortcutsResponse> getUserShortcuts(HttpServletRequest request) {
        Long userId = extractUserId(request);
        log.debug("GET /api/shortcuts - userId: {}", userId);

        ShortcutsResponse response = shortcutService.getUserShortcuts(userId);
        return ResponseEntity.ok(response);
    }

    




    @PostMapping("/update")
    public ResponseEntity<ShortcutsResponse> updateShortcuts(
            HttpServletRequest request,
            @Valid @RequestBody UpdateShortcutsRequest updateRequest) {
        Long userId = extractUserId(request);
        log.info("POST /api/shortcuts/update - userId: {}, updates: {}",
                userId, updateRequest.getShortcuts().size());

        ShortcutsResponse response = shortcutService.updateShortcuts(userId, updateRequest);
        return ResponseEntity.ok(response);
    }

    




    @GetMapping("/recommendations")
    public ResponseEntity<RecommendationsResponse> getRecommendations(HttpServletRequest request) {
        Long userId = extractUserId(request);
        log.debug("GET /api/shortcuts/recommendations - userId: {}", userId);

        RecommendationsResponse response = shortcutService.getRecommendations(userId);
        return ResponseEntity.ok(response);
    }

    




    @PostMapping("/reset")
    public ResponseEntity<ShortcutsResponse> resetToDefaults(HttpServletRequest request) {
        Long userId = extractUserId(request);
        log.info("POST /api/shortcuts/reset - userId: {}", userId);

        ShortcutsResponse response = shortcutService.resetToDefaults(userId);
        return ResponseEntity.ok(response);
    }

    




    @PostMapping("/track")
    public ResponseEntity<Void> trackUsage(
            HttpServletRequest request,
            @RequestParam String actionId) {
        Long userId = extractUserId(request);
        log.debug("POST /api/shortcuts/track - userId: {}, actionId: {}", userId, actionId);

        shortcutService.trackUsage(userId, actionId);
        return ResponseEntity.ok().build();
    }

    




    @PostMapping("/recommendations/{actionId}/accept")
    public ResponseEntity<ShortcutsResponse> acceptRecommendation(
            HttpServletRequest request,
            @PathVariable String actionId) {
        Long userId = extractUserId(request);
        log.info("POST /api/shortcuts/recommendations/{}/accept - userId: {}", actionId, userId);

        
        UpdateShortcutsRequest updateRequest = UpdateShortcutsRequest.builder()
                .shortcuts(java.util.List.of(
                        UpdateShortcutsRequest.ShortcutUpdate.builder()
                                .actionId(actionId)
                                .enabled(true)
                                .build()))
                .build();

        ShortcutsResponse response = shortcutService.updateShortcuts(userId, updateRequest);
        return ResponseEntity.ok(response);
    }

    




    @PostMapping("/recommendations/{actionId}/reject")
    public ResponseEntity<ShortcutsResponse> rejectRecommendation(
            HttpServletRequest request,
            @PathVariable String actionId) {
        Long userId = extractUserId(request);
        log.info("POST /api/shortcuts/recommendations/{}/reject - userId: {}", actionId, userId);

        UpdateShortcutsRequest updateRequest = UpdateShortcutsRequest.builder()
                .shortcuts(java.util.List.of(
                        UpdateShortcutsRequest.ShortcutUpdate.builder()
                                .actionId(actionId)
                                .rejectRecommendation(true)
                                .build()))
                .build();

        ShortcutsResponse response = shortcutService.updateShortcuts(userId, updateRequest);
        return ResponseEntity.ok(response);
    }

    


    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization header is required");
        }

        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
}
