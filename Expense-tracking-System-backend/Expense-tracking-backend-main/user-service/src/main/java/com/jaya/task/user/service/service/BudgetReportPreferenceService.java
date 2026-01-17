package com.jaya.task.user.service.service;

import com.jaya.task.user.service.dto.BudgetReportPreferenceDTO;
import com.jaya.task.user.service.model.BudgetReportPreference;
import com.jaya.task.user.service.repository.BudgetReportPreferenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service for managing budget report layout preferences.
 * Follows the same pattern as other report preference services (DRY principle).
 */
@Service
public class BudgetReportPreferenceService {

    private final BudgetReportPreferenceRepository repository;

    /**
     * Default layout configuration for budget report.
     * This is returned when user has no saved preferences.
     */
    public static final String DEFAULT_LAYOUT_CONFIG = """
            [
                {"id":"overview-cards","name":"Overview Cards","visible":true,"type":"full"},
                {"id":"daily-spending","name":"Daily Spending Pattern","visible":true,"type":"full"},
                {"id":"recurring-expenses","name":"Top Recurring Expenses","visible":true,"type":"half"},
                {"id":"loss-gain-breakdown","name":"Loss/Gain Breakdown","visible":true,"type":"half"},
                {"id":"category-distribution","name":"Category Distribution","visible":true,"type":"full"},
                {"id":"payment-distribution","name":"Payment Method Distribution","visible":true,"type":"full"},
                {"id":"budget-overview-grid","name":"Budget Overview Grid","visible":true,"type":"full"},
                {"id":"budget-accordion","name":"Individual Budget Details","visible":true,"type":"full"}
            ]
            """;

    public BudgetReportPreferenceService(BudgetReportPreferenceRepository repository) {
        this.repository = repository;
    }

    /**
     * Get budget report preferences for a user.
     * Returns null if no preferences are saved (frontend will use defaults).
     *
     * @param userId The user's ID
     * @return DTO with preferences or null if not found
     */
    public BudgetReportPreferenceDTO getPreferences(Integer userId) {
        Optional<BudgetReportPreference> preference = repository.findByUserId(userId);
        return preference.map(this::toDTO).orElse(null);
    }

    /**
     * Save or update budget report preferences for a user.
     *
     * @param userId       The user's ID
     * @param layoutConfig JSON string containing layout configuration
     * @return DTO with saved preferences
     */
    @Transactional
    public BudgetReportPreferenceDTO savePreferences(Integer userId, String layoutConfig) {
        Optional<BudgetReportPreference> existing = repository.findByUserId(userId);

        BudgetReportPreference preference;
        if (existing.isPresent()) {
            preference = existing.get();
            preference.setLayoutConfig(layoutConfig);
        } else {
            preference = new BudgetReportPreference(userId, layoutConfig);
        }

        BudgetReportPreference saved = repository.save(preference);
        return toDTO(saved);
    }

    /**
     * Reset budget report preferences for a user (delete saved preferences).
     * Frontend will revert to default layout.
     *
     * @param userId The user's ID
     */
    @Transactional
    public void resetPreferences(Integer userId) {
        repository.deleteByUserId(userId);
    }

    /**
     * Convert entity to DTO.
     *
     * @param entity The entity to convert
     * @return DTO representation
     */
    private BudgetReportPreferenceDTO toDTO(BudgetReportPreference entity) {
        return new BudgetReportPreferenceDTO(
                entity.getId(),
                entity.getUserId(),
                entity.getLayoutConfig(),
                entity.getCreatedAt(),
                entity.getUpdatedAt());
    }
}
