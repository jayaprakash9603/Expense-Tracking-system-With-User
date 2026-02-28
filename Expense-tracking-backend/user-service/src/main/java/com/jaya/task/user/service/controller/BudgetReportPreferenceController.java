package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.dto.BudgetReportPreferenceDTO;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.service.BudgetReportPreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;





@RestController
@RequestMapping("/api/user/budget-report-preferences")
public class BudgetReportPreferenceController {

    private final BudgetReportPreferenceService preferenceService;
    private final UserRepository userRepository;

    public BudgetReportPreferenceController(
            BudgetReportPreferenceService preferenceService,
            UserRepository userRepository) {
        this.preferenceService = preferenceService;
        this.userRepository = userRepository;
    }

    





    @GetMapping
    public ResponseEntity<BudgetReportPreferenceDTO> getPreferences(
            @RequestHeader("Authorization") String authHeader) {

        Integer userId = extractUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        BudgetReportPreferenceDTO preferences = preferenceService.getPreferences(userId);
        if (preferences == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(preferences);
    }

    






    @PostMapping
    public ResponseEntity<BudgetReportPreferenceDTO> savePreferences(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody String layoutConfig) {

        Integer userId = extractUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        BudgetReportPreferenceDTO saved = preferenceService.savePreferences(userId, layoutConfig);
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

            String email = com.jaya.task.user.service.config.JwtProvider.getEmailFromJwt(authHeader);

            if (email == null) {
                return null;
            }

            User user = userRepository.findByEmail(email);
            return user != null ? user.getId() : null;

        } catch (Exception e) {
            return null;
        }
    }
}
