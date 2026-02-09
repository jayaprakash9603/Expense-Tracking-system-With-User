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

    
    @Query("SELECT s FROM Story s WHERE s.status = :status " +
            "AND s.isDeleted = false " +
            "AND s.expiresAt > :now " +
            "AND (s.isGlobal = true OR s.targetUserId = :userId) " +
            "ORDER BY s.priority DESC, s.createdAt DESC")
    List<Story> findActiveStoriesForUser(
            @Param("status") StoryStatus status,
            @Param("userId") Integer userId,
            @Param("now") LocalDateTime now);

    
    @Query("SELECT s FROM Story s WHERE s.status = 'ACTIVE' " +
            "AND s.isDeleted = false " +
            "AND s.isGlobal = true " +
            "AND s.expiresAt > :now " +
            "ORDER BY s.priority DESC, s.createdAt DESC")
    List<Story> findActiveGlobalStories(@Param("now") LocalDateTime now);

    
    List<Story> findByStoryTypeAndStatusAndIsDeletedFalse(StoryType type, StoryStatus status);

    
    List<Story> findByStatusAndIsDeletedFalse(StoryStatus status);

    
    @Query("SELECT s FROM Story s WHERE s.status = 'ACTIVE' " +
            "AND s.expiresAt <= :now " +
            "AND s.isDeleted = false")
    List<Story> findExpiredActiveStories(@Param("now") LocalDateTime now);

    
    @Query("SELECT s FROM Story s WHERE s.referenceType = :refType " +
            "AND s.referenceId = :refId " +
            "AND s.storyType = :storyType " +
            "AND s.status IN ('CREATED', 'ACTIVE') " +
            "AND s.isDeleted = false")
    Optional<Story> findActiveByReference(
            @Param("refType") String refType,
            @Param("refId") String refId,
            @Param("storyType") StoryType storyType);

    
    List<Story> findByTargetUserIdAndStatusAndIsDeletedFalseOrderByPriorityDescCreatedAtDesc(
            Integer userId, StoryStatus status);

    
    Page<Story> findByIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);

    Page<Story> findByStatusAndIsDeletedFalseOrderByCreatedAtDesc(StoryStatus status, Pageable pageable);

    Page<Story> findByStoryTypeAndIsDeletedFalseOrderByCreatedAtDesc(StoryType type, Pageable pageable);

    
    @Modifying
    @Query("UPDATE Story s SET s.status = 'EXPIRED' " +
            "WHERE s.status = 'ACTIVE' " +
            "AND s.expiresAt <= :now")
    int bulkExpireStories(@Param("now") LocalDateTime now);

    
    long countByStatusAndIsDeletedFalse(StoryStatus status);

    
    Page<Story> findByCreatedByAdminIdAndIsDeletedFalseOrderByCreatedAtDesc(
            Integer adminId, Pageable pageable);

    
    List<Story> findByStatusAndCreatedAtBefore(StoryStatus status, LocalDateTime threshold);
}
