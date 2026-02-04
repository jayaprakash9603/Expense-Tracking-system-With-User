package com.jaya.task.user.service.repository;

import com.jaya.task.user.service.model.BudgetReportPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for BudgetReportPreference entity.
 * Provides database operations for budget report layout preferences.
 */
@Repository
public interface BudgetReportPreferenceRepository extends JpaRepository<BudgetReportPreference, Long> {

    /**
     * Find budget report preference by user ID.
     * 
     * @param userId The user's ID
     * @return Optional containing the preference if found
     */
    Optional<BudgetReportPreference> findByUserId(Integer userId);

    /**
     * Delete budget report preference by user ID.
     * Used when resetting layout to defaults.
     * 
     * @param userId The user's ID
     */
    void deleteByUserId(Integer userId);
}
