package com.jaya.repository;

import com.jaya.models.UserAddedSharedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Repository for tracking user-added shared items.
 */
@Repository
public interface UserAddedSharedItemRepository extends JpaRepository<UserAddedSharedItem, Long> {

    /**
     * Find all items a user has added from a specific share.
     */
    List<UserAddedSharedItem> findByUserIdAndShareToken(Integer userId, String shareToken);

    /**
     * Find all items a user has added across all shares.
     */
    List<UserAddedSharedItem> findByUserId(Integer userId);

    /**
     * Check if user has already added a specific item from a share.
     */
    boolean existsByUserIdAndShareTokenAndExternalRef(Integer userId, String shareToken, String externalRef);

    /**
     * Find a specific added item.
     */
    Optional<UserAddedSharedItem> findByUserIdAndShareTokenAndExternalRef(
            Integer userId, String shareToken, String externalRef);

    /**
     * Get set of external refs that user has added from a share.
     */
    @Query("SELECT u.externalRef FROM UserAddedSharedItem u WHERE u.userId = :userId AND u.shareToken = :shareToken")
    Set<String> findExternalRefsByUserIdAndShareToken(
            @Param("userId") Integer userId,
            @Param("shareToken") String shareToken);

    /**
     * Count items added by user from a share.
     */
    long countByUserIdAndShareToken(Integer userId, String shareToken);

    /**
     * Delete all tracking records for a share (when share is revoked).
     */
    void deleteByShareToken(String shareToken);

    /**
     * Delete user's tracking record for a specific item.
     */
    void deleteByUserIdAndShareTokenAndExternalRef(Integer userId, String shareToken, String externalRef);
}
