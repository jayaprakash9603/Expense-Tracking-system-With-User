package com.jaya.repository;

import com.jaya.models.FriendActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for FriendActivity entities.
 * Provides data access methods for friend activity tracking.
 */
@Repository
public interface FriendActivityRepository extends JpaRepository<FriendActivity, Long> {

    /**
     * Find all activities for a specific target user, ordered by timestamp
     * descending.
     */
    List<FriendActivity> findByTargetUserIdOrderByTimestampDesc(Integer targetUserId);

    /**
     * Find all activities for a specific target user with pagination.
     */
    Page<FriendActivity> findByTargetUserIdOrderByTimestampDesc(Integer targetUserId, Pageable pageable);

    /**
     * Find unread activities for a specific target user.
     */
    List<FriendActivity> findByTargetUserIdAndIsReadFalseOrderByTimestampDesc(Integer targetUserId);

    /**
     * Find activities by target user and source service.
     */
    List<FriendActivity> findByTargetUserIdAndSourceServiceOrderByTimestampDesc(
            Integer targetUserId, FriendActivity.SourceService sourceService);

    /**
     * Find activities performed by a specific actor on a target user's account.
     */
    List<FriendActivity> findByTargetUserIdAndActorUserIdOrderByTimestampDesc(
            Integer targetUserId, Integer actorUserId);

    /**
     * Count unread activities for a user.
     */
    long countByTargetUserIdAndIsReadFalse(Integer targetUserId);

    /**
     * Mark all activities as read for a user.
     */
    @Modifying
    @Query("UPDATE FriendActivity fa SET fa.isRead = true WHERE fa.targetUserId = :targetUserId AND fa.isRead = false")
    int markAllAsReadForUser(@Param("targetUserId") Integer targetUserId);

    /**
     * Mark specific activity as read.
     */
    @Modifying
    @Query("UPDATE FriendActivity fa SET fa.isRead = true WHERE fa.id = :activityId")
    int markAsRead(@Param("activityId") Long activityId);

    /**
     * Find activities within a date range.
     */
    @Query("SELECT fa FROM FriendActivity fa WHERE fa.targetUserId = :targetUserId " +
            "AND fa.timestamp >= :startDate AND fa.timestamp <= :endDate " +
            "ORDER BY fa.timestamp DESC")
    List<FriendActivity> findByTargetUserIdAndTimestampBetween(
            @Param("targetUserId") Integer targetUserId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Delete old activities (for cleanup).
     */
    @Modifying
    @Query("DELETE FROM FriendActivity fa WHERE fa.timestamp < :cutoffDate")
    int deleteActivitiesOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);

    /**
     * Find recent activities for a user (last N days).
     */
    @Query("SELECT fa FROM FriendActivity fa WHERE fa.targetUserId = :targetUserId " +
            "AND fa.timestamp >= :since ORDER BY fa.timestamp DESC")
    List<FriendActivity> findRecentActivities(
            @Param("targetUserId") Integer targetUserId,
            @Param("since") LocalDateTime since);
}
