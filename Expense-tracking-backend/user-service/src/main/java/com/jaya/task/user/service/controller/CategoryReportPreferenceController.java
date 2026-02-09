package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.dto.CategoryReportPreferenceDTO;
import com.jaya.task.user.service.service.CategoryReportPreferenceService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user/category-report-preferences")
@Validated
@RequiredArgsConstructor
@Slf4j
public class CategoryReportPreferenceController {

    private static final String ERROR_KEY = "error";
    private static final String MESSAGE_KEY = "message";
    private static final String PREFERENCE_KEY = "preference";

    private final CategoryReportPreferenceService categoryReportPreferenceService;

    



    @GetMapping
    public ResponseEntity<Object> getCategoryReportPreference(
            @RequestHeader("Authorization") String jwt) {

        try {
            CategoryReportPreferenceDTO preference = categoryReportPreferenceService
                    .getUserCategoryReportPreference(jwt);

            return ResponseEntity.ok(preference);

        } catch (RuntimeException e) {
            log.error("Error fetching category report preference", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to fetch category report preference: " + e.getMessage()));
        }
    }

    


    @PostMapping
    public ResponseEntity<Object> saveCategoryReportPreference(
            @RequestHeader("Authorization") String jwt,
            @RequestBody @NotBlank(message = "Layout configuration is required") String layoutConfig) {

        try {
            CategoryReportPreferenceDTO saved = categoryReportPreferenceService.saveCategoryReportPreference(jwt,
                    layoutConfig);

            return ResponseEntity.ok(Map.of(
                    MESSAGE_KEY, "Category report preference saved successfully",
                    PREFERENCE_KEY, saved));

        } catch (RuntimeException e) {
            log.error("Error saving category report preference", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to save category report preference: " + e.getMessage()));
        }
    }

    


    @DeleteMapping
    public ResponseEntity<Object> resetCategoryReportPreference(
            @RequestHeader("Authorization") String jwt) {

        try {
            categoryReportPreferenceService.resetCategoryReportPreference(jwt);

            return ResponseEntity.ok(Map.of(
                    MESSAGE_KEY, "Category report preference reset to default successfully"));

        } catch (RuntimeException e) {
            log.error("Error resetting category report preference", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to reset category report preference: " + e.getMessage()));
        }
    }
}
