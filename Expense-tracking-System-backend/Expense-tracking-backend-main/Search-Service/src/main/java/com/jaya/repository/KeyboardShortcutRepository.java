package com.jaya.repository;

import com.jaya.entity.KeyboardShortcut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for keyboard shortcut persistence operations.
 */
@Repository
public interface KeyboardShortcutRepository extends JpaRepository<KeyboardShortcut, Long> {

    /**
     * Find all shortcuts for a user
     */
    List<KeyboardShortcut> findByUserId(Long userId);

    /**
     * Find a specific shortcut by user and action
     */
    Optional<KeyboardShortcut> findByUserIdAndActionId(Long userId, String actionId);

    /**
     * Find all enabled shortcuts for a user
     */
    List<KeyboardShortcut> findByUserIdAndEnabledTrue(Long userId);

    /**
     * Find all disabled shortcuts for a user
     */
    List<KeyboardShortcut> findByUserIdAndEnabledFalse(Long userId);

    /**
     * Find shortcuts with custom keys for a user
     */
    List<KeyboardShortcut> findByUserIdAndCustomKeysIsNotNull(Long userId);

    /**
     * Find rejected recommendations for a user
     */
    List<KeyboardShortcut> findByUserIdAndRecommendationRejectedTrue(Long userId);

    /**
     * Check if a custom key combination is already in use by the user
     */
    boolean existsByUserIdAndCustomKeysAndActionIdNot(Long userId, String customKeys, String actionId);

    /**
     * Count shortcuts with custom keys for a user
     */
    long countByUserIdAndCustomKeysIsNotNull(Long userId);

    /**
     * Count disabled shortcuts for a user
     */
    long countByUserIdAndEnabledFalse(Long userId);

    /**
     * Count rejected recommendations for a user
     */
    long countByUserIdAndRecommendationRejectedTrue(Long userId);

    /**
     * Delete all shortcuts for a user (reset to defaults)
     */
    @Modifying
    @Query("DELETE FROM KeyboardShortcut k WHERE k.userId = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);

    /**
     * Increment usage count for a shortcut
     */
    @Modifying
    @Query("UPDATE KeyboardShortcut k SET k.usageCount = k.usageCount + 1, k.lastUsedAt = CURRENT_TIMESTAMP WHERE k.userId = :userId AND k.actionId = :actionId")
    int incrementUsageCount(@Param("userId") Long userId, @Param("actionId") String actionId);

    /**
     * Get top used shortcuts for a user
     */
    @Query("SELECT k FROM KeyboardShortcut k WHERE k.userId = :userId ORDER BY k.usageCount DESC")
    List<KeyboardShortcut> findTopUsedByUserId(@Param("userId") Long userId);
}
