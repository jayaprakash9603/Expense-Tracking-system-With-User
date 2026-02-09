package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.dto.BillReportPreferenceDTO;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.service.BillReportPreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;





@RestController
@RequestMapping("/api/user/bill-report-preferences")
public class BillReportPreferenceController {

    private final BillReportPreferenceService preferenceService;
    private final UserRepository userRepository;

    public BillReportPreferenceController(
            BillReportPreferenceService preferenceService,
            UserRepository userRepository) {
        this.preferenceService = preferenceService;
        this.userRepository = userRepository;
    }

    





    @GetMapping
    public ResponseEntity<BillReportPreferenceDTO> getPreferences(
            @RequestHeader("Authorization") String authHeader) {

        Integer userId = extractUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        BillReportPreferenceDTO preferences = preferenceService.getPreferences(userId);
        if (preferences == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(preferences);
    }

    






    @PostMapping
    public ResponseEntity<BillReportPreferenceDTO> savePreferences(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody String layoutConfig) {

        Integer userId = extractUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        BillReportPreferenceDTO saved = preferenceService.savePreferences(userId, layoutConfig);
        return ResponseEntity.ok(saved);
    }

    






    @DeleteMapping
    public ResponseEntity<Void> resetPreferences(
            @RequestHeader("Authorization") String authHeader) {

        Integer userId = extractUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        preferenceService.resetPreferences(userId);
        return ResponseEntity.noContent().build();
    }

    






    private Integer extractUserId(String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return null;
            }
            String email = JwtProvider.getEmailFromJwt(authHeader);
            if (email == null) {
                return null;
            }
            com.jaya.task.user.service.modal.User user = userRepository.findByEmail(email);
            return user != null ? user.getId() : null;
        } catch (Exception e) {
            return null;
        }
    }
}
