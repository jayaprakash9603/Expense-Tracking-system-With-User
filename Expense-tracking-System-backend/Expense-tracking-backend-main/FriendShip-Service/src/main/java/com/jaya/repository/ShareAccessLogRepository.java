package com.jaya.repository;

import com.jaya.models.ShareAccessLog;
import com.jaya.models.SharedResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ShareAccessLog entity.
 * Tracks which users have accessed which shares.
 */
@Repository
public interface ShareAccessLogRepository extends JpaRepository<ShareAccessLog, Long> {

    /**
     * Find access log for a specific user and share.
     */
    Optional<ShareAccessLog> findByAccessingUserIdAndSharedResource(Integer accessingUserId,
            SharedResource sharedResource);

    /**
     * Find all shares accessed by a user.
     */
    @Query("SELECT sal FROM ShareAccessLog sal " +
            "JOIN FETCH sal.sharedResource sr " +
            "WHERE sal.accessingUserId = :userId " +
            "AND sr.ownerUserId != :userId " + // Exclude user's own shares
            "ORDER BY sal.lastAccessedAt DESC")
    List<ShareAccessLog> findByAccessingUserId(@Param("userId") Integer userId);

    /**
     * Find saved shares for a user.
     */
    @Query("SELECT sal FROM ShareAccessLog sal " +
            "JOIN FETCH sal.sharedResource sr " +
            "WHERE sal.accessingUserId = :userId " +
            "AND sal.isSaved = true " +
            "AND sr.ownerUserId != :userId " +
            "ORDER BY sal.lastAccessedAt DESC")
    List<ShareAccessLog> findSavedByAccessingUserId(@Param("userId") Integer userId);

    /**
     * Count how many unique users have accessed a share.
     */
    @Query("SELECT COUNT(DISTINCT sal.accessingUserId) FROM ShareAccessLog sal WHERE sal.sharedResource.id = :shareId")
    long countUniqueAccessorsByShareId(@Param("shareId") Long shareId);

    /**
     * Find all access logs for a specific share.
     */
    List<ShareAccessLog> findBySharedResourceId(Long shareId);

    /**
     * Delete all access logs for a share (when share is deleted).
     */
    void deleteBySharedResourceId(Long shareId);
}
