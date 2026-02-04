package com.jaya.repository;

import com.jaya.models.Story;
import com.jaya.models.enums.StoryStatus;
import com.jaya.models.enums.StoryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StoryRepository extends JpaRepository<Story, UUID> {

    // Find active stories for a user (global + user-specific)
    @Query("SELECT s FROM Story s WHERE s.status = :status " +
            "AND s.isDeleted = false " +
            "AND s.expiresAt > :now " +
            "AND (s.isGlobal = true OR s.targetUserId = :userId) " +
            "ORDER BY s.priority DESC, s.createdAt DESC")
    List<Story> findActiveStoriesForUser(
            @Param("status") StoryStatus status,
            @Param("userId") Integer userId,
            @Param("now") LocalDateTime now);

    // Find all active global stories
    @Query("SELECT s FROM Story s WHERE s.status = 'ACTIVE' " +
            "AND s.isDeleted = false " +
            "AND s.isGlobal = true " +
            "AND s.expiresAt > :now " +
            "ORDER BY s.priority DESC, s.createdAt DESC")
    List<Story> findActiveGlobalStories(@Param("now") LocalDateTime now);

    // Find stories by type and status
    List<Story> findByStoryTypeAndStatusAndIsDeletedFalse(StoryType type, StoryStatus status);

    // Find stories by status
    List<Story> findByStatusAndIsDeletedFalse(StoryStatus status);

    // Find expired stories that need status update
    @Query("SELECT s FROM Story s WHERE s.status = 'ACTIVE' " +
            "AND s.expiresAt <= :now " +
            "AND s.isDeleted = false")
    List<Story> findExpiredActiveStories(@Param("now") LocalDateTime now);

    // Find stories by reference (for deduplication)
    @Query("SELECT s FROM Story s WHERE s.referenceType = :refType " +
            "AND s.referenceId = :refId " +
            "AND s.storyType = :storyType " +
            "AND s.status IN ('CREATED', 'ACTIVE') " +
            "AND s.isDeleted = false")
    Optional<Story> findActiveByReference(
            @Param("refType") String refType,
            @Param("refId") String refId,
            @Param("storyType") StoryType storyType);

    // Find stories for specific user only
    List<Story> findByTargetUserIdAndStatusAndIsDeletedFalseOrderByPriorityDescCreatedAtDesc(
            Integer userId, StoryStatus status);

    // Admin queries
    Page<Story> findByIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);

    Page<Story> findByStatusAndIsDeletedFalseOrderByCreatedAtDesc(StoryStatus status, Pageable pageable);

    Page<Story> findByStoryTypeAndIsDeletedFalseOrderByCreatedAtDesc(StoryType type, Pageable pageable);

    // Bulk update expired stories
    @Modifying
    @Query("UPDATE Story s SET s.status = 'EXPIRED' " +
            "WHERE s.status = 'ACTIVE' " +
            "AND s.expiresAt <= :now")
    int bulkExpireStories(@Param("now") LocalDateTime now);

    // Count by status
    long countByStatusAndIsDeletedFalse(StoryStatus status);

    // Find by admin creator
    Page<Story> findByCreatedByAdminIdAndIsDeletedFalseOrderByCreatedAtDesc(
            Integer adminId, Pageable pageable);

    // Find archived stories older than a threshold
    List<Story> findByStatusAndCreatedAtBefore(StoryStatus status, LocalDateTime threshold);
}
