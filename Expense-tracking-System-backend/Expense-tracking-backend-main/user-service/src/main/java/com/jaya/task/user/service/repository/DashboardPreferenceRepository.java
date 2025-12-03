package com.jaya.task.user.service.repository;

import com.jaya.task.user.service.modal.DashboardPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DashboardPreferenceRepository extends JpaRepository<DashboardPreference, Long> {

    /**
     * Find dashboard preference by user ID
     * 
     * @param userId User ID
     * @return Optional dashboard preference
     */
    Optional<DashboardPreference> findByUserId(Integer userId);

    /**
     * Check if dashboard preference exists for user
     * 
     * @param userId User ID
     * @return true if exists
     */
    boolean existsByUserId(Integer userId);

    /**
     * Delete dashboard preference by user ID
     * 
     * @param userId User ID
     */
    void deleteByUserId(Integer userId);
}
