package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.dto.BudgetReportPreferenceDTO;
import com.jaya.task.user.service.request.PreferenceSaveRequest;
import com.jaya.task.user.service.service.BudgetReportPreferenceService;
import com.jaya.task.user.service.service.UserProfileCacheService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;





@Deprecated
@RestController
@RequestMapping("/api/user/budget-report-preferences")
public class BudgetReportPreferenceController {

    private final BudgetReportPreferenceService preferenceService;
    private final UserProfileCacheService userProfileCacheService;

    public BudgetReportPreferenceController(
            BudgetReportPreferenceService preferenceService,
            UserProfileCacheService userProfileCacheService) {
        this.preferenceService = preferenceService;
        this.userProfileCacheService = userProfileCacheService;
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
            @Valid @RequestBody PreferenceSaveRequest request) {

        Integer userId = extractUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        BudgetReportPreferenceDTO saved = preferenceService.savePreferences(userId, request.getLayoutConfig());
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
        return userProfileCacheService.resolveUserId(authHeader);
    }
}
