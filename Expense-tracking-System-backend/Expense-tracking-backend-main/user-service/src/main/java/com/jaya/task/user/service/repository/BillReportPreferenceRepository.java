package com.jaya.task.user.service.repository;

import com.jaya.task.user.service.model.BillReportPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for BillReportPreference entity.
 * Provides database operations for bill report layout preferences.
 */
@Repository
public interface BillReportPreferenceRepository extends JpaRepository<BillReportPreference, Long> {

    /**
     * Find bill report preference by user ID.
     * 
     * @param userId The user's ID
     * @return Optional containing the preference if found
     */
    Optional<BillReportPreference> findByUserId(Integer userId);

    /**
     * Delete bill report preference by user ID.
     * Used when resetting layout to defaults.
     * 
     * @param userId The user's ID
     */
    void deleteByUserId(Integer userId);
}
