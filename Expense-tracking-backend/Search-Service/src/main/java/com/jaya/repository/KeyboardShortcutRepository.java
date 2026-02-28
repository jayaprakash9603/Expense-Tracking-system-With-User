package com.jaya.repository;

import com.jaya.entity.KeyboardShortcut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;




@Repository
public interface KeyboardShortcutRepository extends JpaRepository<KeyboardShortcut, Long> {

    


    List<KeyboardShortcut> findByUserId(Long userId);

    


    Optional<KeyboardShortcut> findByUserIdAndActionId(Long userId, String actionId);

    


    List<KeyboardShortcut> findByUserIdAndEnabledTrue(Long userId);

    


    List<KeyboardShortcut> findByUserIdAndEnabledFalse(Long userId);

    


    List<KeyboardShortcut> findByUserIdAndCustomKeysIsNotNull(Long userId);

    


    List<KeyboardShortcut> findByUserIdAndRecommendationRejectedTrue(Long userId);

    


    boolean existsByUserIdAndCustomKeysAndActionIdNot(Long userId, String customKeys, String actionId);

    


    long countByUserIdAndCustomKeysIsNotNull(Long userId);

    


    long countByUserIdAndEnabledFalse(Long userId);

    


    long countByUserIdAndRecommendationRejectedTrue(Long userId);

    


    @Modifying
    @Query("DELETE FROM KeyboardShortcut k WHERE k.userId = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);

    


    @Modifying
    @Query("UPDATE KeyboardShortcut k SET k.usageCount = k.usageCount + 1, k.lastUsedAt = CURRENT_TIMESTAMP WHERE k.userId = :userId AND k.actionId = :actionId")
    int incrementUsageCount(@Param("userId") Long userId, @Param("actionId") String actionId);

    


    @Query("SELECT k FROM KeyboardShortcut k WHERE k.userId = :userId ORDER BY k.usageCount DESC")
    List<KeyboardShortcut> findTopUsedByUserId(@Param("userId") Long userId);
}
