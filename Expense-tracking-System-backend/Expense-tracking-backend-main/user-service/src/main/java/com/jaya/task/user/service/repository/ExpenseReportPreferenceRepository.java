package com.jaya.task.user.service.repository;

import com.jaya.task.user.service.modal.ExpenseReportPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExpenseReportPreferenceRepository extends JpaRepository<ExpenseReportPreference, Long> {

    /**
     * Find expense report preference by user ID
     * 
     * @param userId User ID
     * @return Optional expense report preference
     */
    Optional<ExpenseReportPreference> findByUserId(Integer userId);

    /**
     * Check if expense report preference exists for user
     * 
     * @param userId User ID
     * @return true if exists
     */
    boolean existsByUserId(Integer userId);

    /**
     * Delete expense report preference by user ID
     * 
     * @param userId User ID
     */
    void deleteByUserId(Integer userId);
}
