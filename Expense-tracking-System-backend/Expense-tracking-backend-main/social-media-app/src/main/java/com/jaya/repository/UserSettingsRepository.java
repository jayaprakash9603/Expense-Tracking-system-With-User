package com.jaya.repository;

import com.jaya.models.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * UserSettingsRepository - Data Access Layer for UserSettings
 * 
 * Design Pattern: Repository Pattern
 * Purpose: Abstracts data access logic from business logic
 * Benefits:
 * - Centralized data access
 * - Easy to test with mocks
 * - Database agnostic business logic
 * - Query optimization in one place
 */
@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {

    /**
     * Find user settings by user ID
     * Uses indexed query for performance
     * 
     * @param userId The user ID
     * @return Optional containing UserSettings if found
     */
    @Query("SELECT us FROM UserSettings us WHERE us.userId = :userId")
    Optional<UserSettings> findByUserId(@Param("userId") Integer userId);

    /**
     * Check if settings exist for a user
     * Optimized query that only checks existence
     * 
     * @param userId The user ID
     * @return true if settings exist, false otherwise
     */
    @Query("SELECT CASE WHEN COUNT(us) > 0 THEN true ELSE false END FROM UserSettings us WHERE us.userId = :userId")
    boolean existsByUserId(@Param("userId") Integer userId);

    /**
     * Delete settings by user ID
     * Used when deleting a user account
     * 
     * @param userId The user ID
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM UserSettings us WHERE us.userId = :userId")
    void deleteByUserId(@Param("userId") Integer userId);

    /**
     * Find all users with a specific theme mode
     * Useful for analytics or targeted notifications
     * 
     * @param themeMode The theme mode (dark/light)
     * @return List of UserSettings
     */
    @Query("SELECT us FROM UserSettings us WHERE us.themeMode = :themeMode")
    java.util.List<UserSettings> findByThemeMode(@Param("themeMode") String themeMode);

    /**
     * Find all users with email notifications enabled
     * Used for batch email processing
     * 
     * @return List of UserSettings
     */
    @Query("SELECT us FROM UserSettings us WHERE us.emailNotifications = true")
    java.util.List<UserSettings> findUsersWithEmailNotificationsEnabled();

    /**
     * Find all users with weekly reports enabled
     * Used for scheduled report generation
     * 
     * @return List of UserSettings
     */
    @Query("SELECT us FROM UserSettings us WHERE us.weeklyReports = true")
    java.util.List<UserSettings> findUsersWithWeeklyReportsEnabled();
}
