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

@Repository
public interface FriendActivityRepository extends JpaRepository<FriendActivity, Long> {
        List<FriendActivity> findByTargetUserIdOrderByTimestampDesc(Integer targetUserId);

        Page<FriendActivity> findByTargetUserIdOrderByTimestampDesc(Integer targetUserId, Pageable pageable);

        List<FriendActivity> findByTargetUserIdAndIsReadFalseOrderByTimestampDesc(Integer targetUserId);

        List<FriendActivity> findByTargetUserIdAndSourceServiceOrderByTimestampDesc(
                        Integer targetUserId, FriendActivity.SourceService sourceService);

        List<FriendActivity> findByTargetUserIdAndActorUserIdOrderByTimestampDesc(
                        Integer targetUserId, Integer actorUserId);

        long countByTargetUserIdAndIsReadFalse(Integer targetUserId);

        @Modifying
        @Query("UPDATE FriendActivity fa SET fa.isRead = true WHERE fa.targetUserId = :targetUserId AND fa.isRead = false")
        int markAllAsReadForUser(@Param("targetUserId") Integer targetUserId);

        @Modifying
        @Query("UPDATE FriendActivity fa SET fa.isRead = true WHERE fa.id = :activityId")
        int markAsRead(@Param("activityId") Long activityId);

        @Query("SELECT fa FROM FriendActivity fa WHERE fa.targetUserId = :targetUserId " +
                        "AND fa.timestamp >= :startDate AND fa.timestamp <= :endDate " +
                        "ORDER BY fa.timestamp DESC")
        List<FriendActivity> findByTargetUserIdAndTimestampBetween(
                        @Param("targetUserId") Integer targetUserId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Modifying
        @Query("DELETE FROM FriendActivity fa WHERE fa.timestamp < :cutoffDate")
        int deleteActivitiesOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);

        @Query("SELECT fa FROM FriendActivity fa WHERE fa.targetUserId = :targetUserId " +
                        "AND fa.timestamp >= :since ORDER BY fa.timestamp DESC")
        List<FriendActivity> findRecentActivities(
                        @Param("targetUserId") Integer targetUserId,
                        @Param("since") LocalDateTime since);
}
