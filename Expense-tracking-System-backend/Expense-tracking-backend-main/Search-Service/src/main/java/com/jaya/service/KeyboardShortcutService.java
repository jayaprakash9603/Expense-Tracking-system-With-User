package com.jaya.service;

import com.jaya.dto.*;
import com.jaya.entity.KeyboardShortcut;
import com.jaya.repository.KeyboardShortcutRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing keyboard shortcuts.
 * 
 * Handles:
 * - User shortcut preferences (customizations, enabled/disabled)
 * - Conflict detection
 * - Usage tracking
 * - Recommendations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KeyboardShortcutService {

    private final KeyboardShortcutRepository repository;

    // Reserved shortcuts that cannot be customized
    private static final Set<String> RESERVED_KEYS = Set.of(
            "mod+t", "mod+w", "mod+q", "mod+n", "mod+c", "mod+v", "mod+x",
            "mod+z", "mod+a", "mod+s", "mod+p", "mod+f", "f12");

    // Destructive actions that should not get recommendations
    private static final Set<String> DESTRUCTIVE_ACTIONS = Set.of(
            "DELETE_EXPENSE", "DELETE_BUDGET", "DELETE_BILL", "DELETE_CATEGORY",
            "DELETE_PAYMENT_METHOD", "DELETE_ACCOUNT", "LOGOUT");

    /**
     * Get all shortcut configurations for a user.
     */
    @Transactional(readOnly = true)
    public ShortcutsResponse getUserShortcuts(Long userId) {
        log.debug("Fetching shortcuts for user: {}", userId);

        List<KeyboardShortcut> shortcuts = repository.findByUserId(userId);

        List<KeyboardShortcutDTO> dtos = shortcuts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        long customCount = repository.countByUserIdAndCustomKeysIsNotNull(userId);
        long disabledCount = repository.countByUserIdAndEnabledFalse(userId);
        long rejectedCount = repository.countByUserIdAndRecommendationRejectedTrue(userId);

        return ShortcutsResponse.builder()
                .success(true)
                .message("Shortcuts retrieved successfully")
                .shortcuts(dtos)
                .customCount((int) customCount)
                .disabledCount((int) disabledCount)
                .rejectedRecommendationsCount((int) rejectedCount)
                .build();
    }

    /**
     * Update shortcut configurations for a user.
     */
    @Transactional
    public ShortcutsResponse updateShortcuts(Long userId, UpdateShortcutsRequest request) {
        log.info("Updating shortcuts for user: {}, count: {}", userId, request.getShortcuts().size());

        List<String> errors = new ArrayList<>();
        List<KeyboardShortcut> updated = new ArrayList<>();

        for (UpdateShortcutsRequest.ShortcutUpdate update : request.getShortcuts()) {
            try {
                KeyboardShortcut shortcut = processUpdate(userId, update);
                if (shortcut != null) {
                    updated.add(shortcut);
                }
            } catch (IllegalArgumentException e) {
                errors.add(update.getActionId() + ": " + e.getMessage());
            }
        }

        if (!errors.isEmpty()) {
            log.warn("Some shortcut updates failed for user {}: {}", userId, errors);
        }

        List<KeyboardShortcutDTO> dtos = updated.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ShortcutsResponse.builder()
                .success(errors.isEmpty())
                .message(errors.isEmpty()
                        ? "Shortcuts updated successfully"
                        : "Some updates failed: " + String.join(", ", errors))
                .shortcuts(dtos)
                .customCount((int) repository.countByUserIdAndCustomKeysIsNotNull(userId))
                .disabledCount((int) repository.countByUserIdAndEnabledFalse(userId))
                .rejectedRecommendationsCount((int) repository.countByUserIdAndRecommendationRejectedTrue(userId))
                .build();
    }

    /**
     * Process a single shortcut update.
     */
    private KeyboardShortcut processUpdate(Long userId, UpdateShortcutsRequest.ShortcutUpdate update) {
        // Validate custom keys
        if (update.getCustomKeys() != null && !update.getCustomKeys().isBlank()) {
            String normalizedKeys = normalizeKeys(update.getCustomKeys());

            // Check reserved keys
            if (RESERVED_KEYS.contains(normalizedKeys)) {
                throw new IllegalArgumentException("This key combination is reserved by the browser");
            }

            // Check for conflicts with other shortcuts
            if (repository.existsByUserIdAndCustomKeysAndActionIdNot(
                    userId, normalizedKeys, update.getActionId())) {
                throw new IllegalArgumentException("This key combination is already in use");
            }
        }

        // Find or create the shortcut record
        KeyboardShortcut shortcut = repository
                .findByUserIdAndActionId(userId, update.getActionId())
                .orElseGet(() -> KeyboardShortcut.builder()
                        .userId(userId)
                        .actionId(update.getActionId())
                        .enabled(true)
                        .recommendationRejected(false)
                        .usageCount(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build());

        // Apply updates
        if (update.getCustomKeys() != null) {
            shortcut.setCustomKeys(
                    update.getCustomKeys().isBlank() ? null : normalizeKeys(update.getCustomKeys()));
        }

        if (update.getEnabled() != null) {
            shortcut.setEnabled(update.getEnabled());
        }

        if (update.getRejectRecommendation() != null && update.getRejectRecommendation()) {
            shortcut.setRecommendationRejected(true);
        }

        return repository.save(shortcut);
    }

    /**
     * Reset all shortcuts to defaults for a user.
     */
    @Transactional
    public ShortcutsResponse resetToDefaults(Long userId) {
        log.info("Resetting shortcuts to defaults for user: {}", userId);

        repository.deleteAllByUserId(userId);

        return ShortcutsResponse.builder()
                .success(true)
                .message("Shortcuts reset to defaults")
                .shortcuts(Collections.emptyList())
                .customCount(0)
                .disabledCount(0)
                .rejectedRecommendationsCount(0)
                .build();
    }

    /**
     * Track shortcut usage.
     */
    @Transactional
    public void trackUsage(Long userId, String actionId) {
        int updated = repository.incrementUsageCount(userId, actionId);

        if (updated == 0) {
            // Create a new record for tracking
            KeyboardShortcut shortcut = KeyboardShortcut.builder()
                    .userId(userId)
                    .actionId(actionId)
                    .enabled(true)
                    .recommendationRejected(false)
                    .usageCount(1)
                    .lastUsedAt(LocalDateTime.now())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            repository.save(shortcut);
        }
    }

    /**
     * Get shortcut recommendations for a user.
     */
    @Transactional(readOnly = true)
    public RecommendationsResponse getRecommendations(Long userId) {
        log.debug("Generating recommendations for user: {}", userId);

        // Get user's shortcuts with usage data
        List<KeyboardShortcut> userShortcuts = repository.findByUserId(userId);

        // Get rejected action IDs
        Set<String> rejectedActions = userShortcuts.stream()
                .filter(KeyboardShortcut::getRecommendationRejected)
                .map(KeyboardShortcut::getActionId)
                .collect(Collectors.toSet());

        // Get action usage counts
        Map<String, KeyboardShortcut> usageMap = userShortcuts.stream()
                .collect(Collectors.toMap(
                        KeyboardShortcut::getActionId,
                        s -> s,
                        (a, b) -> a));

        // Generate recommendations (this would be more sophisticated in production)
        List<ShortcutRecommendationDTO> recommendations = generateRecommendations(
                usageMap, rejectedActions);

        return RecommendationsResponse.builder()
                .success(true)
                .recommendations(recommendations)
                .totalPotential(recommendations.size() + rejectedActions.size())
                .rejectedCount(rejectedActions.size())
                .build();
    }

    /**
     * Generate shortcut recommendations based on usage patterns.
     */
    private List<ShortcutRecommendationDTO> generateRecommendations(
            Map<String, KeyboardShortcut> usageMap,
            Set<String> rejectedActions) {

        List<ShortcutRecommendationDTO> recommendations = new ArrayList<>();

        // Common actions that benefit from shortcuts
        Map<String, ShortcutRecommendationDTO> potentialRecommendations = Map.of(
                "NEW_EXPENSE", ShortcutRecommendationDTO.builder()
                        .actionId("NEW_EXPENSE")
                        .recommendedKeys("mod+shift+e")
                        .description("Create new expense")
                        .category("Expenses")
                        .reason("This is one of the most frequently used actions")
                        .estimatedTimeSaved(120)
                        .build(),
                "GO_DASHBOARD", ShortcutRecommendationDTO.builder()
                        .actionId("GO_DASHBOARD")
                        .recommendedKeys("g d")
                        .description("Go to Dashboard")
                        .category("Navigation")
                        .reason("Quick navigation saves time")
                        .estimatedTimeSaved(60)
                        .build(),
                "NEW_BUDGET", ShortcutRecommendationDTO.builder()
                        .actionId("NEW_BUDGET")
                        .recommendedKeys("mod+shift+b")
                        .description("Create new budget")
                        .category("Budgets")
                        .reason("Budgeting is a core feature")
                        .estimatedTimeSaved(90)
                        .build(),
                "OPEN_SEARCH", ShortcutRecommendationDTO.builder()
                        .actionId("OPEN_SEARCH")
                        .recommendedKeys("mod+k")
                        .description("Open universal search")
                        .category("Search")
                        .reason("Universal search is the fastest way to navigate")
                        .estimatedTimeSaved(180)
                        .build());

        for (Map.Entry<String, ShortcutRecommendationDTO> entry : potentialRecommendations.entrySet()) {
            String actionId = entry.getKey();

            // Skip if rejected or destructive
            if (rejectedActions.contains(actionId) || DESTRUCTIVE_ACTIONS.contains(actionId)) {
                continue;
            }

            KeyboardShortcut usage = usageMap.get(actionId);
            int usageCount = usage != null ? usage.getUsageCount() : 0;

            // Only recommend if usage count indicates frequent use (threshold: 5)
            if (usageCount >= 5) {
                ShortcutRecommendationDTO recommendation = entry.getValue();
                recommendation.setUiActionCount(usageCount);
                recommendation.setScore(calculateScore(usageCount, usage));
                recommendations.add(recommendation);
            }
        }

        // Sort by score descending
        recommendations.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        // Return top 5 recommendations
        return recommendations.stream()
                .limit(5)
                .collect(Collectors.toList());
    }

    /**
     * Calculate recommendation score.
     */
    private double calculateScore(int usageCount, KeyboardShortcut usage) {
        double frequencyScore = Math.min(usageCount / 50.0, 1.0);
        double recencyScore = 0.5;

        if (usage != null && usage.getLastUsedAt() != null) {
            long hoursAgo = java.time.Duration.between(
                    usage.getLastUsedAt(), LocalDateTime.now()).toHours();
            recencyScore = Math.pow(0.9, hoursAgo / 24.0);
        }

        return (0.6 * frequencyScore) + (0.4 * recencyScore);
    }

    /**
     * Normalize key combination to consistent format.
     */
    private String normalizeKeys(String keys) {
        if (keys == null)
            return null;

        return keys.toLowerCase()
                .replace("ctrl", "mod")
                .replace("cmd", "mod")
                .replace("meta", "mod")
                .replaceAll("\\s+", "")
                .trim();
    }

    /**
     * Convert entity to DTO.
     */
    private KeyboardShortcutDTO toDTO(KeyboardShortcut entity) {
        return KeyboardShortcutDTO.builder()
                .id(entity.getId())
                .actionId(entity.getActionId())
                .customKeys(entity.getCustomKeys())
                .enabled(entity.getEnabled())
                .recommendationRejected(entity.getRecommendationRejected())
                .usageCount(entity.getUsageCount())
                .lastUsedAt(entity.getLastUsedAt())
                .build();
    }
}
