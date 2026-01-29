package com.jaya.repository;

import com.jaya.models.SharedResource;
import com.jaya.models.SharedResourceType;
import jakarta.persistence.QueryHint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for SharedResource entity.
 * Provides methods for secure token lookup, expiry management, and user share
 * queries.
 */
@Repository
public interface SharedResourceRepository extends JpaRepository<SharedResource, Long> {

    /**
     * Find a shared resource by its secure token.
     * Used for validating share access.
     */
    @QueryHints({
            @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
            @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
    })
    Optional<SharedResource> findByShareToken(String shareToken);

    /**
     * Find active shared resource by token.
     * Most common lookup - validates token is active.
     */
    @Query("SELECT sr FROM SharedResource sr WHERE sr.shareToken = :token AND sr.isActive = true")
    @QueryHints({
            @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true")
    })
    Optional<SharedResource> findActiveByToken(@Param("token") String token);

    /**
     * Find all shares owned by a user.
     */
    @Query("SELECT sr FROM SharedResource sr WHERE sr.ownerUserId = :userId ORDER BY sr.createdAt DESC")
    List<SharedResource> findByOwnerUserId(@Param("userId") Integer userId);

    /**
     * Find all active shares owned by a user.
     */
    @Query("SELECT sr FROM SharedResource sr WHERE sr.ownerUserId = :userId AND sr.isActive = true ORDER BY sr.createdAt DESC")
    List<SharedResource> findActiveByOwnerUserId(@Param("userId") Integer userId);

    /**
     * Find shares by owner with pagination.
     */
    @Query("SELECT sr FROM SharedResource sr WHERE sr.ownerUserId = :userId ORDER BY sr.createdAt DESC")
    Page<SharedResource> findByOwnerUserIdPaged(@Param("userId") Integer userId, Pageable pageable);

    /**
     * Find all expired but still active shares.
     * Used by scheduled job to deactivate expired shares.
     */
    @Query("SELECT sr FROM SharedResource sr WHERE sr.isActive = true AND sr.expiresAt IS NOT NULL AND sr.expiresAt < :now")
    List<SharedResource> findExpiredActiveShares(@Param("now") LocalDateTime now);

    /**
     * Batch deactivate expired shares.
     * Returns count of updated rows.
     */
    @Modifying
    @Query("UPDATE SharedResource sr SET sr.isActive = false WHERE sr.isActive = true AND sr.expiresAt IS NOT NULL AND sr.expiresAt < :now")
    int deactivateExpiredShares(@Param("now") LocalDateTime now);

    /**
     * Check if a token already exists.
     * Used during token generation to ensure uniqueness.
     */
    boolean existsByShareToken(String shareToken);

    /**
     * Count active shares by owner.
     * Can be used for rate limiting.
     */
    @Query("SELECT COUNT(sr) FROM SharedResource sr WHERE sr.ownerUserId = :userId AND sr.isActive = true")
    long countActiveSharesByOwner(@Param("userId") Integer userId);

    /**
     * Count shares created by user in a time window.
     * Used for rate limiting share creation.
     */
    @Query("SELECT COUNT(sr) FROM SharedResource sr WHERE sr.ownerUserId = :userId AND sr.createdAt >= :since")
    long countSharesCreatedSince(@Param("userId") Integer userId, @Param("since") LocalDateTime since);

    /**
     * Find shares by resource type for a user.
     */
    @Query("SELECT sr FROM SharedResource sr WHERE sr.ownerUserId = :userId AND sr.resourceType = :type AND sr.isActive = true")
    List<SharedResource> findActiveByOwnerAndType(
            @Param("userId") Integer userId,
            @Param("type") SharedResourceType type);

    /**
     * Find a specific share by owner and token (for revocation).
     */
    @Query("SELECT sr FROM SharedResource sr WHERE sr.shareToken = :token AND sr.ownerUserId = :userId")
    Optional<SharedResource> findByTokenAndOwner(@Param("token") String token, @Param("userId") Integer userId);

    /**
     * Delete all shares for a user (for account deletion).
     */
    @Modifying
    @Query("DELETE FROM SharedResource sr WHERE sr.ownerUserId = :userId")
    void deleteAllByOwnerUserId(@Param("userId") Integer userId);

    /**
     * Get share statistics for a user.
     */
    @Query("SELECT COUNT(sr), SUM(sr.accessCount) FROM SharedResource sr WHERE sr.ownerUserId = :userId")
    Object[] getShareStatsByOwner(@Param("userId") Integer userId);
}
