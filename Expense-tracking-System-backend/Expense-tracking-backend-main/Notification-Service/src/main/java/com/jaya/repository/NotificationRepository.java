package com.jaya.repository;

import com.jaya.modal.Notification;
import com.jaya.modal.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Integer userId);

    Page<Notification> findByUserIdOrderByCreatedAtDesc(Integer userId, Pageable pageable);

    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Integer userId);

    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Integer userId, NotificationType type);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.createdAt >= :fromDate ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndCreatedAtAfter(@Param("userId") Integer userId,
            @Param("fromDate") LocalDateTime fromDate);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.isRead = false")
    Long countUnreadNotifications(@Param("userId") Integer userId);

    List<Notification> findByIsSentFalseAndCreatedAtBefore(LocalDateTime dateTime);

    // ===== DEPRECATED - Use bulk operations below instead =====
    // These methods cause N+1 query problems (fetch all + individual deletes)
    @Deprecated
    void deleteByUserIdAndCreatedAtBefore(Integer userId, LocalDateTime dateTime);

    @Deprecated
    void deleteByUserId(Integer userId);
    // ===== END DEPRECATED =====

    // ===== OPTIMIZED BULK OPERATIONS =====
    // These methods execute as single SQL statements - no N+1 problem

    /**
     * Bulk delete all notifications for a user in a single SQL DELETE statement.
     * Replaces deleteByUserId() to fix N+1 query problem (200+ queries → 1 query).
     * 
     * @param userId the user ID
     * @return number of deleted notifications
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.userId = :userId")
    int bulkDeleteByUserId(@Param("userId") Integer userId);

    /**
     * Bulk delete old notifications in a single SQL DELETE statement.
     * Replaces deleteByUserIdAndCreatedAtBefore() to fix N+1 query problem.
     * 
     * @param userId   the user ID
     * @param dateTime the cutoff date
     * @return number of deleted notifications
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.userId = :userId AND n.createdAt < :dateTime")
    int bulkDeleteByUserIdAndCreatedAtBefore(@Param("userId") Integer userId,
            @Param("dateTime") LocalDateTime dateTime);

    /**
     * Bulk mark all unread notifications as read in a single SQL UPDATE statement.
     * Fixes N+1 query problem in markAllAsRead() (fetch all + individual updates →
     * 1 update).
     * 
     * @param userId the user ID
     * @param readAt the timestamp to set
     * @return number of updated notifications
     */
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.userId = :userId AND n.isRead = false")
    int bulkMarkAllAsRead(@Param("userId") Integer userId, @Param("readAt") LocalDateTime readAt);
    // ===== END OPTIMIZED BULK OPERATIONS =====

    // New methods for notification management
    Page<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(Integer userId, Boolean isRead, Pageable pageable);

    List<Notification> findByUserIdAndIsRead(Integer userId, Boolean isRead);

    Long countByUserIdAndIsRead(Integer userId, Boolean isRead);
}