package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.dto.BillReportPreferenceDTO;
import com.jaya.task.user.service.request.PreferenceSaveRequest;
import com.jaya.task.user.service.service.BillReportPreferenceService;
import com.jaya.task.user.service.service.UserProfileCacheService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;





@Deprecated
@RestController
@RequestMapping("/api/user/bill-report-preferences")
public class BillReportPreferenceController {

    private final BillReportPreferenceService preferenceService;
    private final UserProfileCacheService userProfileCacheService;

    public BillReportPreferenceController(
            BillReportPreferenceService preferenceService,
            UserProfileCacheService userProfileCacheService) {
        this.preferenceService = preferenceService;
        this.userProfileCacheService = userProfileCacheService;
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
            @Valid @RequestBody PreferenceSaveRequest request) {

        Integer userId = extractUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        BillReportPreferenceDTO saved = preferenceService.savePreferences(userId, request.getLayoutConfig());
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
